import Bot from './bot'
import { getOptions } from './cli'

const start = async () => {
  const opts = await getOptions()
  const bot = new Bot(opts)

  return bot
}

start()
