const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-automatic-message')
        .setDescription('Verändere eine vom Bot automatisch gesendete Nachricht mithilfe der ID.')
        .addIntegerOption(option =>
            option
                .setName('id')
                .setRequired(true)
                .setDescription('Die ID der zu bearbeitenden Nachricht: /show-automatic-messages')),
    async execute(interaction) {
        if (!interaction.client.memberHasPermission(interaction.member)) {
            await interaction.reply({
                content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.',
                flags: 64 // Ephemeral
            });
            return;
        }
        if (!interaction.client.configExists()) {
            await interaction.reply({
                content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!',
                flags: 64 // Ephemeral
            });
            return;
        }
        const id = interaction.options.getInteger("id");

        const botMessage = "Antworte bitte auf diese Nachricht mit der veränderten Nachricht, die du senden willst. Du hast eine Minute Zeit:";
        await interaction.reply({ content: botMessage });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60_000, max: 1 });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                // Antwort wurde nicht gegeben -> Reply löschen
                try { await interaction.deleteReply(); } catch { }
            }
        });

        collector.on('collect', async collected => {
            const affectedRows = await interaction.client.db.autoMessageModel.update(
                { message: collected.content },
                { where: { id: id } }
            );

            if (affectedRows[0] > 0) {
                await interaction.followUp(`Nachricht mit der ID ${id} wurde erfolgreich editiert.`);
            } else {
                await interaction.followUp(`Ich konnte keine Nachricht mit der gegebenen ID finden.`);
            }
        });
    },
};
