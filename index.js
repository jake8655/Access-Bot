//#region Imports
//* NPM packages
import { Client, Intents, MessageActionRow, MessageButton } from 'discord.js';

//* Data files
import dotenv from 'dotenv';
dotenv.config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("./data/dontchange.json");

import { default as questionConfig } from './questions.js';
import { env as config } from 'process';

//* Functions
import User from './classes/user.js';
import { SetClient } from './functions/test.js';
import { SetInfoLOG } from './functions/log.js';
import { SetInfo, Private, Time, Role, Started, Channel } from './functions/createEmbed.js';
import Commands from './functions/commands.js';
import editFile from './functions/file.js';
//#endregion

//#region Create bot
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS],
    partials: ["CHANNEL", "MESSAGE", "REACTION"]
});
//#endregion

let name;
let icon;

//#region Bot logic
//! Run when the bot starts
client.on('ready', () => {
    console.log('Access-Bot online ✅');
    client.user.setActivity(data.status, { type: 'PLAYING' });
    
    SetClient(client);
    if(data.serverID){
        name = client.guilds.cache.get(data.serverID).name;
        icon = client.guilds.cache.get(data.serverID).iconURL();
        SetInfo(name, icon);
        SetInfoLOG(name, icon, client);
        Run();
    }
})

//! Run when the bot joins a server
client.on("guildCreate", guild => {
    editFile('server', guild.id);
    setTimeout(() => {
        name = guild.name;
        icon = guild.iconURL();
        SetInfo(name, icon);
        SetInfoLOG(name, icon, client);
        Run();
    }, 5000);
});

//! Run when a user clicks the button
client.on('interactionCreate', interaction => {
    // Respond to the interaction
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: config.msgOnButtonPress,
                flags: 64,
            }
        }
    })

    // Send the correct embed according to the statements below
    if(interaction.member.roles.cache.some(role => role.id === questionConfig.roleID)) {
        interaction.user.send({ embeds: [Role(interaction.user)] });
    } else if(interaction.user.test?.fail) {
        interaction.user.send({ embeds: [Time(interaction.user)] });
    } else if(interaction.user.test?.intro || interaction.user.test?.started) {
        interaction.user.send({ embeds: [Started(interaction.user)] });
    } else {
        interaction.user.send({ embeds: [Private(interaction.user)] });
        interaction.user.test = new User(interaction.user.id, true, false, 0, [], false, null, null);

        // Remove the permission of seeing the channel for the user
        client.channels.cache.get(config.rulesChannelID).permissionOverwrites.create(interaction.user, {
            VIEW_CHANNEL: false
        })
    }
})

//! Send/Update the message in the channel
function Run() {
    // Create button
    const button = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('tick')
            .setStyle('SECONDARY')
            .setEmoji(config.buttonMSG)
    );

    // Send/Update the message
    if(!data.messageID) {
        client.channels.cache.get(config.channelID).send({ embeds: [Channel()], components: [button] }).then(msg => {
            editFile('message', msg.id);
        })
    } else{
        client.channels.cache.get(config.channelID).messages.fetch({around: data.messageID, limit: 1}).then(msg => {
            let fetchedMsg = msg.first();
            let newEmbed = Channel();
            fetchedMsg.edit({ embeds: [newEmbed], components: [button] });
        })
    }

}

client.on('messageCreate', msg => Commands(name, icon, client, msg));
//#endregion

//#region Login
client.login(config.TOKEN);
//#endregion