

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		const { guildId } = require('../dev-config.json');

		client.db.sync();
		startInterval(client);
		const writeLogMessage = require("../utils/writeLogMessage.js");

		var schedule = require('node-schedule');

		schedule.scheduleJob('0 0 * * * *', async () => {
			console.log("Midnight");

			var moment = require('moment'); // require


			const list = await client.guilds.fetch(guildId);
			let member = await list.members.fetch();
			let count = 0;
			for (let m of member) {
				m = m[1];
				if (m.roles.cache.size <= 1) {
					let joined = m.joinedTimestamp
					var newDate = moment(Date.now()).add("-14", 'days').toDate();
					if (joined < newDate) {
						//
						if (m.kickable) {
							console.log(m[1].user.username);
							count++;
							//m.kick()
						}
					}
				}
			}
			if (count > 0) {
				writeLogMessage({ client: client, type: "inactivePurge", args: count });
			}


		}) // run everyday at midnight
	},
};

async function startInterval(client) {
	var moment = require('moment'); // require
	const { MessageEmbed } = require('discord.js');

	const { guildId, twitchNotificationChannel } = require('../dev-config.json');
	let guild = await client.guilds.fetch(guildId); 
	let channel = await guild.channels.fetch(twitchNotificationChannel);
	let liveFlag = false;

	return interval = setInterval(async function () {
		
		client.twitch.isStreamLive("giorap90").then(stream => {
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
				channel.send({ embeds: [twitchEmbed] });
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

					channel.send(msg.message);
				}
			}
		})
		client.db.timedRolesModel.findAll().then(async (entries) => {
			for (let entry of entries) {
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
		})
	}, 60 * 1000);
}