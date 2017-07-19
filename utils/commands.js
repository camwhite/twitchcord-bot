'use strict'

const robot = require('robotjs')
const spotify = require('spotify-node-applescript')

class Commands {
  static testForCommand (message) {
    switch (message) {
      case '!songname' :
        return this.songName
      case '!next' :
        return this.nextTrack
      case '!previous' :
        return this.previousTrack
      case '!rickroll' :
        this.rickroll()
    }

  }
  static songName () {
    return new Promise((resolve, reject) => {
      spotify.getTrack((err, track) => {
        if (err) reject(err)
        resolve(track)
      })
    })
  }
  static nextTrack () {
    return new Promise((resolve, reject) => {
      spotify.next(() => {
        spotify.getTrack((err, track) => {
          if (err) reject(err)
          resolve(track)
        })
      })
    })
  }
  static previousTrack () {
    return new Promise((resolve, reject) => {
      spotify.previous(() => {
        spotify.getTrack((err, track) => {
          if (err) reject(err)
          resolve(track)
        })
      })
    })
  }
  static rickroll () {
    robot.keyTap('4', [ 'control', 'shift' ])
  }
}

module.exports = Commands
