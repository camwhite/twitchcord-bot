'use strict'

import fs from 'fs'
import figlet from 'figlet'
import google from 'google'
import say from 'say'

import options from './options.json'

let hasSaid
export default class Commands {
  static test (message) {
    switch (message.split(' ')[0]) {
      case '!discord' :
        return this.invite()
      case '!ascii' :
        const art = message.split(' ')
          .splice(1, message.length)
          .join(' ') || message.split(' ')[1]
        return this.ascii(art)
      case '!google' :
        const query = message.split(' ')
          .splice(1, message.length)
          .join(' ') || message.split(' ')[1]
        return this.google(query)
      case '!uptime' : 
        return this.uptime()
      case '!say' :
        const words = message.split(' ')
          .splice(1, message.length)
          .join(' ') || message.split(' ')[1]
        return this.say(words)
      case '!commands' :
        return this.commands()
    }
  }

  static invite () {
    return new Promise(resolve => {
      resolve(`https://discord.gg/9S942jY`)
    })
  }

  static youtube (url) {
    const readableStream = stream(url)
      .pipe(decoder())
      .pipe(speaker())

    return streamToPromise(readableStream)
  }


  static ascii (art) {
    return new Promise((resolve, reject) => {
      figlet(art, {
        horizantalLayout: 'fitted'
      }, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  static google (query) {
    return new Promise((resolve, reject) => {
      google(query, (err, { links }) => {
        if (err) reject(err)
        const topFiveLinks = links.slice(0, 6)
        resolve(topFiveLinks)
      })
    })
  }

  static say (words) {
    return new Promise((resolve, reject) => {
      if (hasSaid) return resolve('free speech disabled') // limit speech 
      if (words.length > 25) {
        return resolve('stop spamming')
      }
      say.speak(words)
      hasSaid = true
      setTimeout(() => hasSaid = false, 1000 * 60)
      resolve() 
    })
  }

  static commands () {
    return new Promise((resolve, reject) => {
      resolve(`!discord, !ascii, !google, and !uptime`) 
    })
  }

  static uptime () {
    return new Promise((resolve, reject) => {
      resolve(`https://decapi.me/twitch/uptime?channel=${options.twitch.identity.username}`)
    })
  }
}
