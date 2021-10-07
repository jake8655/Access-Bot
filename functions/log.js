//#region Imports
//* NPM packages
import { MessageEmbed } from 'discord.js';

//* JSON files
import dotenv from 'dotenv';
dotenv.config();
import { env as config } from 'process';
import { default as questionConfig } from '../questions.js';
//#endregion

//#region Variables
let name;
let icon;
let client;
//#endregion

//#region Functions
const SetInfoLOG = (sentName, sentIcon, sentClient) => {
    name = sentName;
    icon = sentIcon;
    client = sentClient;
}

const StartLOG = user => {
    const embedMessage = new MessageEmbed()
    .setColor('PURPLE')
    .setAuthor('Has started the test!', user.avatarURL())
    .setDescription(`**${user} (${user.username}#${user.discriminator}) |** Has started the test! :bookmark_tabs:`)
    .setTimestamp(new Date())
    .setFooter(name, icon);

    client.channels.cache.get(config.logChannelID).send({ embeds: [embedMessage] });
}

const EndLOG = user => {
    let title;
    let desc;
    let color;

    if(user.test.percentage >= questionConfig.success) {
        color = 'GREEN';
        title = 'Successfully completed the test!';
        desc = `**${user} (${user.username}#${user.discriminator}) |** Scored **${user.test.percentage}%** and got access to the server! :white_check_mark:`;
    } else {
        color = 'RED';
        title = 'Failed the test!';
        desc = `**${user} (${user.username}#${user.discriminator}) |** Scored **${user.test.percentage}%** and failed to get access to the server! :x:\nFails: **${user.fails.num}**`;
    }

    const embedMessage = new MessageEmbed()
    .setColor(color)
    .setAuthor(title, user.avatarURL())
    .setDescription(desc)
    .setTimestamp(new Date())
    .setFooter(name, icon);

    client.channels.cache.get(config.logChannelID).send({ embeds: [embedMessage] });
}

const EndTimeLOG = user => {
    const embedMessage = new MessageEmbed()
    .setColor('BLUE')
    .setAuthor('Has run out of time!', user.avatarURL())
    .setDescription(`**${user} (${user.username}#${user.discriminator}) |** Didn't answer the \`${user.test.answers.length+1}.question\` in time! :alarm_clock:\nFails: **${user.fails.num}**`)
    .setTimestamp(new Date())
    .setFooter(name, icon);

    client.channels.cache.get(config.logChannelID).send({ embeds: [embedMessage] });
}

const BanLOG = user => {
    const embedMessage = new MessageEmbed()
    .setColor('#A62019')
    .setAuthor('Has been temporarily banned!', user.avatarURL())
    .setDescription(`**${user} (${user.username}#${user.discriminator}) |** Failed to complete the test for the \`3. time\`. They have been banned for ${questionConfig.banTime/60000} minute(s).`)
    .setTimestamp(new Date())
    .setFooter(name, icon);

    client.channels.cache.get(config.logChannelID).send({ embeds: [embedMessage] });
}

const UnBanLOG = async user => {
    const embedMessage = new MessageEmbed()
    .setColor('#FD0061')
    .setAuthor('Has been unbanned!', user.avatarURL())
    .setDescription(`**${user} (${user.username}#${user.discriminator}) |** Can now join the server back and try to complete the test again.`)
    .setTimestamp(new Date())
    .setFooter(name, icon);

    await client.channels.cache.get(config.logChannelID).send({ embeds: [embedMessage] });
}
//#endregion

//#region Export
export { SetInfoLOG, StartLOG, EndLOG, EndTimeLOG, BanLOG, UnBanLOG };
//#endregion