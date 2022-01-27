

module.exports = {
	name: 'messageUpdate',
	async execute(client, oldMessage, newMessage) {
        const writeLogMessage = require("../utils/writeLogMessage.js");

        writeLogMessage({client: client, type: "messageUpdate", args: oldMessage, newMessage});
	},
};

