'use strict'

const robot = require('robotjs')
robot.setKeyboardDelay(10000)

class Commands {
  static testForCommand (message) {
    switch (message) {
      case '!rickroll' :
        this.rickroll()
    }

  }
  static rickroll () {
    robot.keyTap('4', [ 'control', 'shift' ])
  }
}

module.exports = Commands
