import { Evenement } from '../structures/evenements.js'
import chalk from 'chalk'

export default new Evenement(
  {
    eventName: { ready: 0 },

    /**
         * @param { { commands: Collection, events: Collection } & Client } client
        */

    async callback (client) {
      console.log(chalk.blue('Prêt sur ') + chalk.red(`${client.user.tag}`))
      process.on('unhandledRejection', async (err) => {
        return console.log(err)
      })
      process.on('uncaughtException', async (err) => {
        return console.log(err)
      })
    }
  }
)
