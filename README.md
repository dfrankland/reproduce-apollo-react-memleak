# Reproduce react-apollo memory leak

To reproduce <https://github.com/apollographql/react-apollo/issues/2126>.

## To Run

### Install and build apps

```sh
yarn --pure-lockfile
yarn build
```

### Run 100,000 iterations with SSR

```sh
env ITERATIONS=100000 SSR=true yarn start
```

### Run 100,000 iterations without SSR

```sh
env ITERATIONS=100000 yarn start
```
