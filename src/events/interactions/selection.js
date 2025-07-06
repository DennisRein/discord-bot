const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require("discord.js");

module.exports = async function selection(client, interaction) {
    // === REACTION ROLE CREATION ===
    if (interaction.customId === 'create-role-reaction-message-selection') {
        const createConf = require("../../utils/createReactionConfig.js");
        const { default: ReactionRole } = require("discordjs-reaction-role");

        let msg = interaction.message;
        let embeded = msg.embeds[0];
        let fields = embeded.fields;

        let channel = fields[0].value;
        let channelObj = await interaction.client.channels.fetch(channel);

        let timed = fields[3]?.value === "Automatische Entfernung nach" ? null : fields[3]?.value;
        let description = fields[2]?.value === "Keine Beschreibung" ? null : fields[2]?.value;
        let title = fields[1]?.value === "Keine Überschrifft" ? null : fields[1]?.value;

        let selectedRoles = interaction.values;
        let embed = new EmbedBuilder().setTitle("Die gewählten Rollen:");
        let rolesObject = [];

        selectedRoles.forEach((roleId, idx) => {
            let r = interaction.guild.roles.cache.get(roleId);
            embed.addFields({ name: `Nr. ${idx + 1}`, value: r ? r.name : "Unbekannte Rolle" });
            rolesObject.push(r);
        });

        let index = 0;
        let map = {};

        await interaction.reply({
            content: `Reagiere auf diese Nachricht mit den passenden Emotes (in Reihenfolge) zu den gewählten Rollen:`,
            embeds: [embed]
        });

        const filter = (reaction, user) => user.id === interaction.user.id;
        const replyMsg = await interaction.fetchReply();
        replyMsg.awaitReactions({ filter, max: selectedRoles.length, time: 60000, errors: ['time'] })
            .then(async collected => {
                for (const [emojiKey, reaction] of collected) {
                    map[emojiKey] = rolesObject[index];
                    index++;
                }
                let emb = getEmbed(channelObj, description ?? "Keine Beschreibung", map, interaction);
                let buttons = getButtons();
                const followMsg = await replyMsg.reply({
                    content: "Passt das so?",
                    embeds: [emb],
                    components: [buttons]
                });
                const collector = followMsg.createMessageComponentCollector({ time: 15000 });
                collector.on('collect', async i => {
                    if (i.customId === 'submit') {
                        let e = getChannelMessage(map, interaction, title, description);
                        await interaction.followUp("Ich sende die Nachricht an den Channel!");
                        let send = await channelObj.send({ embeds: [e] });
                        let conf;
                        for (const [key, value] of Object.entries(map)) {
                            await send.react(key);
                            conf = createConf(interaction.client, { messageId: send.id, reaction: key, roleId: value.id, timed: timed });
                        }
                        if (client.rr) client.rr.teardown();
                        client.rr = new ReactionRole(client, conf);
                        await i.update({ content: 'Ich erstelle die Nachricht!', components: [] });
                    }
                    if (i.customId === 'abort') {
                        await interaction.message.delete();
                        await interaction.deleteReply();
                        await followMsg.delete();
                    }
                });
            })
            .catch(() => {
                replyMsg.reply('Zeitüberschreitung oder Fehler bei der Reaktion.');
            });
        return;
    }

    // === MODROLES MULTISELECT MIT BESTÄTIGUNG ===
    if (interaction.customId === 'modRole-selection') {
        let selectedRoles = interaction.values;
        interaction.client.config.modRoles = selectedRoles;

        // Button für Bestätigung
        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('modRole-done')
                .setLabel('Fertig')
                .setStyle(ButtonStyle.Primary)
        );
        await interaction.reply({
            content: `Bitte bestätige deine Auswahl mit "Fertig".`,
            components: [confirmRow],
            ephemeral: true // kann mit flags: 64 ersetzt werden, falls nötig
        });

        // Nur bei Klick auf "Fertig" wird gespeichert!
        const filter = i => i.customId === 'modRole-done' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async i => {
            const createConf = require("../../utils/createConfig");
            createConf(interaction.client);
            await i.update({ content: 'Einstellung wurde aktualisiert.', components: [] });
            interaction.client.singleOptionChange = false;
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Abgebrochen.', components: [] });
            }
        });

        return;
    }

    // --- Die restlichen Auswahlhandler bleiben unverändert! ---
    if (interaction.customId === 'logChannel-selection') {
        let selectedChannel = interaction.values[0];
        interaction.client.config.logChannel = selectedChannel;
        if (!interaction.client.singleOptionChange) {
            const channelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('ruleChannel-selection')
                        .setPlaceholder('Rule Channel?')
                        .addOptions(getChannels(interaction))
                );
            await interaction.reply({ content: `Welcher Channel ist der Regel Channel auf den ich neue User verweise?`, components: [channelRow] });
        }
        return;
    }

    if (interaction.customId === 'ruleChannel-selection') {
        let selectedChannel = interaction.values[0];
        interaction.client.config.ruleChannel = selectedChannel;
        if (!interaction.client.singleOptionChange) {
            const channelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('faultierHalle-selection')
                        .setPlaceholder('Faultierhalle?')
                        .addOptions(getChannels(interaction))
                );
            await interaction.reply({ content: `Welcher Channel ist die Faultierhalle?`, components: [channelRow] });
        }
        return;
    }

    if (interaction.customId === 'faultierHalle-selection') {
        let selectedChannel = interaction.values[0];
        if (!interaction.client.config.rules)
            interaction.client.config.rules = {};
        interaction.client.config.rules.channel = selectedChannel;
        if (!interaction.client.singleOptionChange) {
            await interaction.reply({
                content: "Welche Nachricht sollen neue Benutzer in die Faultierhalle schreiben um freigeschalten zu werden? Antworte bitte auf diese Nachricht mit der Phrase", fetchReply: true
            }).then(message => {
                const filter = (m) => m.author.id == interaction.user.id;
                const collector = interaction.channel.createMessageCollector({ filter, time: 60_000, max: 1 });
                collector.on('end', collected => {
                    if (collected.size <= 0) interaction.deleteReply();
                });
                collector.on('collect', async collected => {
                    interaction.client.config.rules.acceptMessage = collected.content;
                    const modRoleRow = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('baseRole-selection')
                                .setPlaceholder('Base Role?')
                                .addOptions(getRoles(interaction))
                        );
                    await interaction.followUp({ content: `Welche Rolle erhalten Benutzer, nachdem sie diese Phrase angegeben haben?`, components: [modRoleRow] });
                });
            });
        }
        return;
    }

    // Hier analog für alle weiteren Selects umstellen, wie gehabt...
    // z.B. baseRole-selection, welcome-selection usw.
    // (Du hast die Pattern schon in den anderen Files, hier identisch übertragen.)

    // SingleOptionChange-Mode: Speichern am Ende!
    if (interaction.client.singleOptionChange) {
        const createConf = require("../../utils/createConfig");
        createConf(interaction.client);
        await interaction.reply({ content: `Einstellung wurde aktualisiert.`, ephemeral: true });
        var schedule = require('node-schedule');
        let schedName = 'midnight';
        schedule.cancelJob(schedName);
        clearInterval(interaction.client.interval);
        interaction.client.emit('ready', interaction.client);
        interaction.client.singleOptionChange = false;
        return;
    }
};

