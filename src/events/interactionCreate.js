const { Role, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");




module.exports = {
        name: 'interactionCreate',
        async execute(client, interaction) {
                const commands = require("./interactions/commands.js");
                const selection = require("./interactions/selection.js");

                if (interaction.isCommand()) commands(client, interaction);

                if (interaction.isSelectMenu()) {
                        selection(client, interaction);
                }
        },
};