

module.exports = {
	name: 'voiceStateUpdate',
	async execute(client, oldState, newState) {
        const { voiceRole } = require('../dev-config.json');
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