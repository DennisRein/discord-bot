const { MessageEmbed } = require('discord.js');


module.exports = async function writeLogMessage({client, type, ...args}) {
    
    const { logChannel, clientId, hiByeChannel } = client.config;

    const channel = client.channels.cache.get(logChannel);

    const hbChannel = client.channels.cache.get(hiByeChannel);
    switch(type) {
        case "guildMemberAdd": {
            console.log("guildMemberAdd")
            return hbChannel.send({embeds: [getMemberEmbed(args.args)]});
        }
        case "messageUpdate": {
            console.log("messageUpdate")
            if(args.args.author && args.args.author.id === clientId) return;
            const oldMessage = args.args;
            const newMessage = args.newMessage;
            if(oldMessage.content === newMessage.content) return;
	    if(!oldMessage.content || !newMessage.content) return;
            if(oldMessage.content.length + newMessage.content.length > 5500) {
                channel.send({embeds: [getSingleMessageUpdateEmbed(client, args, false)]})
                return channel.send({embeds: [getSingleMessageUpdateEmbed(client, args, true)]})

            }
            return channel.send({embeds: [getMessageEditedEmbed(client, args)]})
        }
        case "messageDelete": {
            console.log("messageDelete")
            if(!args.args.author) return;
            if(args.args.author.id === clientId) return;
            if(!args.args.content) return;
            return channel.send({embeds: [await getMessageDeletedEmbed(client, args.args)]})
        }
        case "guildMemberUpdate": {
            console.log("guildMemberUpdate")
            return channel.send({embeds: [getRoleChangedEmbed(args)]})
        }
        case "nicknameChanged": {
            console.log("nicknameChanged", args.args.user.usernam,  args.newMember.user.username)
            if( args.args.user.username !== args.newMember.user.username)
                return channel.send({embeds: [getNicknameChangedEmbed(args)]})
            break;
        }
        case "purge": {
            console.log("purge")
            //user, channel, messageIDs, interaction
            return channel.send({embeds: [getPurgedEmbed(args)]})
        }
        case "userTimeouted": {
            console.log("userTimeouted")
            //newMember, entry
            return channel.send({embeds: [getTimeoutedEmbed(args, "getimeouted")]})
        }
        case "userKicked": {
            console.log("userKicked")
            return channel.send({embeds: [getTimeoutedEmbed(args, "gekickt")]})

        }
        case "userBanned": {
            console.log("userBanned")
            return channel.send({embeds: [getTimeoutedEmbed(args, "gebannt")]})

        }
        case "botDetected": {
            console.log("botDetected")
            channel.send(`<@&541051990697050132>`)
            return channel.send({embeds: [getBotEmbed(args)]})

        }
        case "inactivePurge": {
            console.log("inactivePurge")
            return channel.send({embeds: [getInactivePurgedEmbed(args)]})
        }
        case "userLeft": {
            console.log("userLeft")

            return hbChannel.send({embeds: [getUserLeftEmbed(args)]})

        }
    }
}

function getUserLeftEmbed(args) {
    return new MessageEmbed()
        .setTitle(`${args.args.user.username} <${args.args.user.discriminator}> hat den Server verlassen ${args.args.user.bot ? "war ein **bot**" : ""}` )
    }

function getInactivePurgedEmbed(args) {
    return new MessageEmbed()
        .setTitle(`Ich habe ${args.args} Benutzer vom Server entfernt die nach zwei Wochen keine Rolle erhalten haben.`)
    }

function getBotEmbed(args) {
    return new MessageEmbed()
        .setTitle(`${args.message.author.username} <${args.message.author.discriminator}> wurde von mir getimeouted.`)
        .addField("Ziel", `${args.message.author}`)
        .addField("Grund", "Verdacht auf Bot")
        .addField("Nachricht", args.message.content)
    }

function getTimeoutedEmbed(args, type) {
    let embed = new MessageEmbed();
    embed.setTitle(`Benutzer ${type}`);
    embed.addField("Benutzer:", `${args.args.user}`)
    embed.addField("Name:", `${args.args.user.username} <${args.args.user.discriminator}>`)
    embed.addField("Von:", `${args.entry.executor}`)
    return embed;
}

function getPurgedEmbed(args) {
    let user = args.args?.user;
    let channel = args.channel;
    let amount = args.messageIDs.length;
    let sender = args.interaction.user;
    let embed = new MessageEmbed()
        .setTitle(`Nachrichten purged.`)

    embed.addField("Von:", `${sender}`)
    if(user) {
        embed.addField("Vom Nutzer: ", `${user.username} <${user.discriminator}>`);
    }

    if(channel) {
        embed.addField("Im Channel: ", `<#${channel.id}>`);
    }

    return embed;


}

function getMemberEmbed(member) {
    return new MessageEmbed()
        .setTitle(`Ein User ist beigetreten: ${member.user.bot ? "war ein **bot**" : ""}`)
        .addFields(
            { name: "Benutzer", value: `${member.user}` },
            { name: "Name", value: member.user.username + `<${member.user.discriminator}>` },
                { name: 'Beigetreten:', value: new Date(member.joinedTimestamp).toISOString() },
        );
}

