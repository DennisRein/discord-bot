

module.exports = {
	name: 'guildMemberAdd',
	async execute(client, member) {
        const { welcomeChannel, ruleChannel } = require('../dev-config.json');
        
        const channel = client.channels.cache.get(welcomeChannel);
        const channelRule = client.channels.cache.get(ruleChannel);

        let message = `Willkommen ${member}, viel Spaß im Igelbau 🎉🤗 ! Infos zu den Regeln findest du in ${channelRule} und ansonsten kannst du dich gerne auch fragend an Moderatoren wenden. :>`
        
        channel.send(message);
	},
};