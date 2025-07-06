const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Zeige alle Commands an.'),
    async execute(interaction) {
        if (!interaction.client.memberHasPermission(interaction.member)) {
            await interaction.reply({
                content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.',
                flags: 64 // ephemeral
            });
            return;
        }

        const commands = interaction.client.commands;
        const embed = new EmbedBuilder()
            .setTitle("Eine Liste aller Commands:");

        // Richtige Iteration über die Collection
        for (const command of commands.values()) {
            if (command.data && command.data.name && command.data.description) {
                embed.addFields({ name: `/${command.data.name}`, value: command.data.description });
            }
        }

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });
    },
};
