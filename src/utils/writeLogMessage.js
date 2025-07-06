const { EmbedBuilder } = require('discord.js');

module.exports = async function writeLogMessage({client, type, ...args}) {
    const { logChannel, clientId, hiByeChannel } = client.config;
    const channel = client.channels.cache.get(logChannel);
    const hbChannel = client.channels.cache.get(hiByeChannel);

    switch(type) {
        case "guildMemberAdd":
            console.log("guildMemberAdd");
            return hbChannel.send({embeds: [getMemberEmbed(args.args)]});

        case "messageUpdate":
            console.log("messageUpdate");
            if(args.args.author && args.args.author.id === clientId) return;
            const oldMessage = args.args;
            const newMessage = args.newMessage;
            if(oldMessage.content === newMessage.content) return;
            if(!oldMessage.content || !newMessage.content) return;
            if(oldMessage.content.length + newMessage.content.length > 5500) {
                await channel.send({embeds: [getSingleMessageUpdateEmbed(client, args, false)]});
                return channel.send({embeds: [getSingleMessageUpdateEmbed(client, args, true)]});
            }
            return channel.send({embeds: [getMessageEditedEmbed(client, args)]});

            case "messageDelete":
                console.log("messageDelete");
                if(!args.args.author || args.args.author.id === clientId || !args.args.content) {
                    let msg = await client.db.messagesModel.findOne({ where: { id: args.args.id } });
                    if (msg) {
                        args.args.channelId = msg.channel;
                        args.args.content = msg.message;
                        const user = await client.users.fetch(msg.sender);
                        args.args.author = user;
                    }
                }
                const deletedEmbed = await getMessageDeletedEmbed(client, args.args);
                if (deletedEmbed) {
                    return channel.send({embeds: [deletedEmbed]});
                } else {
                    // Optionale Logik: Fallback-Nachricht oder einfach nichts tun
                    console.log("Kein Embed zum Senden (getMessageDeletedEmbed hat null geliefert).");
                    return;
                }
    
        case "guildMemberUpdate":
            console.log("guildMemberUpdate");
            return channel.send({embeds: [getRoleChangedEmbed(args)]});

        case "nicknameChanged":
            console.log("nicknameChanged", args.args.user.username, args.newMember.user.username);
            if( args.args.user.username !== args.newMember.user.username)
                return channel.send({embeds: [getNicknameChangedEmbed(args)]});
            break;

        case "purge":
            console.log("purge");
            return channel.send({embeds: [getPurgedEmbed(args)]});

        case "userTimeouted":
            console.log("userTimeouted");
            return channel.send({embeds: [getTimeoutedEmbed(args, "getimeouted")]});

        case "userUntimeouted":
            console.log("userUntimeouted");
            return channel.send({embeds: [getTimeoutedEmbed(args, "Timeout entfernt")]});

        case "userKicked":
            console.log("userKicked");
            return channel.send({embeds: [getTimeoutedEmbed(args, "gekickt")]});

        case "userBanned":
            console.log("userBanned");
            return channel.send({embeds: [getTimeoutedEmbed(args, "gebannt")]});

        case "botDetected":
            console.log("botDetected");
            console.log(JSON.stringify(args));
            await channel.send({content: `<@&541051990697050132>`});
            return channel.send({embeds: [getBotEmbed(args)]});

        case "inactivePurge":
            console.log("inactivePurge");
            return channel.send({embeds: [getInactivePurgedEmbed(args)]});

        case "userLeft":
            console.log("userLeft");
            return hbChannel.send({embeds: [getUserLeftEmbed(args)]});
    }
}

// --- Embeds ---

function getUserLeftEmbed(args) {
    return new EmbedBuilder()
        .setTitle(`${args.args.user.username} <${args.args.user.discriminator}> hat den Server verlassen ${args.args.user.bot ? "war ein **bot**" : ""}`);
}

function getInactivePurgedEmbed(args) {
    return new EmbedBuilder()
        .setTitle(`Ich habe ${args.args} Benutzer vom Server entfernt die nach zwei Wochen keine Rolle erhalten haben.`);
}

function getBotEmbed(args) {
    return new EmbedBuilder()
        .setTitle(`${args.message.author.username} <${args.message.author.discriminator}> wurde von mir getimeouted.`)
        .addFields(
            { name: "Ziel", value: `${args.message.author}` },
            { name: "Grund", value: "Verdacht auf Bot" },
            { name: "Nachricht", value: args.message.content }
        );
}

function getTimeoutedEmbed(args, type) {
    let embed = new EmbedBuilder();
    embed.setTitle(`Benutzer ${type}`);
    embed.addFields(
        { name: "Benutzer:", value: `${args.args.user}` },
        { name: "Name:", value: `${args.args.user.username} <${args.args.user.discriminator}>` },
        { name: "Von:", value: `${args.entry.executor}` }
    );
    return embed;
}

function getPurgedEmbed(args) {
    let user = args.args?.user;
    let channel = args.channel;
    let amount = args.messageIDs?.length || 0;
    let sender = args.interaction?.user;
    let embed = new EmbedBuilder()
        .setTitle(`Nachrichten purged.`)
        .addFields(
            { name: "Von:", value: `${sender}` }
        );
    if(user) embed.addFields({ name: "Vom Nutzer: ", value: `${user.username} <${user.discriminator}>` });
    if(channel) embed.addFields({ name: "Im Channel: ", value: `<#${channel.id}>` });
    if(amount) embed.addFields({ name: "Anzahl:", value: amount.toString() });
    return embed;
}

