'use strict'

const { argv } = require('yargs')

const twitch = {
  options: {
    debug: false
  },
  connection: {
    reconnect: true,
  },
  identity: {
    username: argv.handle,
    password: argv.password
  },
  channels: [ `#${argv.handle}` ]
}

const discord = {
  token: argv.token,
  channel: argv.channel
}

module.exports = { twitch, discord }
