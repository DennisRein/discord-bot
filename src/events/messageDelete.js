

module.exports = {
	name: 'messageDelete',
	async execute(client, message) {
        const writeLogMessage = require("../utils/writeLogMessage.js");

        writeLogMessage({client: client, type: "messageDelete", args: message});
	},
};

