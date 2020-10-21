module.exports = client => {
	const CHANNEL_ID = '767719721487302686'
	
	const updateMembers = guild => {
		const channel = guild.channels.cache.get(CHANNEL_ID)
		channel.setName(`〔👥〕Members: ${guild.memberCount}`)
		console.log('Member Count has changed!')
	}

	client.on('guildMemberAdd', member => updateMembers(member.guild))
	client.on('guildMemberRemove', member => updateMembers(member.guild))

	const guild = client.guilds.cache.get('680470021084152040')
	updateMembers(guild)
}