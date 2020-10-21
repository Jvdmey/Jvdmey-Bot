/**
 * Import library's
 */

const { Client, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
const config = require('./config.json');
const memberCount = require('./util/memberCount');

/**
 * Variables
 */

const client = new Client({ disableMentions: "everyone" });

client.login(config.BOT_TOKEN);
client.commands = new Collection();
client.prefix = config.PREFIX;
client.queue = new Map();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Change member count and set roles to new joins
 */

client.on('ready', () =>{
  console.log(`${client.user.username} ready!`);
  client.user.setActivity(` [${config.PREFIX}help]`);
  memberCount(client)
})

client.on('guildMemberAdd', guildMember =>{
  guildMember.roles.set([config.MEMBER_ROLE,config.MEMBERCAT_ROLE])
})

/**
 * Import all commands
 */

const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(config.PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;
    
    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply("There was an error executing that command.").catch(console.error);
    }
  });