'use strict'

const { twitch, discord } = require('./config')
const Commands = require('./commands')

const chalk = require('chalk')
const tmi = require('tmi.js')
const Discord = require('discord.js')

const twitchClient = new tmi.client(twitch)
const discordClient = new Discord.Client()

class Bot {
  constructor () {
    // Initalize the clients
    twitchClient.connect()
    discordClient.login(discord.token)

    // Twitch client listeners
    twitchClient.on('message', (channel, userstate, message, self) => {
      const username = userstate['display-name']
      console.log(`${chalk.green(username)}: ${message}`)

      if (username !== twitch.identity.username) {
        this.sendToDiscord({ username, message })
      }
    })
    twitchClient.on('join', (channel, username, self) => {
      const message = 'has joined the stream :)'
      console.log(`${chalk.green(username)}: ${message}`)

      // Create a greeting and send it to twitch
      const greeting = {
        content: `Suhhhh ${username} you the man now dog, but don't lurk O_o`,
        author: { username: twitch.identity.username }
      }
      this.sendToTwitch(greeting)

      if (this.channel) {
        this.sendToDiscord({ username, message })
      }
    })
    twitchClient.on('part', (channel, username, self) => {
      const message = 'has left the stream :('
      console.log(`${chalk.green(username)}: ${message}`)

      if (this.channel) {
        this.sendToDiscord({ username, message })
      }
    })

    // Discord client listeners
    discordClient.on('ready', () => {
      this.channel = discordClient.channels.find('name', discord.channel)
    })
    discordClient.on('message', (message) => {
      if (message.author.username === twitch.identity.username &&
          message.channel.name === discord.channel) {
        this.sendToTwitch(message)
      }
    })
  }
  /**
  * Sends a message from twitch irc to discord.
  * @param {object} the message data
  * @return {promise} the sent message
  */
  async sendToDiscord ({ username, message }) {
    let sent
    try {
      sent = await this.channel.send(`**${username}** ${message}`)
    } catch (err) {
      throw new Error(err)
    }

    const response = await Commands.testForCommand(message)
    this.handleResponse(twitch.identity.username, response)

    return sent
  }
  /**
  * Sends a message to twitch irc from discord.
  * @param {object} the message data
  * @return {promise} the sent message
  */
  async sendToTwitch ({ content, author }) {
    let sent
    try {
      sent = await twitchClient.say(author.username, content)
    } catch (err) {
      throw new Error(err)
    }

    const response = await Commands.testForCommand(content)
    this.handleResponse(author.username, response)

    return sent
  }
  handleResponse (username, response) {
    if (response && !Array.isArray(response)) {
      twitchClient.say(username, response)
    } else if (response && Array.isArray(response)) {
      response.forEach(r => twitchClient.say(username, r.link))
    }
  }
}

module.exports = Bot