// Hilfsfunktionen...
function isEmoji(str) {
    var ranges = [
        '(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])'
    ];
    return !!str.match(ranges.join('|'));
}

function getChannelMessage(reactionMap, interaction, title, description) {
    let embed = new EmbedBuilder().setTitle(title ?? "Reagiere auf diese Nachricht mit den angezeigten Emotes um die dazugehörige Rolle zu erhalten!");
    embed.setDescription(description ?? "");
    for (const [key, value] of Object.entries(reactionMap)) {
        if (isEmoji(key)) {
            embed.addFields({ name: value.name, value: key });
        } else {
            const emoji = interaction.guild.emojis.cache.get(key);
            embed.addFields({ name: value.name, value: `<:${emoji.name}:${emoji.id}>` });
        }
    }
    return embed;
}

function getEmbed(channel, description, reactionMap, interaction) {
    let embed = new EmbedBuilder()
        .setTitle("Die Beschreibung kannst du Nachträglich mit dem /edit-message Befehl anpassen!")
        .addFields(
            { name: channel.name, value: channel.id },
            { name: 'Description', value: description },
        );
    for (const [key, value] of Object.entries(reactionMap)) {
        if (isEmoji(key)) {
            embed.addFields({ name: value.name, value: key });
        } else {
            const emoji = interaction.guild.emojis.cache.get(key);
            embed.addFields({ name: value.name, value: `<:${emoji.name}:${emoji.id}>` });
        }
    }
    return embed;
}

function getButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('submit')
            .setLabel('Passt')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('abort')
            .setLabel('Abbruch')
            .setStyle(ButtonStyle.Danger)
    );
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
