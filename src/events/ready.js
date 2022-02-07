

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

function startInterval(client) {
	var moment = require('moment'); // require

	return interval = setInterval(function () {
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
	}, 60 * 1000);
}