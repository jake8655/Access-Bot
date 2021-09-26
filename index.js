//#region Imports
//* NPM packages
const Discord = require('discord.js');
const { exec } = require('child_process');

//* JSON databases
const config = require('./data/config.json');
const dontchange = require('./data/dontchange.json');

//* Custom JS files
const { User } = require('./classes/user.js');
const { SetClient, startTest } = require('./functions/test.js');
const { SetInfoLOG } = require('./functions/log.js');
const { SetInfo, SetUser, Private, Time, Role, Started, Channel } = require('./functions/createEmbed.js');
const { editFileID, editFileServer, editFileStatus } = require('./functions/file.js');
//#endregion

//#region Create bot
const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS],
    partials: ["CHANNEL", "MESSAGE", "REACTION"]
});
//#endregion

//#region Bot logic
let name;
let icon;

//! Run when the bot starts
client.on('ready', () => {
    console.log('smth happened');
    console.log('gudbai');
    console.log('Access-Bot online ✅');
    client.user.setActivity(dontchange.status, { type: 'PLAYING' });
    SetClient(client);
    if(dontchange.serverID){
        SetInfo(client.guilds.cache.get(dontchange.serverID).name, client.guilds.cache.get(dontchange.serverID).iconURL());
        SetInfoLOG(client.guilds.cache.get(dontchange.serverID).name, client.guilds.cache.get(dontchange.serverID).iconURL(), client);
        name = client.guilds.cache.get(dontchange.serverID).name;
        icon = client.guilds.cache.get(dontchange.serverID).iconURL();
        Run();
    }
})

//! Run when the bot joins a server
client.on("guildCreate", guild => {
    editFileServer(guild.id);
    setTimeout(() => {
        SetInfo(guild.name, guild.iconURL());
        SetInfoLOG(guild.name, guild.iconURL(), client);
        name = guild.name;
        icon = guild.iconURL();
        Run();
    }, 5000);
});

//! Run when a user clicks the button
client.on('interactionCreate', interaction => {
	if (!interaction.isButton()) return;

    // Respond to the interaction
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: config.buttonPress,
                flags: 64,
            }
        }
    })

    // Set the user for the embeds
    SetUser(interaction.user);

    // Send the correct embed according to the statements below
    if(interaction.member.roles.cache.some(role => role.id === config.questionOptions.roleID)) {
        interaction.user.send({ embeds: [Role(interaction.user)] });
    } else if(interaction.user.test && interaction.user.test.fail) {
        interaction.user.send({ embeds: [Time(interaction.user)] });
    } else if(interaction.user.test && (interaction.user.test.intro || interaction.user.test.started)) {
        interaction.user.send({ embeds: [Started(interaction.user)] });
    } else {
        interaction.user.send({ embeds: [Private(interaction.user)] });
        interaction.user.test = new User(interaction.user.id, true, false, 0, [], false, null, null);

        // Remove the permission of seeing the channel for the user
        client.channels.cache.get(config.rulesID).permissionOverwrites.create(interaction.user, {
            VIEW_CHANNEL: false
        })
    }
})

//! Send/Update the message in the channel
function Run() {
    // Create button
    const button = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
            .setCustomId('tick')
            .setStyle('SECONDARY')
            .setEmoji(config.emoji)
    );

    // Send/Update the message
    if(!dontchange.messageID) {
        client.channels.cache.get(config.channelID).send({ embeds: [Channel()], components: [button] }).then(msg => {
            editFileID(msg.id);
        })
    } else{
        client.channels.cache.get(config.channelID).messages.fetch({around: dontchange.messageID, limit: 1}).then(msg => {
            let fetchedMsg = msg.first();
            let newEmbed = Channel();
            fetchedMsg.edit({ embeds: [newEmbed], components: [button] });
        })
    }

}

