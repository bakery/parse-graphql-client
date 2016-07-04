/* eslint global-require: "off" */

import { Lokka } from 'lokka';
import validator from 'validator';
import HttpTransport from 'lokka-transport-http';

class GraphQLClient {
  constructor(url, Parse) {
    const looksLikeParse = Parse && Parse.User &&
      typeof Parse.User.currentAsync === 'function';

    if (!validator.isURL(url)) {
      throw new Error('GraphQLClient requires a valid url');
    }

    if (!looksLikeParse) {
      throw new Error('GraphQLClient reuires a valid Parse instance');
    }

    this.url = url;
    this.Parse = Parse;
  }

  query(q) {
    return this.setupTransport().then(
      transport => new Lokka({ transport }).query(q)
    );
  }

  mutate(q) {
    return this.setupTransport().then(
      transport => new Lokka({ transport }).mutate(q)
    );
  }

  setupTransport() {
    return this.Parse.User.currentAsync().then((currentUser) => {
      const sessionToken = currentUser && currentUser.getSessionToken();
      const headers = sessionToken ? {
        Authorization: sessionToken,
      } : {};
      return new HttpTransport(this.url, { headers });
    }, (error) => {
      throw new Error(`Parse Authentication error: ${error.message}`);
    });
  }
}

export default GraphQLClient;
