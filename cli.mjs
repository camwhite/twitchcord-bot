import fs from 'fs'
import termKit from 'terminal-kit'
import util from 'util'

const { promisify } = util
const { terminal } = termKit
const { promises: { writeFile , readFile } } = fs

const twitch = {
  options: {
    debug: false
  },
  identity: {},
  channels: [],
  connection: {
    reconnect: true,
  }
}
const discord = {}

terminal.inputField = promisify(terminal.inputField)
terminal.yesOrNo = promisify(terminal.yesOrNo)
terminal.on('key', (key) => {
  if (key === 'CTRL_C') {
    terminal.red('CTRL-C detected...\n') ;
    process.exit()
  }
}) 

export const getOptions = async () => {
  // Look for saved options
  if (fs.existsSync('options.json')) {
    terminal('Would to use the saved options? [Y|n]\n')
    const result = await terminal.yesOrNo({ yes: [ 'y', 'ENTER' ], no: [ 'n' ] })
    if (result) {
      try {
        const data = await readFile('options.json')
        return JSON.parse(data.toString())
      } catch (err) {
        throw err
      }
    }
  }
  // Twitch prompts
  try {
    terminal('Twitch username: ')
    twitch.identity.username = await terminal.inputField()
    terminal('\nTwitch password: ')
    twitch.identity.password = await terminal.inputField()
    terminal('\nTwitch channel: ')
    twitch.channels.push(await terminal.inputField())
  } catch (err) {
    throw err
  }

  // Discord prompts
  try {
    terminal('\nDiscord auth token: ')
    discord.token = await terminal.inputField()
    terminal('\nDiscord channel: ')
    discord.channel = await terminal.inputField()
  } catch (err) {
    throw err
  }

  const options = { twitch, discord }
  try {
    await writeFile('options.json', JSON.stringify(options))
  } catch (err) {
    throw err
  }

  return options
}
