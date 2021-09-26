//#region Imports
//* NPM packages
const Discord = require('discord.js');

//* JSON files
const config = require('../config.json');
//#endregion

//#region Variables
let name;
let icon;
//#endregion

//#region Functions
const SetInfo = (sentName, sentIcon) => {
    name = sentName;
    icon = sentIcon;
}

const Private = user => {
    let embed = config.privateEmbed;
    const embedMessage = new Discord.MessageEmbed()
    .setColor(embed.color)
    .setAuthor(`Welcome to the test, ${user.username}!`, user.avatarURL())
    .setDescription(`**:book: Information:**\n:arrow_right: You will have to answer **${config.questionOptions.questions.length}** questions using **reactions**\n\n:arrow_right: If you answer **${config.questionOptions.success}%** of the questions correctly your test is successful. If your test is not successful you can try again in **${config.questionOptions.again / 60000} minute(s)**\n\n:arrow_right: You have **${config.questionOptions.questionTime / 60000} minute(s)** for each question\n\n**When you are ready type** \`start\` **to start the test! Good luck! :wink:**`)
    .setTimestamp(new Date())
    .setFooter(name, icon);
    
    return embedMessage;
}

const Time = user => {
    const embedMessage = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`:alarm_clock: You can't retry yet, ${user.username}!`)
    .setDescription(`You will be able to retry the test in ${Math.round((((config.questionOptions.again - user.test.timeLeft) / 6000000) * 100 + Number.EPSILON) * 100) / 100} minute(s)`)
    .setTimestamp(new Date())
    .setFooter('🚧 If you think this is an error please contact our Staff!');
    
    return embedMessage;
}

const Failed = user => {
    const embed = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle(`:alarm_clock: Your time has run out, ${user.username}!`)
        .setDescription(`You can try again in **${config.questionOptions.again / 60000} minute(s)**!`)
        .setFooter('🚧 If you think this is an error please contact our Staff!')
        .setTimestamp(new Date());

    return embed;
}

const Role = user => {
    const embedMessage = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`:warning: You can't take the test again, ${user.username}!`)
    .setDescription('You have already gotten access to the server, so you can\'t complete the test again!')
    .setTimestamp(new Date())
    .setFooter('🚧 If you think this is an error please contact our Staff!');
    
    return embedMessage;
}

const Started = user => {
    const embedMessage = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`:warning: You are already taking the test, ${user.username}!`)
    .setDescription('You should be answering to the test\'s questions right now.')
    .setTimestamp(new Date())
    .setFooter('🚧 If you think this is an error please contact our Staff!');
    
    return embedMessage;
}

const Channel = () => {
    const embed = config.embedMessage;
    const embedMessage = new Discord.MessageEmbed()
    .setColor(embed.color)
    .setTitle(embed.title)
    .setAuthor(name, icon)
    .setDescription(embed.description)
    .setThumbnail(embed.thumbnail);
    
    return embedMessage;
}

const Question = (question, index) => {
    const embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setAuthor(`Question #${index+1}`, icon)
        .setDescription(question.question);
    
    for(let i = 0; i < question.answers.length; i++) {
        embed.description += `\n${i+1}. ${question.answers[i]}`
    }

    return embed;
}
//#endregion

//#region Export
module.exports = { SetInfo, Private, Time, Failed, Role, Started, Channel, Question };
//#endregion