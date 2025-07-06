module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        const commands = require("./interactions/commands.js");
        const selection = require("./interactions/selection.js");

        try {
            if (interaction.isChatInputCommand?.()) {
                // Slash Commands
                await commands(client, interaction);
            } else if (interaction.isStringSelectMenu?.()) {
                // Moderne SelectMenus (StringSelectMenu)
                await selection(client, interaction);
            } else if (interaction.isSelectMenu?.()) {
                // Legacy/alte SelectMenus zur Rückwärtskompatibilität
                await selection(client, interaction);
            }
        } catch (err) {
            console.error("Fehler bei interactionCreate:", err);
            // Fehler-Handling: User bekommt IMMER Rückmeldung
            if (interaction.replied || interaction.deferred) {
                try {
                    await interaction.followUp({ content: 'Beim Ausführen des Befehls ist ein Fehler aufgetreten.', flags: 64 }); // 64 = ephemeral
                } catch { /* ignore */ }
            } else {
                try {
                    await interaction.reply({ content: 'Beim Ausführen des Befehls ist ein Fehler aufgetreten.', flags: 64 }); // 64 = ephemeral
                } catch { /* ignore */ }
            }
        }
    },
};
