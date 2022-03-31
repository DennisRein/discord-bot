

module.exports = {
	name: 'ready',
	once: false,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		console.log("Loading Bad Domains");
		await client.badDomainChecker.init();

		client.db.sync();
		
		//client.user.setActivity('melde dich hier anonym',{type: "PLAYING"});

		if(!client.configExists()) {
			return; 
		}
		const { guildId, purgeInterval } = client.config;

		client.interval = startInterval(client);
		const writeLogMessage = require("../utils/writeLogMessage.js");

		var schedule = require('node-schedule');

		let schedName = 'midnight';

		schedule.scheduleJob(schedName, '0 0 0 * * *', async () => {
			var moment = require('moment'); // require


			const list = await client.guilds.fetch(guildId);
			let member = await list.members.fetch();
			let count = 0;
			for (let m of member) {
				m = m[1];
				if (m.roles.cache.size <= 1) {
					let joined = m.joinedTimestamp
					var newDate = moment(Date.now()).add(`-${purgeInterval}`, 'days').toDate();
					if (joined < newDate) {
						//
						if (m.kickable) {
							console.log(m);
							count++;
							//  Enable KICK
							//m.kick()
						}
					}
				}
			}
			if (count > 0) {
				writeLogMessage({ client: client, type: "inactivePurge", args: count });
			}
		}) 
	},
};

async function startInterval(client) {
	var moment = require('moment'); // require
	const { MessageEmbed } = require('discord.js');

	const { guildId, twitchNotificationChannel, twitchLiveMessage } = client.config;
	let guild = await client.guilds.fetch(guildId); 
	let channel = await guild.channels.fetch(twitchNotificationChannel);
	let liveFlag = false;

	return interval = setInterval(async function () {
		
		client.twitch.isStreamLive("honeyball").then(stream => {
			if(!liveFlag && stream) {
				liveFlag = true;
				let url = "https://twitch.tv/honeyball"
				const twitchEmbed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle(stream.title)
				.setURL(url)
				.setAuthor({ name: stream.displayName, iconURL: stream.profilePic, url: url })
				.addFields(
					{ name: 'Game', value: `${stream.gameName}`, inline: true },
					{ name: 'Viewers', value: `${stream.viewers}`, inline: true },
				)
				.setImage(stream.thumbnail)
				.setTimestamp()		
				channel.send({ content: twitchLiveMessage, embeds: [twitchEmbed] });
			}
			else if(liveFlag && !stream) {
				liveFlag = false;
			}
		});
		

		client.db.autoMessageModel.findAll().then((messageList) => {
			for (let message of messageList) {
				let msg = message.dataValues;
				let now = Date.now();
				let interval = msg.interval;
				let lastSend = msg.lastsend;
				var newDate = moment(lastSend).add(interval, 'm').toDate();
				if (now >= newDate) {
					let channel = client.channels.cache.get(msg.channel);
					client.db.autoMessageModel.update({ lastsend: now }, { where: { id: msg.id } });

					let embed = new MessageEmbed();
					embed.title = msg.title;
					embed.description = msg.message;
					channel.send({embeds: [embed]});
				}
			}
		})
		client.db.timedRolesModel.findAll().then(async (entries) => {
			for (let entry of entries) {
				try {
					
					let e = entry.dataValues;
					let now = Date.now();
					let roleid = e.roleid;
					let messageid = e.messageid;
					let userid = e.userid;
					let channelid = e.channelid;
					let reaction = e.reactionid;

					let guild = await client.guilds.fetch(guildId)
					let member = await guild.members.fetch(userid);
					let channel = await guild.channels.fetch(channelid);
					let message = await channel.messages.fetch(messageid);
					
					if (now >= e.loseroleafter) {
						message.reactions.resolve(reaction).users.remove(userid);
						member.roles.remove(roleid);
						client.db.timedRolesModel.destroy({ where: { userid: userid } });	
					}
				}
			catch(exception) {
				let e = entry.dataValues;
				let userid = e.userid;
				client.db.timedRolesModel.destroy({ where: { userid: userid } });	

				console.error("Problem with entry: ", entry);
			}
			}
		})
	}, 60 * 1000);
}