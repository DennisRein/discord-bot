const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Initialisiere den Bot!')
        .addChannelOption(option =>
            option.setName("log-channel").setDescription("In welchen Channel soll ich meinen Log Output schreiben?").setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("hi-bye-channel").setDescription("In welchen Channel soll ich auflisten, falls jemand kommt und geht?").setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("faultierhalle").setDescription("Welcher Channel ist die Faultierhalle?").setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("rules-channel").setDescription("Welcher Channel ist der Regel Channel, auf den ich neue User verweise?").setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("twitch-channel").setDescription("In welchen Channel schreibe ich die Benachrichtigung, dass Honeyball live ist?").setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("welcome-channel").setDescription("In welchem Channel soll ich die Neuen willkommen heißen?").setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("wunschbrunnen-channel").setDescription("In welchen Channel werden private Anliegen von Benutzern mit euch geteilt?").setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("base-role").setDescription("Welche Rolle ist die Faultierrolle?").setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("activity-role").setDescription("Welche Rolle erhalten User nach erreichen von 15000 Aktivitätspunkten?").setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.client.memberHasPermission(interaction.member)) {
            await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });
            return;
        }

        // Config initialisieren
        const cfg = {
            rules: {
                channel: interaction.options.getChannel("faultierhalle").id,
                baseRole: interaction.options.getRole("base-role").id,
            },
            guildId: interaction.guild.id,
            clientId: interaction.client.id,
            logChannel: interaction.options.getChannel("log-channel").id,
            ruleChannel: interaction.options.getChannel("rules-channel").id,
            welcomeChannel: interaction.options.getChannel("welcome-channel").id,
            wunschBrunnenChannel: interaction.options.getChannel("wunschbrunnen-channel").id,
            twitchNotificationChannel: interaction.options.getChannel("twitch-channel").id,
            hiByeChannel: interaction.options.getChannel("hi-bye-channel").id,
            activityRole: interaction.options.getRole("activity-role").id,
        };

        interaction.client.config = cfg;

        await interaction.reply('Hallo, ich bin Axobotl. Ich stelle dir ein paar Fragen damit ich starten kann!');

        // Twitch-Live-Nachricht abfragen
        await frageNachText(interaction, "Wie soll die Nachricht aussehen, wenn Honeyball live geht?", "twitchLiveMessage", async () => {
            // Willkommensnachricht abfragen
            await frageNachText(interaction, 'Mit welcher Willkommensnachricht soll ich neue Member grüßen? Benutze "{0}" für den Namen und "{1}" für den Regelchannel.', "welcomeMessage", async () => {
                // Accept-Message abfragen
                await frageNachText(interaction, 'Welche Nachricht sollen neue Benutzer in die Faultierhalle schreiben um freigeschalten zu werden?', "acceptMessage", async () => {
                    // Mod-Rollen Auswahl
                    const roles = getModRoles(interaction);
                    const activityRoleRow = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('modRole-done')
                            .setPlaceholder('Mod Rollen?')
                            .addOptions(roles)
                            .setMinValues(1)
                    );
                    await interaction.followUp({ content: 'Welche Rollen zählen als "Mod Rollen" und können dementsprechend reagieren?', components: [activityRoleRow] });
                });
            });
        });
    },
};

async function frageNachText(interaction, frage, key, cb) {
    await interaction.followUp({ content: frage, fetchReply: true }).then(() => {
        const SECONDS_TO_REPLY = 60;
        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: SECONDS_TO_REPLY * 1000, max: 1 });

        collector.on('collect', async collected => {
            if (key === "acceptMessage") {
                if (!interaction.client.config.rules) interaction.client.config.rules = {};
                interaction.client.config.rules.acceptMessage = collected.content;
            } else {
                interaction.client.config[key] = collected.content;
            }
            if (typeof cb === "function") await cb();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.deleteReply();
            }
        });
    });
}

function getModRoles(interaction) {
    return interaction.guild.roles.cache
        .filter(role => role.name.toLowerCase().includes("mod"))
        .map(role => ({
            label: role.name,
            description: role.id,
            value: role.id
        }));
}
