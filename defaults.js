var path = require('path')
var home = require('os-homedir')
var merge = require('deep-extend')
var nonPrivate = require('non-private-ip')
var ssbKeys = require('ssb-keys')

var SEC = 1e3
var MIN = 60 * SEC

module.exports = function setDefaults (name, config) {
  var baseDefaults = {
    // just use an ipv4 address by default.
    // there have been some reports of seemingly non-private
    // ipv6 addresses being returned and not working.
    // https://github.com/ssbc/scuttlebot/pull/102
    path: path.join(home() || 'browser', '.' + name),
    party: true,
    timeout: 0,
    pub: true,
    local: true,
    friends: {
      dunbar: 150,
      hops: 3
    },
    gossip: {
      connections: 3
    },
    // *** LEGACY *** (used to generate default connections.incoming)
    host: nonPrivate.v4 || '',
    port: 8008,
    ws: { port: 8989 },
    // **************
    connections: {
      outgoing: {
        net: [{ transform: 'shs' }]
      }
    },
    timers: {
      connection: 0,
      reconnect: 5 * SEC,
      ping: 5 * MIN,
      handshake: 5 * SEC
    },
    // change these to make a test network that will not connect to the main network.
    caps: {
      // this is the key for accessing the ssb protocol.
      // this will be updated whenever breaking changes are made.
      // (see secret-handshake paper for a full explaination)
      // (generated by crypto.randomBytes(32).toString('base64'))
      shs: '1KHLiKZvAvjbY1ziZEHMXawbCEIM6qwjCDm3VYRan/s=',

      // used to sign messages
      sign: null
    },
    master: [],
    logging: { level: 'notice' }
  }
  config = merge(baseDefaults, config || {})

  if (!config.connections.incoming) {
    config.connections.incoming = {
      net: [{ host: config.host || '::', port: config.port, scope: ['device', 'local', 'public'], 'transform': 'shs' }],
      ws: [{ host: config.host || '::', port: config.ws.port, scope: ['device', 'local', 'public'], 'transform': 'shs' }]
    }
  }

  config.keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))

  // *** LEGACY TIDYUP ***
  // breaks ssb-server/test/bin.js, TODO fix it.
  // delete config.host
  // delete config.port
  // delete config.ws

  return config
}
