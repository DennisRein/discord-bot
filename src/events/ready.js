

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.db.sync();
		startInterval(client);
	},
};

function startInterval(client) {
	var moment = require('moment'); // require

	return interval = setInterval (function () {       
		client.db.autoMessageModel.findAll().then((messageList) => {
			for(let message of messageList) {
				let msg = message.dataValues;
				let now = Date.now();   
				let interval = msg.interval;
				let lastSend = msg.lastsend;    
				var newDate = moment(lastSend).add(interval, 'm').toDate();
				if(now >= newDate){
					let channel = client.channels.cache.get(msg.channel);
					client.db.autoMessageModel.update({ lastsend: now }, { where: { id: msg.id } });

					channel.send(msg.message);
				 }
			}
		})
	  }, 60 * 1000); 
}