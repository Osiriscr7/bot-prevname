import {
  Evenement
} from '../structures/evenements.js'

export default new Evenement({
  eventName: {
    userUpdate: 0
  },

  /**
     * @param { { commands: Collection, events: Collection } & Client } client
     */

  async callback (client, oldUser, newUser) {
    if (oldUser.username !== newUser.username) {
      const prevnames = await client.db.get(`prevnames_${newUser.id}`)
      if (!Array.isArray(prevnames)) await client.db.set(`prevnames_${newUser.id}`, [])
      await client.db.push(`prevnames_${newUser.id}`, {
        oldUsername: oldUser.username,
        newUsername: newUser.username,
        date: parseInt(new Date() / 1000)
      })
    }
  }
})
