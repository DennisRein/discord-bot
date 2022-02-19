

module.exports = {
	name: 'guildMemberAdd',
	async execute(client, member) {
        const { welcomeChannel, ruleChannel } = client.config;
        
        const writeLogMessage = require("../utils/writeLogMessage.js");
        
        const channel = client.channels.cache.get(welcomeChannel);
        const channelRule = client.channels.cache.get(ruleChannel);

        writeLogMessage({client: client, type: "guildMemberAdd", args: member});

        let message = `Willkommen ${member}, viel Spaß im Igelbau 🎉🤗 ! Infos zu den Regeln findest du in ${channelRule} und ansonsten kannst du dich gerne auch fragend an Moderatoren wenden. :>`
        
        channel.send(message);
	},
};

