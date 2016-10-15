var client = require('../src/client.js');
var GossipSeed = require('../src/gossipSeed');

var testBase = require('./common/base_test');

module.exports = {
  'Connect To Endpoint Happy Path': function(test) {
    var tcpEndpoint = {hostname: 'localhost', port: 1112};
    var conn = client.EventStoreConnection.create(testBase.settings(), tcpEndpoint);
    conn.connect()
        .catch(function(err) {
          test.done(err);
        });
    conn.on('connected', function(endPoint){
      test.areEqual("connected endPoint", endPoint, tcpEndpoint);
      done();
    });
    conn.on('error', done);

    function done(err) {
      conn.close();
      if (err) return test.done(err);
      test.done();
    }
  },
  'Connect To Endpoint That Doesn\'t Exist': function(test) {
    var tcpEndpoint = {hostname: 'localhost', port: 11112};
    var conn = client.EventStoreConnection.create(testBase.settings({maxReconnections:1}), tcpEndpoint);
    conn.connect()
        .catch(function (err) {
          test.done(err);
        });
    conn.on('connected', function () {
      test.fail("Should not be able to connect.");
      test.done();
    });
    conn.on('error', function (err) {
      test.done(err);
    });
    conn.on('closed', function(reason) {
      test.ok(reason.indexOf("Reconnection limit reached") === 0, "Wrong expected reason.");
      test.done();
    });
  },
  'Connect to Cluster using gossip seeds': function (test) {
    test.expect(1);
    var gossipSeeds = [
      new GossipSeed({hostname: 'localhost', port: 1113}),
      new GossipSeed({hostname: 'localhost', port: 2113}),
      new GossipSeed({hostname: 'localhost', port: 3113})
    ];
    var conn = client.EventStoreConnection.create(testBase.settings(), gossipSeeds);
    conn.connect()
      .catch(function(err) {
        test.done(err);
      });
    conn.on('connected', function(endPoint){
      test.ok(endPoint, "no endpoint");
      done();
    });
    conn.on('error', done);

    function done(err) {
      conn.close();
      if (err) return test.done(err);
      test.done();
    }
  }
};

testBase.init(module.exports, false);