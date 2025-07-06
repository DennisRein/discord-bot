const { EmbedBuilder } = require('discord.js');
const schedule = require('node-schedule');
const moment = require('moment');

module.exports = {
    name: 'ready',
    once: false,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        // Lade Bad Domains (async)
        console.log("Loading Bad Domains");
        await client.badDomainChecker.init();

        // Datenbank sync
        await client.db.sync();

        if (!client.configExists()) {
            console.log("Keine Konfiguration gefunden, Bot wartet auf /setup.");
            return;
        }

        const { guildId, purgeInterval } = client.config;
        client.interval = startInterval(client);

        // Inaktive User jede Nacht entfernen
        schedule.scheduleJob('midnight', '0 0 0 * * *', async () => {
            try {
                const guild = await client.guilds.fetch(guildId);
                const members = await guild.members.fetch();
                let count = 0;
                for (const [, member] of members) {
                    // Members ohne echte Rolle und länger als purgeInterval dabei → kicken (max 100/Nacht)
                    if (member.roles.cache.size <= 1) {
                        const joined = member.joinedTimestamp;
                        const cutoff = moment().subtract(purgeInterval, 'days').valueOf();
                        if (joined < cutoff && member.kickable && count < 100) {
                            console.log(`Kick: ${member.user.tag}`);
                            await member.kick("Inactive, no roles");
                            count++;
                        }
                    }
                }
                if (count > 0) {
                    const writeLogMessage = require("../utils/writeLogMessage.js");
                    writeLogMessage({ client, type: "inactivePurge", args: count });
                }
            } catch (err) {
                console.error("Error during nightly purge:", err);
            }
        });
    },
};

// === Automatischer Intervall-Runner für Twitch & Auto-Messages ===
async function startInterval(client) {
    const { guildId, twitchNotificationChannel, twitchLiveMessage } = client.config;
    let guild = await client.guilds.fetch(guildId);
    let channel = await guild.channels.fetch(twitchNotificationChannel);
    let liveFlag = false;

    return setInterval(async () => {
        // Twitch-Live-Benachrichtigung
        if (client.twitch) {
            try {
                const stream = await client.twitch.isStreamLive("honeyball");
                if (!liveFlag && stream) {
                    liveFlag = true;
                    const url = "https://twitch.tv/honeyball";
                    const twitchEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(stream.title)
                        .setURL(url)
                        .setAuthor({ name: stream.displayName, iconURL: stream.profilePic, url })
                        .addFields(
                            { name: 'Game', value: `${stream.gameName}`, inline: true },
                            { name: 'Viewers', value: `${stream.viewers}`, inline: true }
                        )
                        .setImage(stream.thumbnail)
                        .setTimestamp();
                    await channel.send({ content: twitchLiveMessage, embeds: [twitchEmbed] });
                } else if (liveFlag && !stream) {
                    liveFlag = false;
                }
            } catch (e) {
                console.error("Twitch-Notification-Fehler:", e);
            }
        }

        // Automatische Nachrichten (AutoMessage-Feature)
        try {
            const messageList = await client.db.autoMessageModel.findAll();
            for (const message of messageList) {
                const msg = message.dataValues;
                const now = Date.now();
                const nextSend = moment(msg.lastsend).add(msg.interval, 'minutes').valueOf();
                if (now >= nextSend) {
                    let targetChannel = client.channels.cache.get(msg.channel);
                    await client.db.autoMessageModel.update({ lastsend: now }, { where: { id: msg.id } });
                    const embed = new EmbedBuilder()
                        .setTitle(msg.title)
                        .setDescription(msg.message);
                    await targetChannel.send({ embeds: [embed] });
                }
            }
        } catch (e) {
            console.error("Automessage-Interval-Fehler:", e);
        }
    }, 60 * 1000);
}
