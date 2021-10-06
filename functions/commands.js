//#region Imports
//* NPM packages
import { MessageEmbed } from 'discord.js';
import { exec } from 'child_process';

//* Data files
import dotenv from 'dotenv';
dotenv.config();
import { exit, env as config } from 'process';
import { default as questionConfig } from '../questions.js';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("../data/dontchange.json");

//* Functions
import { startTest, convertToDecimal } from './test.js';
import editFile from './file.js';
//#endregion

//#region Code
//! Run when a user sends a message
export default function Commands(name, icon, client, msg) {

    // Check if the message was sent by a bot
    if(msg.author.bot) return;

    //? start command
    if(msg.content === 'start') {
        if(msg.guildId || !msg.author.test?.intro) return;

        msg.author.test.intro = false;
        msg.author.test.started = true;
        return startTest(msg.author);
    }

    //? help command
    if(msg.content === '!help' || msg.mentions.has(client.user.id)) {
        if(!msg.guildId) return;
        if(msg.content.includes('@here') || msg.content.includes('@everyone')) return;

        const embed = new MessageEmbed()
        .setColor('BLURPLE')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setTitle(':file_folder: Help')
        .setDescription('**Commands:**\n:arrow_right: `!help` - Shows this message\n\n:arrow_right: `!info @user` - Lists some useful information about the user\n\n:arrow_right: `!status [status-text]` - Sets the bot\'s status\n\n:arrow_right: `!status remove` - Deletes the bot\'s status\n\n:arrow_right: `!restart` - Restarts the bot\n\n:arrow_right: `!stop` - Stops the bot');

        return msg.channel.send({ embeds: [embed] });
    }

    //? info command
    if(msg.content.startsWith('!info')) {
        const author = client.guilds.cache.get(data.serverID).members.cache.get(msg.author.id);

        if(!msg.guildId || !author.roles.cache.has(config.staffRoleID)) return;

        const errorEmbed = new MessageEmbed()
        .setColor('RED')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription('**Invalid usage!** :x:\n```!info @user```');

        if(!msg.mentions.members.first()) return msg.channel.send({ embeds: [errorEmbed] });
        let mentionedUser = msg.mentions.members.first().user;

        let cooldown;
        let fails;
        if(!mentionedUser.test?.timeLeft)
            cooldown = '- Test cooldown: 0';
        else
            cooldown = `+ Test cooldown: ${convertToDecimal((questionConfig.again - mentionedUser.test.timeLeft) / 6000000)} minute(s)`;

        if(!mentionedUser.fails?.num)
            fails = '- Fails: 0';
        else
            fails = `+ Fails: ${mentionedUser.fails.num}`;

        const embed = new MessageEmbed()
        .setColor('BLURPLE')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setAuthor(`${mentionedUser.username}#${mentionedUser.discriminator}`, mentionedUser.avatarURL())
        .setDescription(`**${mentionedUser} (${mentionedUser.username}#${mentionedUser.discriminator})**\`\`\`diff\n${cooldown}\n${fails}\`\`\``);

        return msg.channel.send({ embeds: [embed] });
    }

    //? restart command
    if(msg.content === '!restart') {
        if(!msg.guildId || msg.guild.ownerId !== msg.author.id) return;

        const embed = new MessageEmbed()
        .setColor('RED')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setTitle('Bot restart :robot:')
        .setDescription('```Stopping...```');

        msg.channel.send({ embeds: [embed] }).then(message => {

            setTimeout(() => {
                embed.setDescription('```Starting...```')
                .setColor('GREEN');
                message.edit({ embeds: [embed] });
            }, 1000);

            setTimeout(() => {
                embed.setDescription('```Restarted.```')
                .setColor('BLURPLE');
                message.edit({ embeds: [embed] });

                console.log(`Bot restarted by ${msg.author.username}#${msg.author.discriminator}`);
            }, 2000);

            return setTimeout(() => {
                client.destroy();
                exec("node .");
            }, 3000);

        })
    }

    //? stop command
    if(msg.content === '!stop') {
        if(!msg.guildId || msg.guild.ownerId !== msg.author.id) return;

        const embed = new MessageEmbed()
        .setColor('RED')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setTitle('Bot stop :robot:')
        .setDescription('```Stopping...```');

        msg.channel.send({ embeds: [embed] }).then(message => {

            setTimeout(() => {
                embed.setDescription('```Stopped.```\nIf you wish to **start the bot back up**, you can do it via running `start.bat` or `start.vbs`.')
                .setColor('BLURPLE');
                message.edit({ embeds: [embed] });

                console.log(`Bot stopped by ${msg.author.username}#${msg.author.discriminator}`);
            }, 1000);

            setTimeout(() => {
                exit(1);
            }, 2000);

        })
    }

    //? status command
    if(msg.content.startsWith('!status')) {
        const author = client.guilds.cache.get(data.serverID).members.cache.get(msg.author.id);
        if(!msg.guildId || !author.roles.cache.has(config.staffRoleID)) return;
        const status = msg.content.slice(8);

        const errorEmbed = new MessageEmbed()
        .setColor('RED')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription('**Invalid usage!** :x:\n```!status [status-text]```');

        if(!status) return msg.channel.send({ embeds: [errorEmbed] });

        const embed = new MessageEmbed()
        .setColor('BLURPLE')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setTitle(':electric_plug: Status')
        .setDescription(`\nStatus successfully updated :white_check_mark:\n\`\`\`${status}\`\`\``);

        if(status === 'remove') {
            console.log(`Bot status removed by ${msg.author.username}#${msg.author.discriminator}`);
            client.user.setActivity('');
            editFile('status', '');
            embed.setDescription('\nStatus successfully removed :white_check_mark:');
            return msg.channel.send({ embeds: [embed] });
        }

        msg.channel.send({ embeds: [embed] });
        console.log(`Bot status changed to ${status} by ${msg.author.username}#${msg.author.discriminator}`);
        client.user.setActivity(status, { type: 'PLAYING' });
        return editFile('status', status);
    }
}
//#endregion