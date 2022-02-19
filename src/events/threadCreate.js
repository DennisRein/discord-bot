const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'threadCreate',
	async execute(client, thread) {
        if (thread.joinable) 
        {
            await thread.join();

        }
    }
        
};