//! Run when a user sends a message
client.on('messageCreate', msg => {

    // Check if the message was sent by a bot
    if(msg.author.bot) return;

    //? start command
    if(msg.content === 'start') {
        if(msg.guildId || !msg.author.test || !msg.author.test.intro) return;

        msg.author.test.intro = false;
        msg.author.test.started = true;
        startTest(msg.author);
    }

    //? help command
    if(msg.content === '!help' || msg.mentions.has(client.user.id)) {
        if(!msg.guildId) return;
        if(msg.content.includes('@here') || msg.content.includes('@everyone')) return;

        const embed = new Discord.MessageEmbed()
        .setColor('BLURPLE')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setTitle(':file_folder: Help')
        .setDescription('**Commands:**\n:arrow_right: `!help` - Shows this message\n\n:arrow_right: `!info @user` - Lists some useful information about the user\n\n:arrow_right: `!status [status-text]` - Sets the bot\'s status\n\n:arrow_right: `!status delete` - Deletes the bot\'s status\n\n:arrow_right: `!restart` - Restarts the bot\n\n:arrow_right: `!stop` - Stops the bot');

        msg.channel.send({ embeds: [embed] })
    }

    //? info command
    if(msg.content.startsWith('!info')) {
        const member = client.guilds.cache.get(dontchange.serverID).members.cache.get(msg.author.id);

        if(!msg.guildId || !member.roles.cache.has(config.staffRoleID)) return;

        const errorEmbed = new Discord.MessageEmbed()
        .setColor('RED')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription('**Invalid usage!** :x:\n```!info @user```');

        if(!msg.mentions.members.first()) return msg.channel.send({ embeds: [errorEmbed] });
        let user = msg.mentions.members.first().user;

        let cooldown;
        let fails;
        if(!user.test || !user.test.timeLeft) {
            cooldown = '- Test cooldown: 0';
        } else {
            cooldown = `+ Test cooldown: ${Math.round((((config.questionOptions.again - user.test.timeLeft) / 6000000) * 100 + Number.EPSILON) * 100) / 100} minute(s)`;
        }
        if(!user.fails || !user.fails.num) {
            fails = '- Fails: 0';
        } else {
            fails = `+ Fails: ${user.fails.num}`;
        }

        const embed = new Discord.MessageEmbed()
        .setColor('BLURPLE')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL())
        .setDescription(`**${user} (${user.username}#${user.discriminator})**\`\`\`diff\n${cooldown}\n${fails}\`\`\``);

        msg.channel.send({ embeds: [embed] })
    }

    //? restart command
    if(msg.content === '!restart') {
        if(!msg.guildId || msg.guild.ownerId !== msg.author.id) return;

        const embed = new Discord.MessageEmbed()
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
            }, 2000);
            setTimeout(() => {
                client.destroy();
                exec("node .", (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            }, 3000);
        })
    }

    //? stop command
    if(msg.content === '!stop') {
        if(!msg.guildId || msg.guild.ownerId !== msg.author.id) return;

        const embed = new Discord.MessageEmbed()
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
            }, 1000);
            setTimeout(() => {
                process.exit(1);
            }, 2000);
        })
    }

    //? status command
    if(msg.content.startsWith('!status')) {
        const member = client.guilds.cache.get(dontchange.serverID).members.cache.get(msg.author.id);
        if(!msg.guildId || !member.roles.cache.has(config.staffRoleID)) return;
        const status = msg.content.slice(8);

        const errorEmbed = new Discord.MessageEmbed()
        .setColor('RED')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription('**Invalid usage!** :x:\n```!status [status-text]```');

        if(!status) return msg.channel.send({ embeds: [errorEmbed] });

        if(status === 'delete') {
            client.user.setActivity('');
            return editFileStatus('');
        }

        const embed = new Discord.MessageEmbed()
        .setColor('BLURPLE')
        .setTimestamp(new Date())
        .setFooter(name, icon)
        .setTitle(':electric_plug: Status')
        .setDescription(`\nStatus successfully updated :white_check_mark:\n\`\`\`${status}\`\`\``);

        msg.channel.send({ embeds: [embed] });
        client.user.setActivity(status, { type: 'PLAYING' });
        editFileStatus(status)
    }
})
//#endregion

//#region Login
client.login(config.token);
//#endregion