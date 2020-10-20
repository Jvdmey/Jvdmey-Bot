const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const memberCount = require('./utils/memberCount');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', () =>{
  console.log('The Bot is ready!')
  memberCount(client)
})

client.on('guildMemberAdd', guildMember =>{
  guildMember.roles.set([config.MEMBER_ROLE,config.MEMBERCAT_ROLE])
})

client.login(config.BOT_TOKEN);