function getMemberEmbed(member) {
    return new EmbedBuilder()
        .setTitle(`Ein User ist beigetreten: ${member.user.bot ? "war ein **bot**" : ""}`)
        .addFields(
            { name: "Benutzer", value: `${member.user}` },
            { name: "Name", value: member.user.username + `<${member.user.discriminator}>` },
            { name: 'Beigetreten:', value: new Date(member.joinedTimestamp).toISOString() }
        );
}

function trimMessages(msg) {
    const n = 1023;
    let msgs = msg.match(new RegExp('.{1,' + n + '}', 'g'));
    return msgs;
}

function getSingleMessageUpdateEmbed(client, args, isNew) {
    let msg = isNew ? args.newMessage : args.args;
    const channel = client.channels.cache.get(msg.channelId);

    let embed = new EmbedBuilder()
        .setTitle('Nachricht bearbeitet')
        .addFields(
            { name: 'Von', value: `${msg.author} ${msg.author.username} <${msg.author.discriminator}>` },
            { name: 'Channel:', value: `<#${channel.id}>` },
            { name: 'Zeitpunkt:', value: new Date(msg.editedTimestamp).toISOString() }
        );

    if(msg.content.length > 1023) {
        let msgs = trimMessages(msg.content);
        let i = 1;
        for(let part of msgs) {
            embed.addFields({ name: isNew ? `Neue Nachricht Part ${i}` : `Alte Nachricht Part ${i}`, value: part });
            i++;
        }
    }
    else {
        embed.addFields({ name: isNew ? `Neue Nachricht` : `Alte Nachricht`, value: msg.content ?? "_Ich war leider nicht da, als die alte Nachricht geschrieben wurde" });
    }
    return embed;
}

function getMessageEditedEmbed(client, args) {
    const oldMessage = args.args;
    const newMessage = args.newMessage;
    const channel = client.channels.cache.get(oldMessage.channelId);

    let embed = new EmbedBuilder()
        .setTitle(`Nachricht bearbeitet`)
        .addFields(
            { name: 'Von', value: `${newMessage.author} ${newMessage.author.username} <${newMessage.author.discriminator}>` },
            { name: 'Channel:', value: `<#${channel.id}>` },
            { name: 'Zeitpunkt:', value: new Date(newMessage.editedTimestamp).toISOString() }
        );

    if(oldMessage.content.length > 1023) {
        let msgs = trimMessages(oldMessage.content);
        let i = 1;
        for(let msg of msgs) {
            embed.addFields({ name: `Alte Nachricht Part ${i}`, value: msg });
            i++;
        }
    }
    else {
        embed.addFields({ name: "Alte Nachricht", value: oldMessage.content ?? "_Ich war leider nicht da, als die alte Nachricht geschrieben wurde" });
    }

    if(newMessage.content.length > 1023) {
        let msgs = trimMessages(newMessage.content);
        let i = 1;
        for(let msg of msgs) {
            embed.addFields({ name: `Neue Nachricht Part ${i}`, value: msg });
            i++;
        }
    }
    else {
        embed.addFields({ name: "Neue Nachricht", value: newMessage.content ?? "_Ich war leider nicht da, als die alte Nachricht geschrieben wurde" });
    }
    return embed;
}

async function getMessageDeletedEmbed(client, message) {
    if (!message.guild) return null;

    const channel = client.channels.cache.get(message.channelId);

    // Verhindere leere oder ungültige Embeds
    if (!message.author || !message.author.username || !channel) return null;

    const embed = new EmbedBuilder()
        .setTitle(`Nachricht gelöscht`)
        .addFields(
            { name: 'Benutzer:', value: `${message.author}` },
            { name: 'Name:', value: `${message.author.username} <${message.author.discriminator}>` },
            { name: 'Channel:', value: `<#${channel.id}>` }
        );

    if(message.content && message.content.length > 0) {
        if (message.content.length > 1023) {
            let msgs = trimMessages(message.content);
            let i = 1;
            for(let msg of msgs) {
                embed.addFields({ name: `Nachricht Part ${i}`, value: msg });
                i++;
            }
        } else {
            embed.addFields({ name: "Nachricht:", value: message.content });
        }
    } else {
        embed.addFields({ name: "Nachricht:", value: "_Ich war leider nicht da, als die Nachricht geschrieben wurde_" });
    }
    try {
        const entry = await message.guild.fetchAuditLogs({ type: 72 }).then(audit => audit.entries.find(e => e.target.id === message.author.id));
        if(entry && entry.executor) {
            embed.addFields({ name: "Gelöscht von:", value: `${entry.executor}` });
        }
    } catch(e) {
        // Ignore
    }
    return embed;
}

function getRoleChangedEmbed(args) {
    let user = args.newMember.user;
    let embed =  new EmbedBuilder()
        .setTitle(`Rolle ${args.args ? "hinzugefügt" : "entfernt"}.`)
        .addFields(
            { name: 'Benutzer:', value: `${user}` },
            { name: 'Name:', value: `${user.username} <${user.discriminator}>` }
        );
    for(let r of args.roles) {
        embed.addFields({ name: 'Rolle:', value: r.name });
    }
    return embed;
}

function getNicknameChangedEmbed(args) {
    let oldMemberName = args.args.nickname ?? args.args.user.username;
    let newMemberName = args.newMember.nickname ?? args.newMember.user.username;
    return new EmbedBuilder()
        .setTitle(`Nickname Änderung.`)
        .addFields(
            { name: 'Von:', value: `${args.args.user}` },
            { name: 'Alter Name:', value: oldMemberName },
            { name: 'Neuer Name:', value: newMemberName }
        );
}
