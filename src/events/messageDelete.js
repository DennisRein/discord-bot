

module.exports = {
	name: 'messageDelete',
	async execute(client, message) {
		if(!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');	
            return; 
        }
        const writeLogMessage = require("../utils/writeLogMessage.js");

        writeLogMessage({client: client, type: "messageDelete", args: message});
	},
};

