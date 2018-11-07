import chalk from 'chalk'
import tmi from 'tmi.js'
import Discord from 'discord.js'
import Commands from './commands'

export default class Bot {
  constructor (opts) {
    this.opts = opts
    const { twitch, discord } = opts

    this.twitch = new tmi.client(twitch)
    this.discord = new Discord.Client()

    this.joined = [] // Keep reference to joins
    this.present = [] // A list of present users 

    // Discord client listeners
    this.discord.on('ready', () => {
      this.channel = this.discord.channels.find('name', discord.channel)
    })
    this.discord.on('message', (message) => {
      if (message.author.username === twitch.identity.username &&
          message.channel.name === discord.channel) {
        this.sendToTwitch(message)
      }
    })

    // Twitch client listeners
    this.twitch.on('message', async (...args) => await this.onMessage(...args))
    this.twitch.on('join', async (...args) => await this.onJoin(...args))
    this.twitch.on('part', async (...args) => await this.onPart(...args))

    // Initalize the clients
    this.twitch.connect()
    this.discord.login(discord.token)
    this.discord.user.setAvatar('https://www.freeiconspng.com/uploads/twitch-icon-22.png')
  }
   async onMessage (channel, userstate, message, self) {
    const { username } = userstate
    if (!self) {
      await this.sendToDiscord({ username, message })
    }
    if (userstate['message-type'] !== 'whisper') {
      console.log(`${chalk.green(username)}: ${message}`)
    }
  }
  async onJoin (channel, username, self) {
    const message = 'has joined the stream'
    console.log(`${chalk.green(username)}: ${message}`)

    if (this.channel) {
      await this.sendToDiscord({ username, message })
    }
    if (this.present.includes(username)) return

    this.present = [ ...this.present, username ]
    console.log(chalk.blue(`Who's here now: \n`), chalk.yellow(this.present.join('\n')))
    this.joined.push(username)
  }
  async onPart (channel, username, self) {
    const message = 'has left the stream'
    console.log(`${chalk.green(username)}: ${message}`)

    if (!this.present.includes(username)) return

    // Remove users from present list
    const index = this.present.indexOf(username)
    this.present.splice(index, 1)
    console.log(chalk.blue(`Who's here now: `, chalk.yellow(this.present.join('\n'))))

    if (this.channel) {
      await this.sendToDiscord({ username, message })
    }
  }
  /**
  * Sends a message from twitch irc to discord.
  * @param {object} the message data
  * @return {promise} the sent message
  */
  async sendToDiscord ({ username, message }) {
    let sent
    try {
      await this.channel.guild.members
        .get(this.discord.user.id)
        .setNickname(username)
      sent = await this.channel.send(message)
      const response = await Commands.test(message)
      await this.handleResponse(this.opts.twitch.identity.username, response)
    } catch (err) {
      console.error(err)
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
      sent = await this.twitch.say(author.username, content)
      const response = await Commands.test(content)
      await this.handleResponse(author.username, response)
    } catch (err) {
      throw new Error(err)
    }

    return sent
  }
  /**
  * Sends a twitch whisper.
  * @param {object} the message data
  * @return {promise} the sent message
  */
  async sendWhisper ({ username, message }) {
    let sent
    try {
      sent = await this.twitch.whisper(username, message)
    } catch (err) {
      throw new Error(err)
    }

    return sent
  }
  async handleResponse (username, response) {
    if (response && !Array.isArray(response)) {
      await this.twitch.say(username, response)
    } else if (response && Array.isArray(response)) {
      await response.forEach(async (r) =>{
        await this.twitch.say(username, r.link)
        await this.sendToDiscord({ username, message: r.link })
      })
    }
  }
}
