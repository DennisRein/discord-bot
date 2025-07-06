const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
} = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        // Bot-eigene Nachrichten ignorieren
        if (message.author?.id === client.user.id) return;

        // Partials: ggf. nachladen
        if (message.partial) {
            try {
                await message.fetch();
            } catch (err) {
                console.log("Konnte Partial-Message nicht fetchen:", err);
                return;
            }
        }

        // "Leere" Nachrichten ignorieren (kein Text, kein Anhang, kein Embed)
        if (
            (!message.content || message.content.trim() === "") &&
            (!message.attachments || message.attachments.size === 0) &&
            (!message.embeds || message.embeds.length === 0)
        ) {
            console.log("Empty Message", {
                id: message.id,
                content: message.content,
                author: message.author?.tag,
                attachments: message.attachments?.size,
                embeds: message.embeds?.length,
                type: message.type,
            });
            return;
        }

        // --- AB HIER NUR NOCH "ECHTE" NACHRICHTEN ---

        // Nur Guild-Nachrichten speichern & Bot-Erkennung
        if (message.guildId) {
            if (message.content && message.content.trim() !== "") {
                await client.db.messages.create({
                    id: message.id,
                    sender: message.author.id,
                    message: message.content,
                    channel: message.channelId,
                    timestamp: Date.now()
                });
            }
            botTest(client, message);
        }

        // DM: Wunschbrunnen etc.
        if (!message.guildId) {
            const { guildId, wunschBrunnenChannel } = client.config ?? {};
            await client.db.wunschbrunnenModel.create({
                userid: message.author.id,
                message: message.content,
                sent: Date.now()
            });
            // Optional: Button-Interaktion etc. siehe Alt-Code
            return;
        }

        // Config-Prüfung
        if (!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');
            return;
        }
        const { rules, activityRole } = client.config;

        // === Faultierhalle: Freischalt-Phrase ===
        if (rules?.channel === message.channelId) {
            if (
                rules.acceptMessage &&
                typeof message.content === "string" &&
                message.content.toLowerCase().includes(rules.acceptMessage.toLowerCase()) &&
                rules.baseRole
            ) {
                let member = fetchMember(client, message);
                if (member) {
                    try {
                        await member.roles.add(rules.baseRole);
                        await message.delete();
                    } catch (e) {
                        console.log("Fehler beim Rollen-Add/Delete:", e);
                    }
                }
            }
        } else {
            // Nur relevante Nachrichten
            if (!message.content || message.content.length < 15) return;

            let user = await fetchUserModel(client, message);
            if (!user) return;

            // Aktivitätsrolle
            if (!hasRole(message, activityRole) && user.activity >= 15000) {
                let member = fetchMember(client, message);
                if (member) {
                    try {
                        await member.roles.add(activityRole);
                        await client.db.userModel.update({ hasrole: 1 }, { where: { id: user.id } });
                    } catch (e) {
                        console.log("Fehler beim Rollen-Add:", e);
                    }
                }
            }

            // XP nur einmal pro Minute
            let newDate = moment(user.lastmessage).add(1, 'm').toDate();
            if (Date.now() >= newDate) {
                let xp = 15 + (message.content.length > 2000 ? 35 : Math.floor(message.content.length * 0.0175));
                await client.db.userModel.update(
                    { lastmessage: Date.now(), activity: user.activity + xp },
                    { where: { id: user.id } }
                );
            }
        }
    },
};

// --- Hilfsfunktionen ---

function hasRole(message, activityRole) {
    return message.member?.roles.cache.has(activityRole);
}

async function botTest(client, message) {
    const writeLogMessage = require("../utils/writeLogMessage.js");

    let threshold = 4;
    let channels = {};
    let equalMessages = {};
    let messageIds = [];
    let msgs = await client.messageHelper.fetchMessagesByUser(message.author.id, threshold);

    for (let msg of msgs) {
        messageIds.push(msg.id);
        channels[msg.channel] = (channels[msg.channel] || 0) + 1;
        equalMessages[msg.message] = (equalMessages[msg.message] || 0) + 1;
    }
    // Bot-Verdacht: gleich viele Nachrichten in verschiedenen Channels
    const maxEqual = Math.max(0, ...Object.values(equalMessages));
    if (maxEqual >= threshold && Object.keys(channels).length >= threshold) {
        writeLogMessage({ client, type: "botDetected", args: msgs, message });
        let member = fetchMember(client, message);
        for (let msg of msgs) {
            await deleteMessage(client, msg.channel, msg.id);
        }
        if (!member || !member.kickable) return console.log("I cannot kick this member!");
        await member.timeout(12 * 60 * 60 * 1000);
        // member.kick();
    }
    return;
}

async function deleteMessage(client, channelId, messageId) {
    try {
        let channel = await client.channels.fetch(channelId);
        let msg = await channel.messages.fetch(messageId);
        await msg.delete();
    } catch (e) {
        console.log("Message can't be deleted");
    }
}

async function fetchUserModel(client, message) {
    let userId = message.author.id;
    let user = await client.db.userModel.findOne({ where: { userid: userId } });

    const member = fetchMember(client, message);

    if (user) return user;
    if (!member) return null;

    user = await client.db.userModel.create({
        userid: userId,
        username: member.user.username,
        lastmessage: Date.now(),
        joined: member.joinedTimestamp,
        activity: client.activity?.[userId] ?? 0
    });

    return user;
}

function fetchMember(client, message) {
    let guild = client.guilds.cache.get(message.guildId);
    return guild?.members.cache.get(message.author.id);
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
