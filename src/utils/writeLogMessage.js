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
            console.log("nicknameChanged")
            return channel.send({embeds: [getNicknameChangedEmbed(args)]})
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
        .setTitle(`${args.args.user.username} <${args.args.user.discriminator}> hat den Server verlassen`)
    }

function getInactivePurgedEmbed(args) {
    return new MessageEmbed()
        .setTitle(`Ich hätte ${args.args} Benutzer vom Server entfernt die nach zwei Wochen keine Rolle erhalten haben. Die Kickfunktion ist jedoch noch temporär deaktiviert um die entdeckte Anzahl zu prüfen.`)
    }

function getBotEmbed(args) {
    return new MessageEmbed()
        .setTitle(`${args.message.author.username} <${args.message.author.discriminator}> wurde von mir gekickt.`)
        .addField("Grund", "Verdacht auf Bot")
        .addField("Nachricht", args.message.content)
    }

function getTimeoutedEmbed(args, type) {
    return new MessageEmbed()
        .setTitle(`${args.args.user.username} <${args.args.user.discriminator}> wurde von ${args.entry.executor.username} <${args.entry.executor.discriminator}> ${type}.`)

}

function getPurgedEmbed(args) {
    let user = args.args?.user;
    let channel = args.channel;
    let amount = args.messageIDs.length;
    let sender = args.interaction.user;
    let embed = new MessageEmbed()
        .setTitle(`${sender.username} hat ${amount} Nachrichten gepurged.`)
        
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
        .setTitle("Ein neuer User ist beigetreten:")
        .addFields(
                { name: "Name", value: member.user.username + `<${member.user.discriminator}>` },
                { name: 'Beigetreten:', value: new Date(member.joinedTimestamp).toISOString() },
        );
}

function getMessageEditedEmbed(client, args) {
    const oldMessage = args.args;
    const newMessage = args.newMessage;
    const channel = client.channels.cache.get(oldMessage.channelId);
    const channelName = channel.name;
    console.log("Edited", newMessage);

    return new MessageEmbed()
        .setTitle(`${newMessage.author.username} <${newMessage.author.discriminator}> hat eine Nachricht bearbeitet`)
        .addFields(
                { name: 'Channel:', value: `<#${channel.id}>` },
                { name: 'Zeitpunkt:', value: new Date(newMessage.editedTimestamp).toISOString()},
                { name: "Alte Nachricht:", value: oldMessage.content ?? "_Ich war leider nicht da, als die alte Nachricht geschrieben wurde_" },
                { name: 'Neue Nachricht:', value: newMessage.content }
        );
}


async function getMessageDeletedEmbed(client, message) {    
    const channel = client.channels.cache.get(message.channelId);
    const channelName = channel.name;
    const embed = new MessageEmbed()
    .setTitle(`Es wurde eine Nachricht von ${message.author.username} <${message.author.discriminator}> gelöscht`)
    .addFields(
            { name: 'Channel:', value: `<#${channel.id}>` },
            { name: "Nachricht:", value: message.content ?? "_Ich war leider nicht da, als die Nachricht geschrieben wurde_" },
    );
    const entry = await message.guild.fetchAuditLogs().then(audit => audit.entries.first())
    if(entry.actionType === 'DELETE' && entry.targetType ===  'MESSAGE') {
        embed.addField("Gelöscht von:", `${entry.executor.username} <${entry.executor.discriminator}>`)
    }

    return embed;


}

function getRoleChangedEmbed(args) {
    let user = args.newMember.user;
    return new MessageEmbed()
    .setTitle(`${user.username} <${user.discriminator}> eine Rolle wurde ${args.args ? "hinzugefügt" : "entfernt"}.`)
    .addFields(
            { name: 'Rolle:', value: args.roles[0].name },
    );
}

function getNicknameChangedEmbed(args) {
    let oldMemberName = args.args.nickname ?? args.args.user.username;
    let newMemberName = args.newMember.nickname ?? args.newMember.user.username;
    return new MessageEmbed()
    .setTitle(`${args.args.user.username} <${args.args.user.discriminator}> hat den Namen geändert.`)
    .addFields(
        { name: 'Alter Name:', value: oldMemberName },
        { name: 'Neuer Name:', value: newMemberName },
    );

}