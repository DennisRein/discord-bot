

module.exports = {
	name: 'guildMemberAdd',
	async execute(client, member) {
        if(!client.configExists()) {
                console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');	
                return; 
        }
        const { welcomeChannel, ruleChannel, welcomeMessage } = client.config;
        
        const writeLogMessage = require("../utils/writeLogMessage.js");
        
        const channel = client.channels.cache.get(welcomeChannel);
        const channelRule = client.channels.cache.get(ruleChannel);

        writeLogMessage({client: client, type: "guildMemberAdd", args: member});

        const note = client.emojis.cache.find(emoji => emoji.name === "Note");
        const yuhu = client.emojis.cache.find(emoji => emoji.name === "yuhu");

        let message = welcomeMessage.replace("{0}", member).replace("{1}", channel)//`Willkommen ${member}, viel Spaß im Igelbau ${yuhu} ! Infos zu den Regeln findest du in ${channelRule} und ansonsten kannst du dich gerne auch fragend an Moderatoren wenden. ${note}`
        
        channel.send(message);
	},
};

