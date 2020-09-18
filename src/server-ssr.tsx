import * as React from "react";
import { ApolloProvider, useQuery } from "@apollo/react-hooks";
import { getDataFromTree } from "@apollo/react-ssr";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import fetch from "node-fetch";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

import server from "./server-gql";

const query_light= gql`
query {
  products(count: 2) {
    id,
    price,
  }
}
`;

const query_heavy = gql`
query {
  products(count: 2) {
    id,
    price,
    relatedProducts(count: 2) {
      id,
      price,
      relatedProducts(count: 2) {
        id,
        price,
        relatedProducts(count: 2) {
          id,
          price,
          relatedProducts(count: 2) {
            id,
            price,
            relatedProducts(count: 2) {
              id,
              price,
              relatedProducts(count: 2) {
                id,
              }
            }
          }
        }
      }
    }
  }
}
`;

const query = query_light;
// const query = query_heavy;

const MyQuery: React.FunctionComponent = () => {
  const { loading, data } = useQuery(query);
  return (
    <div>
      loading: {!!loading}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const pageRender = async (): Promise<void> => {
  const client = new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: "http://localhost:4000/graphql",
      fetch: fetch as any,
    }),
    cache: new InMemoryCache({ resultCaching: false }),
  });

  const App = (
    <ApolloProvider client={client}>
      <MyQuery />
    </ApolloProvider>
  );

  if (process.env.SSR) {
    await getDataFromTree(App);
  }
};

(async () => {
  await new Promise((resolve) => {
    server.on('listening', resolve);
  });

  const iterations = parseInt(process.env.ITERATIONS || '10000', 10) || 10000;

  try {
    for (let i = 0; i < iterations; i += 1) {
      if (i > 0 && i % 1000 === 0) {
        console.log(`Completed ${i} iterations`);
      }

      await pageRender();
    }
  } catch (err) {
    console.error(err);
  }

  await new Promise((resolve) => {
    server.close(resolve);
  });

  global.gc();

  const heapSize = process.memoryUsage().heapUsed;
  console.log('Heap Size:', heapSize);
})();
