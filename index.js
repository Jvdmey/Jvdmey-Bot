const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const ytdl = require('ytdl-core');
const memberCount = require('./utils/memberCount');
const client = new Discord.Client();
const queue = new Map()

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

client.on('message', async message =>{
  if(message.author.bot) return
  if(!message.content.startsWith(config.CMD_PREFIX)) return

  const args = message.content.substring(config.CMD_PREFIX.length).split(" ")
  const serverQueue = queue.get(message.guild.id)

  if (message.content.startsWith(`${config.CMD_PREFIX}play`)) {
    const voiceChannel = message.member.voice.channel
    if(!voiceChannel) return message.channel.send("You need to be in a channel to play music.")
    const permissions = voiceChannel.permissionsFor(message.client.user)
    if(!permissions.has('CONNECT')) return message.channel.send("I don\'t have permission to connect to the voice channel.")
    if(!permissions.has('SPEAK')) return message.channel.send("I don\'t have permission to speak in the channel.")

    const songInfo = await ytdl.getInfo(args[1])
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    }

    if(!serverQueue){
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      }
      queue.set(message.guild.id, queueConstruct)
      queueConstruct.songs.push(song)
    
      try{
        var connection = await voiceChannel.join()
        queueConstruct.connection = connection
        play(message.guild, queueConstruct.songs[0])
      }catch (error){
        console.log(`There was an error connecting to the voice channel: ${error}`)
        queue.delete(message.guild.id)
        return message.channel.send(`There was an error connecting to the voice channel ${error}`)
      }
    }else{
      serverQueue.songs.push(song)
      return message.channel.send(`**${song.title}** has been added to the queue!`)
    }
    return undefined

  }else if(message.content.startsWith(`${config.CMD_PREFIX}stop`)){
    if(!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to stop the music.")
    if(!serverQueue) return message.channel.send("There is nothing playing")
    serverQueue.songs = []
    serverQueue.connection.dispatcher.end()
    message.channel.send("I have stoped the music for you :)")
    return undefined
  }else if (message.content.startsWith(`${config.CMD_PREFIX}skip`)){
    if(!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to skip the music")
    if(!serverQueue) return message.channel.send("There is nothing playing")
    serverQueue.connection.dispatcher.end()
    message.channel.send("I have skipped to the next song!")
    return undefined
  }
})
function play(guild, song){
  const serverQueue = queue.get(guild.id)

  if(!song){
    serverQueue.voiceChannel.leave()
    queue.delete(quild, id)
    return
  }

  const dispatcher = serverQueue.connection.play(ytdl(song.url))
  .on('finish', () =>{
    serverQueue.songs.shift()
    play(guild, serverQueue.songs[0])
  })
  .on('error', error =>{
    console.log(error)
  })
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
}

client.login(config.BOT_TOKEN);