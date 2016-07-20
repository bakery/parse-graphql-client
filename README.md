# GraphQL client for apps using Parse Server

[![Travis build status](http://img.shields.io/travis/thebakeryio/parse-graphql-client.svg?style=flat)](https://travis-ci.org/thebakeryio/parse-graphql-client)
[![Code Climate](https://codeclimate.com/github/thebakeryio/parse-graphql-client/badges/gpa.svg)](https://codeclimate.com/github/thebakeryio/parse-graphql-client)
[![Test Coverage](https://codeclimate.com/github/thebakeryio/parse-graphql-client/badges/coverage.svg)](https://codeclimate.com/github/thebakeryio/parse-graphql-client/coverage)
[![Dependency Status](https://david-dm.org/thebakeryio/parse-graphql-client.svg)](https://david-dm.org/thebakeryio/parse-graphql-client)
[![devDependency Status](https://david-dm.org/thebakeryio/parse-graphql-client/dev-status.svg)](https://david-dm.org/thebakeryio/parse-graphql-client#info=devDependencies)

## When to use

- you are using Parse SDK (web or mobile) coupled with Parse Server 
- you are using GraphQL
- you want to make sure your GraphQL queries are authenticated using Parse authentication
- [Recommended] you are also uing [parse-graphql-server](https://github.com/thebakeryio/parse-graphql-server) package  

## Quick start

Install *parse-graphql-client* and make sure Parse JavaScript SDK is installed and configured

```bash
npm install --save parse-graphql-client parse
```

Create and configure and instance of GraphQLClient. 

**Note:** GraphQLClient expects you to specify which Parse module to use. Example below uses a React Native version of Parse. If you are using GraphQLClient in a node environment, you would use ```require('parse/node')```, while a browser based app would call for ```require('parse')```

```javascript
import GraphQLClient from 'parse-graphql-client';

const client = new GraphQLClient(settings.graphqlURL, require('parse/react-native'));

client.query(`
  {
    todos {
      id, text, isComplete
    }
  }
`).then(result => {
  console.log(result.todos);
});

return client.mutate(`
  {
    newTodo: addTodo(text:"buy milk") {
      id, text, isComplete
    }
  }
`).then(result => {
  console.log(result.newTodo);
});
```

All resulting requests to your GraphQL server will arrive with ```Authorization``` header set to current Parse session token. You can either take it from there, or use [parse-graphql-server](https://github.com/thebakeryio/parse-graphql-server) package to automate this even further.

## See it in action

- [TodoMVC using React Native](https://github.com/thebakeryio/todomvc-react-native)

## Credits

Parse GraphQL client relies heavily on Lokka from [Kadirahq](https://github.com/kadirahq/lokka).




