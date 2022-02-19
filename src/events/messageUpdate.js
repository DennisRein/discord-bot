

module.exports = {
	name: 'messageUpdate',
	async execute(client, oldMessage, newMessage) {
		if(!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');	
            return; 
        }
        const writeLogMessage = require("../utils/writeLogMessage.js");

		if(oldMessage.author.id === client.id) return;

        writeLogMessage({client: client, type: "messageUpdate", args: oldMessage, newMessage});
	},
};

