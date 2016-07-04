/* eslint global-require: "off", max-len: "off" */


import proxyquire from 'proxyquire';

describe('GraphQLClient', () => {
  const graphQLServerUrl = 'http://localhost:8000/graphql';
  const sessionToken = 'session-token';

  let httpTransportSpy;
  let currentUserAsyncStub;
  let GraphQLClient;
  let client;

  beforeEach(() => {
    httpTransportSpy = spy();
    currentUserAsyncStub = stub();
    currentUserAsyncStub.returns(Promise.resolve({
      getSessionToken() {
        return sessionToken;
      },
    }));

    GraphQLClient = proxyquire('../../../src/client', {
      'lokka-transport-http': httpTransportSpy,
      'parse/node': {
        User: {
          currentAsync: currentUserAsyncStub,
        },
      },
    });
    client = new GraphQLClient(graphQLServerUrl);
  });

  afterEach(() => {
    httpTransportSpy.reset();
  });

  describe('GraphQLClient', () => {
    it('is defined', () => {
      expect(GraphQLClient).to.be.ok;
    });

    it('requires a valid url to be passed to constructor', () => {
      function noParamFn() {
        return new GraphQLClient();
      }

      function invalidURLFn() {
        return new GraphQLClient('this is not a valid url');
      }

      expect(noParamFn).to.throw(Error);
      expect(invalidURLFn).to.throw(Error);
    });

    it('has query method', () => {
      expect(client).to.respondTo('query');
    });

    it('has mutate method', () => {
      expect(client).to.respondTo('mutate');
    });

    it('has setupTransport method', () => {
      expect(client).to.respondTo('setupTransport');
    });

    it('has Parse instance attached', () => {
      expect(client.Parse).to.be.ok;
    });

    describe('query and mutate', () => {
      let setupTransportStub;

      beforeEach(() => {
        setupTransportStub = stub(client, 'setupTransport', () => Promise.resolve({}));
      });

      afterEach(() => {
        setupTransportStub.restore();
      });

      it('both call setupTransport', () => {
        client.query({});
        expect(setupTransportStub).to.have.been.calledOnce;
        client.mutate({});
        expect(setupTransportStub).to.have.been.calledTwice;
      });
    });

    describe('setupTransport', () => {
      it('calls this.Parse.User.currentAsync()', () => {
        client.setupTransport();
        expect(currentUserAsyncStub).to.have.been.calledOnce;
      });

      it('throws if this.Parse.User.currentAsync() returns an error', (done) => {
        currentUserAsyncStub.reset();
        currentUserAsyncStub.returns(Promise.reject({}));
        client.setupTransport().catch(() => done());
      });

      it('creates an instance of Lokka/HttpTransport if all goes well', (done) => {
        client.setupTransport().then((transport) => {
          expect(transport).to.be.ok;
          expect(httpTransportSpy).to.have.been.calledOnce;
          expect(httpTransportSpy).to.have.been.calledWithNew;
          done();
        });
      });

      it('sets authorization header in HttpTransport based on session token', (done) => {
        client.setupTransport().then((transport) => {
          expect(transport).to.be.ok;
          expect(httpTransportSpy.args[0][0]).to.equal(graphQLServerUrl);
          expect(httpTransportSpy.args[0][1]).to.eql({
            headers: {
              Authorization: sessionToken,
            },
          });
          done();
        });
      });

      it('does not include authorization header in HttpTransport if current user is not set', (done) => {
        currentUserAsyncStub.reset();
        currentUserAsyncStub.returns(Promise.resolve(null));
        client.setupTransport().then((transport) => {
          expect(transport).to.be.ok;
          expect(httpTransportSpy.args[0][0]).to.equal(graphQLServerUrl);
          expect(httpTransportSpy.args[0][1]).to.eql({
            headers: {},
          });
          done();
        });
      });

      it('does not include authorization header in HttpTransport if current user has no session token set', (done) => {
        currentUserAsyncStub.reset();
        currentUserAsyncStub.returns(Promise.resolve({
          getSessionToken() {
            return null;
          },
        }));
        client.setupTransport().then((transport) => {
          expect(transport).to.be.ok;
          expect(httpTransportSpy.args[0][0]).to.equal(graphQLServerUrl);
          expect(httpTransportSpy.args[0][1]).to.eql({
            headers: {},
          });
          done();
        });
      });
    });
  });
});
