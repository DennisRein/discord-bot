const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-automatic-message')
        .setDescription('Verändere eine vom Bot automatisch gesendete Nachricht mithilfe der ID.')
        .addIntegerOption(option =>
            option
                .setName('id')
                .setRequired(true)
                .setDescription('Die ID der zu entfernenden Nachricht: /show-automatic-messages')),
    async execute(interaction) {
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        if(!interaction.client.configExists()) {
			await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });	
			return; 
		}
        let id = interaction.options.get("id").value;

        let botMessage = "Antworte bitte auf diese Nachricht mit der veränderten Nachricht die du senden willst, du hast eine Minute Zeit: ";
		await interaction.reply({ content: botMessage, fetchReply: true }).then(message => {
  
            const SECONDS_TO_REPLY = 60 // replace 60 with how long to wait for message(in seconds).
            const MESSAGES_TO_COLLECT = 1
            const filter = (m) => m.author.id == interaction.user.id
            const collector = interaction.channel.createMessageCollector({filter, time: SECONDS_TO_REPLY * 1000, max: MESSAGES_TO_COLLECT})
            collector.on('end', collected => {
                if (collected.size <= 0) {
                    interaction.deleteReply();
                    
                }
            });
            collector.on('collect', async (collected) => {
                const affectedRows = await interaction.client.db.autoMessageModel.update({ message: collected.content }, { where: { id: id } });

                if (affectedRows > 0) {
                    return interaction.followUp(`Nachricht ${id} wurde erfolgreich editiert.`);
                }

                return interaction.followUp(`Ich konnte keine Nachricht mit der gegebenen ID finden.`);
            })
        });

    },
};