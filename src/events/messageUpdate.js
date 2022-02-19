

module.exports = {
	name: 'messageUpdate',
	async execute(client, oldMessage, newMessage) {
        const writeLogMessage = require("../utils/writeLogMessage.js");

		if(oldMessage.author.id === client.id) return;

        writeLogMessage({client: client, type: "messageUpdate", args: oldMessage, newMessage});
	},
};

