const { SlashCommandBuilder, ChannelType } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reply-to-message')
        .setDescription('Antworte auf eine private Wunschbrunnen Nachricht')
        .addStringOption(option =>
            option.setName("id")
                .setDescription("Die ID auf die du Antworten möchtest:")
                .setRequired(true)
        ),
    async execute(interaction) {
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        if(!interaction.client.configExists()) {
			await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });	
			return; 
		}
        
        const { guildId, wunschBrunnenChannel } = interaction.client.config;

        let id = interaction.options.get("id").value;

        let wunschbrunnen = await fetchWunschbrunnen(interaction, id);
        if(!wunschbrunnen)
            return interaction.reply("Ich konnte keine Nachricht mit der gegebenen ID finden");

        let guild = interaction.client.guilds.cache.get(guildId);
        let channel = guild.channels.cache.get(wunschBrunnenChannel);
        let member = await interaction.client.users.fetch(wunschbrunnen.userid);
        let sendMsg = await channel.messages.fetch(wunschbrunnen.message);

        let botMessage = "Antworte bitte auf diese Nachricht mit der Nachricht die du senden willst, du hast eine Minute Zeit: ";
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
            collector.on('collect', collected => {
                member.send(collected.content);
                sendMsg.react("✅");
                interaction.followUp(`Die Antwort wurde gesendet.`);
            })
        });




    },
};

async function fetchWunschbrunnen(interaction, id) {

    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    let wunschbrunnen = await interaction.client.db.wunschbrunnenModel.findOne({ where: { id: id } });

    if (wunschbrunnen) {
        return wunschbrunnen;
    }

    return null;
}
