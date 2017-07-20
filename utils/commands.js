'use strict'

const open = require('open')
const figlet = require('figlet')
const google = require('google')
const spotify = require('spotify-node-applescript')

let isRolling

class Commands {
  static testForCommand (message) {
    switch (message.split(' ')[0]) {
      case '!discord' :
        return this.invite()
      case '!songname' :
        return this.songName()
      case '!next' :
        return this.nextTrack()
      case '!previous' :
        return this.previousTrack()
      case '!rickroll' :
        return this.rickroll()
      case '!ascii' :
        return this.ascii()
      case '!google' :
        const query = message.split(' ').splice(1, message.length).join(' ') || message.split(' ')[1]
        return this.google(query)
    }
  }
  static invite () {
    return new Promise(resolve => {
      resolve(`https://discord.gg/9S942jY`)
    })
  }
  static songName () {
    return new Promise((resolve, reject) => {
      spotify.getTrack((err, track) => {
        if (err) reject(err)

        const response = `${track.artist} - ${track.name}`
        resolve(response)
      })
    })
  }
  static nextTrack () {
    return new Promise((resolve, reject) => {
      spotify.next(() => {
        spotify.getTrack((err, track) => {
          if (err) reject(err)

          const response = `${track.artist} - ${track.name}`
          resolve(response)
        })
      })
    })
  }
  static previousTrack () {
    return new Promise((resolve, reject) => {
      spotify.previous(() => {
        spotify.getTrack((err, track) => {
          if (err) reject(err)

          const response = `${track.artist} - ${track.name}`
          resolve(response)
        })
      })
    })
  }
  static rickroll () {
    return new Promise(resolve => {
      if (!isRolling) {
        isRolling = true
        setTimeout(() => isRolling = false, 6000000)
        open('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        resolve()
      } else {
        resolve('Can\'t roll again right now')
      }
    })
  }
  static ascii () {
    return new Promise(resolve => {
      figlet('Foo', {
        font: 'rectangles', horizantalLayout: 'fitted' }, (err, data) => {
        resolve(`
          ${data}
        `)
      })
    })
  }
  static google (query) {
    return new Promise((resolve, reject) => {
      google(query, (err, { links }) => {
        if(err) return reject(err)

        const topFiveLinks = links.slice(0, 6)
        resolve(topFiveLinks)
      })
    })
  }
}

module.exports = Commands