function trimMessages(msg) {
    n = 1023;
    let msgs = msg.match(new RegExp('.{1,' + n + '}', 'g'));
    return msgs;
}

function getSingleMessageUpdateEmbed(client, args, isNew) {
    let msg;
    if(isNew) msg = args.newMessage;
    else msg = args.args;
    const channel = client.channels.cache.get(msg.channelId);
    const channelName = channel.name;

    let embed = new MessageEmbed();
    embed.setTitle('Nachricht bearbeitet')
    embed.addField('Von', `${msg.author} ${msg.author.username} <${msg.author.discriminator}>`)
    embed.addFields(
            { name: 'Channel:', value: `<#${channel.id}>` },
            { name: 'Zeitpunkt:', value: new Date(msg.editedTimestamp).toISOString()},
    );

    if(msg.content.length > 1023) {
        let msgs = trimMessages(msg.content)
        let i = 1;
        for(let msg of msgs) {
            embed.addField(isNew ? `Neue Nachricht Part ${i}` : `Alte Nachricht Part ${i}`, msg)
            i++;
        }
    }
    else {
        embed.addField(isNew ? `Neue Nachricht Part ${i}` : `Alte Nachricht Part ${i}`, msg.content  ?? "_Ich war leider nicht da, als die alte Nachricht geschrieben wurde")
    }
    return embed;
}

function getMessageEditedEmbed(client, args) {
    const oldMessage = args.args;
    const newMessage = args.newMessage;
    const channel = client.channels.cache.get(oldMessage.channelId);
    const channelName = channel.name;

    let embed = new MessageEmbed();
    embed.setTitle(`Nachricht bearbeitet`)
    embed.addField('Von', `${newMessage.author} ${newMessage.author.username} <${newMessage.author.discriminator}>`)
    embed.addFields(
            { name: 'Channel:', value: `<#${channel.id}>` },
            { name: 'Zeitpunkt:', value: new Date(newMessage.editedTimestamp).toISOString()},
    );

    if(oldMessage.content.length > 1023) {
        let msgs = trimMessages(oldMessage.content)
        let i = 1;
        for(let msg of msgs) {
            embed.addField(`Alte Nachricht Part ${i}`, msg)
            i++;
        }
    }
    else {
        embed.addField("Alte Nachricht", oldMessage.content  ?? "_Ich war leider nicht da, als die alte Nachricht geschrieben wurde")
    }

    if(newMessage.content.length > 1023) {
        let msgs = trimMessages(newMessage.content)
        let i = 1;
        for(let msg of msgs) {
            embed.addField(`Neue Nachricht Part ${i}`, msg)
            i++;
        }
    }
    else {
        embed.addField("Neue Nachricht", newMessage.content  ?? "_Ich war leider nicht da, als die alte Nachricht geschrieben wurde")
    }
    return embed;
}


async function getMessageDeletedEmbed(client, message) {    
    const channel = client.channels.cache.get(message.channelId);
    const channelName = channel.name;
    const embed = new MessageEmbed()
    .setTitle(`Nachricht gelöscht`)
    .addFields(

        { name: 'Benutzer:', value: `${message.author}` },
        { name: 'Name:', value: `${message.author.username} <${message.author.discriminator}>` },
            { name: 'Channel:', value: `<#${channel.id}>` },
    );
    if(message.content.length > 1023) {
        let msgs = trimMessages(message.content)
        let i = 1;
        for(let msg of msgs) {
            embed.addField(`Neue Nachricht Part ${i}`, msg)
            i++;
        }
    }
    else {
        embed.addField("Nachricht:", message.content ?? "_Ich war leider nicht da, als die Nachricht geschrieben wurde_")
    }
    const entry = await message.guild.fetchAuditLogs().then(audit => audit.entries.first())
    if(entry.actionType === 'DELETE' && entry.targetType ===  'MESSAGE' && entry.target.id === message.author.id) {
        embed.addField("Gelöscht von:", `${entry.executor}`)
    }

    return embed;


}

function getRoleChangedEmbed(args) {
    let user = args.newMember.user;
    let embed =  new MessageEmbed();
    embed.setTitle(`Rolle ${args.args ? "hinzugefügt" : "entfernt"}.`)
    embed.addField('Benutzer:', `${user}`)
    embed.addField('Name:', `${user.username} <${user.discriminator}>`)
    for(let r of args.roles) {
        embed.addField('Rolle:', r.name)
    }

    return embed;
}

function getNicknameChangedEmbed(args) {
    let oldMemberName = args.args.nickname ?? args.args.user.username;
    let newMemberName = args.newMember.nickname ?? args.newMember.user.username;
    console.log("Old Member Name: ", args.args.nickname, args.args.user.username)
    console.log("New Member Name: ", args.newMember.nickname, args.newMember.user.username)
    return new MessageEmbed()
    .setTitle(`Nickname Änderung.`)
    .addFields(
        { name: 'Von:', value: `${args.args.user}` },
        { name: 'Alter Name:', value: oldMemberName },
        { name: 'Neuer Name:', value: newMemberName },
    );

}
