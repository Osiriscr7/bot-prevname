/* eslint-disable no-unused-vars */
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, Client, Collection } from 'discord.js'
import { Command } from '../structures/commands.js'
import { Database } from 'quickmongo'
export default new Command(
  {
    name: 'prevname',
    userPermissions: 'EVERYONE',

    /**
         * @param { { commands: Collection, events: Collection, db: Database} & Client } client
         * @param { Message } message
        */

    async callback (client, message, args) {
      if (args[0] === 'clear') {
        const memberPrevnamesInDb = await client.db.get(`prevnames_${message.author.id}`)
        if (!memberPrevnamesInDb) {
          return message.reply("Vous n'avez pas de prevnames.")
        }
        await client.db.delete(`prevnames_${message.author.id}`)
        return message.reply('Vos prevnames ont bien été supprimés.')
      }
      const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member
      const memberPrevnamesInDb = await client.db.get(`prevnames_${member.id}`)
      if (!memberPrevnamesInDb) {
        return message.reply(`${member.user.tag} n'a pas de prevnames.`)
      }
      let prevnamesFinal = ''
      memberPrevnamesInDb.forEach((memberPrevname, i) => {
        prevnamesFinal += `${i + 1} ${memberPrevname.oldUsername} --> ${memberPrevname.newUsername} - <t:${memberPrevname.date}>\n`
      })
      const pageSize = 10
      const lines = prevnamesFinal.match(/[^\r\n]+/g)
      const pages = []
      while (lines.length > 0) {
        pages.push(lines.splice(0, pageSize).join('\n'))
      }

      let currentPage = 0

      const embed = new EmbedBuilder()
        .setTitle(`Prevnames de ${member.user.tag}`)
        .setColor('#2F3136')
        .setDescription(`${pages[currentPage]}`)
        .setFooter({
          text: `Page ${currentPage + 1}/${pages.length}`
        })

      const previousButton = new ButtonBuilder()
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('previous')

      const nextButton = new ButtonBuilder()
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('next')
      let row
      if (pages.length < 10) {
        row = new ActionRowBuilder().addComponents(
          previousButton.setDisabled(true),
          nextButton.setDisabled(true)
        )
      } else {
        row = new ActionRowBuilder().addComponents(previousButton, nextButton)
      }
      const msg = await message.reply({
        embeds: [embed],
        components: [row]
      })

      const filter = (int) => int.user.id === message.author.id
      const collector = msg.createMessageComponentCollector({
        filter,
        time: 360000
      })

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'previous') {
          currentPage--
          if (currentPage < 0) {
            currentPage = pages.length - 1
          }
        } else if (interaction.customId === 'next') {
          currentPage++
          if (currentPage === pages.length) {
            currentPage = 0
          }
        }

        const newEmbed = new EmbedBuilder()
          .setTitle(`Prevnames de ${member.user.tag}`)
          .setColor('#2F3136')
          .setDescription(pages[currentPage])
          .setFooter({
            text: `Page ${currentPage + 1}/${pages.length}`
          })

        await interaction.update({
          embeds: [newEmbed]
        })
      })

      collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
          previousButton.setDisabled(true),
          nextButton.setDisabled(true)
        )

        const finalEmbed = new EmbedBuilder()
          .setTitle('Prevnames expiré.')
          .setColor('#2F3136')

        await message.edit({
          embeds: [finalEmbed],
          components: [disabledRow]
        })
      })
    }
  })
