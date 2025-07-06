const { SlashCommandBuilder } = require('@discordjs/builders');
const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change-option')
        .setDescription('Änder eine einzelne Option!')
        .addStringOption(option =>
            option.setName('einstellung')
                .setDescription('Willst du nur einen Eintrag ändern?')
                .setRequired(true)
                .addChoices(
                    { name: 'Accept Message', value: 'rule.acceptMessage' },
                    { name: 'Aktivitätsrolle', value: 'activityRole' },
                    // { name: 'Bot Log Channel', value: 'logChannel' },
                    // { name: 'Faultierhalle', value: 'rules.channel' },
                    { name: 'Faultier, bzw. Rolle für Neue', value: 'rule.baseRole' },
                    // { name: 'Hi-Bye-Channel', value: 'hiBye' },
                    { name: 'Mod Rollen', value: 'modRoles' },
                    { name: 'Purge Intervall', value: 'purgeInterval' },
                    // { name: 'Regel Channel', value: 'ruleChannel' },
                    // { name: 'Twitch Live Channel', value: 'twitchNotificationChannel' },
                    { name: 'Twitch Live Nachricht', value: 'twitchLiveMessage' },
                    { name: 'Voice Rolle', value: 'voiceRole' },
                    // { name: 'Willkommens Channel', value: 'welcomeChannel' },
                    { name: 'Willkommens Nachricht', value: 'welcomeMessage' },
                    // { name: 'Wunschbrunnen Channel', value: 'wunschBrunnenChannel' }
                )
        ),
    async execute(interaction) {
        if (!interaction.client.memberHasPermission(interaction.member)) {
            await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });
            return;
        }

        const option = interaction.options.getString("einstellung") ?? null;

        if (option) {
            if (!interaction.client.configExists()) {
                await interaction.reply({
                    content: 'Bevor du einzelne Einstellungen änderst, führe bitte einen kompletten Setup aus.',
                    ephemeral: true
                });
                return;
            }
            await changeOption(interaction, option);
            return;
        }

        // Fallback – kommt praktisch nie vor
        interaction.client.config = {};
        interaction.client.config.guildId = interaction.guild.id;
        interaction.client.config.clientId = interaction.client.id;

        await interaction.reply('Hallo, ich bin Axobotl. Ich stelle dir ein paar Fragen damit ich starten kann!');
        const roles = getRoles(interaction);

        const activityRoleRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('modRole-selection')
                    .setPlaceholder('Mod Rollen?')
                    .addOptions(roles)
                    .setMinValues(1)
            );

        await interaction.followUp({
            content: `Welche Rollen zählen als "Mod Rollen" und können dementsprechend reagieren?`,
            components: [activityRoleRow]
        });
    },
};

async function changeOption(interaction, option) {
    interaction.client.singleOptionChange = true;
    switch (option) {
        case 'rule.acceptMessage':
            await frageNachText(interaction,
                "Welche Nachricht sollen neue Benutzer in die Faultierhalle schreiben um freigeschalten zu werden? Antworte bitte auf diese Nachricht mit der Phrase.",
                content => {
                    if (!interaction.client.config.rules) interaction.client.config.rules = {};
                    interaction.client.config.rules.acceptMessage = content;
                }
            );
            await updateConf(interaction); // Nur hier, weil der Input synchron erfolgt
            break;

        case 'activityRole':
            await selectOption(
                interaction,
                'activityRole-selection',
                'Welche Rolle erhalten User nach erreichen von 15000 Aktivitätspunkten?',
                getRoles(interaction)
            );
            break;

        case 'rule.baseRole':
            await selectOption(
                interaction,
                'baseRole-selection',
                'Welche Rolle erhalten Benutzer, nachdem sie diese Phrase angegeben haben?',
                getRoles(interaction)
            );
            break;

        case 'modRoles':
            await selectOption(
                interaction,
                'modRole-selection',
                'Welche Rollen zählen als "Mod Rollen"?',
                getRoles(interaction),
                1,
                getRoles(interaction).length
            );
            break;

        case 'purgeInterval':
            await selectOption(
                interaction,
                'purgeInterval-selection',
                'Nach wievielen Tagen soll ich Benutzer ohne Rolle vom Server entfernen?',
                getDays()
            );
            break;

        case 'twitchLiveMessage':
            await frageNachText(interaction,
                "Wie soll die Nachricht aussehen, wenn Honeyball live geht? Antworte bitte auf diese Nachricht mit der Nachricht.",
                content => interaction.client.config.twitchLiveMessage = content
            );
            await updateConf(interaction); // Auch hier, weil synchron
            break;

        case 'voiceRole':
            await selectOption(
                interaction,
                'voiceRole-selection',
                'Welche Rolle erhalten Benutzer in Voice Channeln?',
                getRoles(interaction)
            );
            break;

        case 'welcomeMessage':
            await frageNachText(interaction,
                'Mit welcher Willkommensnachricht soll ich neue Member grüßen? Benutze "{0}" als Platzhalter für den Nutzernamen und "{1}" als Platzhalter für den Regelchannel:',
                content => interaction.client.config.welcomeMessage = content
            );
            await updateConf(interaction); // Auch hier, weil synchron
            break;

        default:
            await interaction.reply({ content: 'Option nicht implementiert.', ephemeral: true });
            return;
    }
    // Kein generelles updateConf mehr hier!
}

async function frageNachText(interaction, frage, onCollect) {
    await interaction.reply({ content: frage, fetchReply: true });
    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 60_000, max: 1 });

    return new Promise(resolve => {
        collector.on('collect', async collected => {
            onCollect(collected.content);
            resolve();
        });
        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.deleteReply();
                resolve();
            }
        });
    });
}

async function selectOption(interaction, customId, text, options, minValues = 1, maxValues = 1) {
    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(text)
            .addOptions(options)
            .setMinValues(minValues)
            .setMaxValues(maxValues)
    );
    await interaction.reply({ content: text, components: [row] });
    // Kein updateConf hier!
}

async function updateConf(interaction) {
    const createConf = require("../utils/createConfig");
    createConf(interaction.client);
    await interaction.followUp({ content: `Einstellung wurde aktualisiert.` });

    const schedule = require('node-schedule');
    let schedName = 'midnight';
    schedule.cancelJob(schedName);
    clearInterval(interaction.client.interval);

    interaction.client.emit('ready', interaction.client);
    interaction.client.singleOptionChange = false;
}

function getRoles(interaction) {
    return [...interaction.guild.roles.cache.values()].map(role => ({
        label: role.name,
        description: role.id,
        value: role.id
    }));
}

function getChannels(interaction) {
    return [...interaction.guild.channels.cache.values()]
        .filter(channel => channel.type === ChannelType.GuildText)
        .map(channel => ({
            label: channel.name,
            description: channel.id,
            value: channel.id
        }));
}

function getDays() {
    return Array.from({ length: 24 }, (_, i) => ({
        label: (i + 1).toString(),
        description: "Days",
        value: (i + 1).toString()
    }));
}
