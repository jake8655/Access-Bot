//#region Imports
//* NPM packages
import { MessageEmbed } from 'discord.js';

//* Functions
import { Question, Failed } from './createEmbed.js';
import { StartLOG, EndLOG, EndTimeLOG, BanLOG, UnBanLOG } from './log.js';

//* Data files
import dotenv from 'dotenv';
dotenv.config();
import { env as config } from 'process';
import { default as questionConfig } from '../questions.js';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("../data/dontchange.json");
//#endregion

let client;

//#region Functions
//! Send the client over from index.js
const SetClient = sentClient => {
    client = sentClient;
}

//! Runs when the user starts the test
async function startTest(user) {
    StartLOG(user);

    // Random number generator
    const randomGen = max => {
        return Math.floor(Math.random() * max) + 1;
    }

    //? Loop through each question and send it as an embed
    for(let i = 0; i < questionConfig.questions.length; i++) {

        let randQuestion = randomGen(questionConfig.questions.length);
        let good = true;
    
        // If the random question was already answered generate a new one
        if(user.test.answers.length > 0) {
            user.test.answers.forEach(answer => {
                if(answer.index+1 == randQuestion) good = false;
                while(!good) {
                    if(answer.index+1 == randQuestion) {
                        randQuestion = randomGen(questionConfig.questions.length);
                    } else {
                        good = true;
                    }
                }
            })
        }

        // Wait until an unanswered question was generated
        await new Promise(resolve => {
            if(good) resolve(1);
        })

        // Send the question to the user
        let msg = await user.send({ embeds: [Question(questionConfig.questions[randQuestion-1], i)] });

        let reactions;
        switch(questionConfig.questions[randQuestion-1].answers.length) {
            case 1:
                reactions = ['1️⃣'];
            break;
            case 2:
                reactions = ['1️⃣', '2️⃣'];
            break;
            case 3:
                reactions = ['1️⃣', '2️⃣', '3️⃣'];
            break;
            case 4:
                reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
            break;
        }
        // Add the appropriate reactions
        for(let y = 0; y < reactions.length; y++) {
            await msg.react(reactions[y]);
            if(y === reactions.length-1) await sent();
        }

        // Trigger when the reactions were added
        async function sent() {
            // Start question timer
            user.test.time = setTimeout(async () => {
                i = questionConfig.questions.length;
                msg.delete();
                user.fails = { timer: null, num: user.fails ? ++user.fails.num : 1 };

                if(user.fails.num < 3) await user.send({ embeds: [Failed(user)] });

                EndTimeLOG(user);
                return startTimer(user, client.channels.cache.get(config.rulesID));
            }, questionConfig.questionTime);
    
            // Filter out bot reactions and those that aren't the appropriate emojis
            const filter = (reaction, user) => {
                return !user.bot && reactions.includes(reaction.emoji.name);
            }

            // Listen for reactions
            const ansCollector = msg.createReactionCollector({filter, time: questionConfig.questionTime });
            await new Promise(async (resolve) => {
                ansCollector.on('collect', async (reaction) => {
                    resolve(reaction);

                    if(user.test.fail) {
                        i = questionConfig.questions.length;
                        clearTimeout(user.test.time);
                    } else {
                        user.test.answers.push({ answer: convertEmoji(reaction.emoji.name), index: randQuestion-1 });
                        clearTimeout(user.test.time);
                        if(i === questionConfig.questions.length - 1) endTest(user, client.guilds.cache.get(data.serverID).roles.cache.get(questionConfig.roleID), client.guilds.cache.get(data.serverID).members.cache.get(user.id), client.channels.cache.get(config.rulesChannelID));
                    }
                    msg.delete();
                });
            })

        }

        // Convert emojis to numbers
        function convertEmoji(emoji) {
            let number
            switch(emoji) {
                case '1️⃣':
                    number = 1;
                break;
                case '2️⃣':
                    number = 2;
                break;
                case '3️⃣':
                    number = 3;
                break;
                case '4️⃣':
                    number = 4;
                break;
            }
            return number;
        }
    }
}

//! Runs when the user ends the test
async function endTest(user, role, roleUser, rulesChannel) {
    let embed = new MessageEmbed().setTimestamp(new Date());

    // Remove wrong answers from the array
    let correct = user.test.answers.filter(answerObj => answerObj.answer === questionConfig.questions[answerObj.index].correct);

    // Calculate the percentage
    user.test.percentage = convertToDecimal(correct.length / questionConfig.questions.length);

    if(user.test.percentage >= questionConfig.success) {
        //? Trigger when the user's percentage is over 80%
        embed.setTitle(':white_check_mark: You successfully completed the test!')
        .setDescription(`Percentage: **${user.test.percentage}%**\nYou have gotten the **${role.name}** role and now have access to the server!`)
        .setFooter('Congratulations! 🎉')
        .setColor('GREEN');
        roleUser.roles.add(role);
        EndLOG(user);
        delete user.test;
        if(user.fails) delete user.fails;
        user.send({ embeds: [embed] });
    } else {
        //? Trigger when the user's percentage is below 80%
        embed.setTitle(':x: You have failed the test!')
        .setDescription(`Percentage: **${user.test.percentage}%**\nYou can try again later in **${questionConfig.again / 60000} minute(s)**!\n\nIf you think this is an error please contact our **Staff**!`)
        .setFooter('Better luck next time! 🙂')
        .setColor('RED');
        
        user.fails = { timer: null, num: user.fails ? ++user.fails.num : 1 };
        if(user.fails.num < questionConfig.banFail) user.send({ embeds: [embed] });

        EndLOG(user);
        startTimer(user, rulesChannel);
    }

    // Make the user see the rules channel again
    rulesChannel.permissionOverwrites.delete(user.id);
}

//! Runs when the user fails the test
async function startTimer(user, rulesChannel) {
    // Make the user see the rules channel again
    rulesChannel.permissionOverwrites.delete(user.id);

    user.test = { id: user.id, fail: true, timer: null, timeLeft: 0 };

    if(user.fails.num === 3) {
        BanLOG(user);
        const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(`You have been temporarily banned from ${rulesChannel.guild.name}!`, user.avatarURL())
        .setDescription(`You have **failed** to successfully complete the test for the \`3. time\`, so you have been temporarily banned for **${questionConfig.banTime/60000} minute(s)**.\nFeel free to **join back** and **try again** when your ban has expired.\n\nInvite link: ${config.serverInvite}`)
        .setTimestamp(new Date())
        .setFooter(rulesChannel.guild.name, rulesChannel.guild.iconURL());
        await user.send({ embeds: [embed] });

        rulesChannel.guild.members.ban(user.id, {
            reason: 'Failing to successfully complete the test for the 3. time.'
        })
        user.fails.timer = setTimeout(() => {
            rulesChannel.guild.members.unban(user.id);
            UnBanLOG(user);
            delete user.test;
            delete user.fails;
        }, questionConfig.banTime);
    } else {
        //? Start the timer
        user.test.timer = setInterval(() => {
            user.test.timeLeft += 5000;
            if(user.test.timeLeft >= questionConfig.again) {
                clearInterval(user.test.timer);
                delete user.test;
            }
        }, 5000);
    }
}

function convertToDecimal(number) {
    return Math.round((number * 100 + Number.EPSILON) * 100) / 100
}
//#endregion

export { SetClient, startTest, endTest, startTimer, convertToDecimal };