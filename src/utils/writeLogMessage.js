const { MessageEmbed } = require('discord.js');


module.exports = function writeLogMessage({client, type, ...args}) {
    
    const { logChannel, clientId } = require('../dev-config.json');


    const channel = client.channels.cache.get(logChannel);
    switch(type) {
        case "guildMemberAdd": {
            return channel.send({embeds: [getMemberEmbed(args.args)]});
        }
        case "messageUpdate": {
            if(args.args.author.id === clientId) return;
            return channel.send({embeds: [getMessageEditedEmbed(client, args)]})

        }
        case "messageDelete": {
            if(args.args.author.id === clientId) return;
            if(!args.args.message) return;
            if(!args.args.message.editedTimestamp) return;
            return channel.send({embeds: [getMessageDeletedEmbed(client, args.args)]})
        }
        case "guildMemberUpdate": {
            return channel.send({embeds: [getRoleChangedEmbed(args)]})
        }
        case "nicknameChanged": {
            return channel.send({embeds: [getNicknameChangedEmbed(args)]})
        }
        case "purge": {
            //user, channel, messageIDs, interaction
            return channel.send({embeds: [getPurgedEmbed(args)]})
        }
        case "userTimeouted": {
            //newMember, entry
            return channel.send({embeds: [getTimeoutedEmbed(args)]})
        }
    }
}

function getTimeoutedEmbed(args) {
    let timeA = args.entry.changes[0].old;
    let timeB = args.entry.changes[0].new;

    let diff = moment.utc(moment(timeA,"DD/MM/YYYY HH:mm:ss").diff(moment(timeB,"DD/MM/YYYY HH:mm:ss"))).format("DD/MM/YYYY HH:mm:ss")

    console.log(diff);
    return new MessageEmbed()
        .setTitle(`${args.args.user.username} <${args.args.user.discriminator}> wurde von ${args.entry.executor.username} <${args.entry.executor.username}> getimeouted.`)
        .addFields(
                { name: "Timeout bis:", value: diff }
        );
}

function getPurgedEmbed(args) {
    let user = args.args.user;
    let channel = args.channel;
    let amount = args.messageIDs.length;
    let sender = args.interaction.user;
    let embed = new MessageEmbed()
        .setTitle(`${sender.username} hat ${amount} Nachrichten gepurged.`)
        
    if(user) {
        embed.addField("Vom Nutzer: ", `${user.username} <${user.discriminator}>`);
    }

    if(channel) {
        embed.addField("Im Channel: ", channel.name);
    }

    return embed;


}

function getMemberEmbed(member) {
    return new MessageEmbed()
        .setTitle("Ein neuer User ist beigetreten:")
        .addFields(
                { name: "Name", value: member.user.username + `<${member.user.discriminator}>` },
                { name: 'Beigetreten:', value: new Date(member).toISOString() },
        );
}

function getMessageEditedEmbed(client, args) {
    const oldMessage = args.args;
    const newMessage = args.newMessage;
    const channelName = client.channels.cache.get(oldMessage.channelId).name;

    return new MessageEmbed()
        .setTitle(`${newMessage.author.username} <${newMessage.author.discriminator}> hat eine Nachricht bearbeitet`)
        .addFields(
                { name: 'Channel:', value: channelName },
                { name: 'Zeitpunkt:', value: new Date(newMessage.editedTimestamp).toISOString()},
                { name: "Alte Nachricht:", value: oldMessage.content ?? "_Ich war leider nicht da, als die alte Nachricht geschrieben wurde_" },
                { name: 'Neue Nachricht:', value: newMessage.content }
        );
}


function getMessageDeletedEmbed(client, message) {    
    const channelName = client.channels.cache.get(message.channelId).name;

    return new MessageEmbed()
        .setTitle(`${message.author.username} <${message.author.discriminator}> hat eine Nachricht gelöscht`)
        .addFields(
                { name: 'Channel:', value: channelName },
                { name: 'Zeitpunkt:', value: new Date(message.editedTimestamp).toISOString()},
                { name: "Nachricht:", value: message.content ?? "_Ich war leider nicht da, als die Nachricht geschrieben wurde_" },
        );
}

function getRoleChangedEmbed(args) {
    let user = args.newMember.user;
    return new MessageEmbed()
    .setTitle(`${user.username} <${user.discriminator}> eine Rolle wurde ${args.args ? "hinzugefügt " : "entfernt "}.`)
    .addFields(
            { name: 'Rolle:', value: args.roles[0].name },
    );
}

function getNicknameChangedEmbed(args) {
    let oldMemberName = args.args.nickname ?? args.args.user.username;
    let newMemberName = args.newMember.nickname ?? args.newMember.user.username;
    return new MessageEmbed()
    .setTitle(`${args.args.user.username} <${args.args.user.discriminator}> hat seinen Namen geändert.`)
    .addFields(
        { name: 'Alter Name:', value: oldMemberName },
        { name: 'Neuer Name:', value: newMemberName },
    );

}