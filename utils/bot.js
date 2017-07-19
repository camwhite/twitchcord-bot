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

      console.log(`${chalk.green(userstate['display-name'])}: ${message}`)

      if (userstate['display-name'] !== twitch.identity.username) {
        this.sendToDiscord({ userstate, message })
      }
    })
    twitchClient.on('join', (channel, username, self) => {
      const userstate = { 'display-name': username }
      const message = 'has joined the stream!'

      console.log(`${chalk.green(userstate['display-name'])}: ${message}`)
      if (this.channel) {
        this.sendToDiscord({ userstate, message })
      }
    })
    twitchClient.on('part', (channel, username, self) => {
      const userstate = { 'display-name': username }
      const message = 'has left the stream :/'

      console.log(`${chalk.green(userstate['display-name'])}: ${message}`)
      if (this.channel) {
        this.sendToDiscord({ userstate, message })
      }
    })

    // Discord client listeners
    discordClient.on('ready', () => {
      this.channel = discordClient.channels.find('name', discord.channel)
    })
    discordClient.on('message', (message) => {
      if (message.author.username === twitch.identity.username) {
        this.sendToTwitch(message)
      }
    })
  }
  /**
  * Sends a message from twitch irc to discord.
  * @param {object} the message data
  * @return {promise} the sent message
  */
  async sendToDiscord ({ userstate, message }) {
    let sent
    try {
      sent = await this.channel.send(`**${userstate['display-name']}** ${message}`)
    } catch (err) {
      throw new Error(err)
    }

    const response = await Commands.testForCommand(message)
    if (response) {
      twitchClient.say(twitch.identity.username, response)
    }

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
    if (response) {
      twitchClient.say(author.username, response)
    }

    return sent
  }
}

module.exports = Bot
