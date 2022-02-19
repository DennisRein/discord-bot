

module.exports = {
	name: 'voiceStateUpdate',
	async execute(client, oldState, newState) {
        if(!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');	
            return; 
        }
        const { voiceRole } = client.config;
        if(!oldState.channelId) {
            if(newState.channel.type === 'GUILD_VOICE') {
                newState.member.roles.add(voiceRole);
            }
        }

        if(!newState.channelId && oldState.channelId) {
            newState.member.roles.remove(voiceRole);
        }
	},
};