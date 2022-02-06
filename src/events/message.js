const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	async execute(client, message) {
        var moment = require('moment');

        if(message.author.id === client.user.id)
            return;

        if(message.guildId) {
            client.db.messages.create({
                id: message.id,
                sender: message.author.id,
                message: message.content,
                channel: message.channelId,
                timestamp: Date.now()
                
            });

            botTest(client, message);
        }

        if(!message.guildId ) {
            const { guildId, wunschBrunnenChannel } = require('../dev-config.json');
            let buttons = getButtons();

            message.author.send({content: `Hey, cool, dass du dich bei mir meldest. Willst du dass die gesendete Nachricht an die Mods gesendet wird? Ich sorge dafür, dass sie nicht wissen von wem die Nachricht ist!\nDeine Nachricht:\n\`\`\`${message.content}\`\`\``, components: [buttons], fetchReply: true }).then(msg2 => {
                const collector = msg2.channel.createMessageComponentCollector({ time: 15000 });
    
                collector.on('collect', async i => {
                    if (i.customId === 'submit') {
                        let guild = client.guilds.cache.get(guildId);
                        let channel = guild.channels.cache.get(wunschBrunnenChannel);

                        let wunschbrunnen = await client.db.wunschbrunnenModel.create({
                            userid: message.author.id,
                            message: "0",
                            sent: Date.now()
                        });

                        let msg = await channel.send(`Es gibt eine neue Nachricht:\n\`\`\`${message.content}\`\`\`\nBenutze den /reply-to-message command mit der id: ${wunschbrunnen.id} um darauf zu Antworten.`)

                        client.db.wunschbrunnenModel.update({ message: msg.id }, { where: { id: wunschbrunnen.id } });

                        i.update({ content: `Ich hab die Nachricht an die Mods weitergeleitet, sobald sie antworten, teile ich dir das mit.`, components: [] });
                        
                    }
                    if (i.customId === 'abort') {
                        i.update({ content: `Ich habe keine Nachricht gesendet.`, components: [] });
                    }
                });
            })

            return;
        }

        const { rules, activityRole } = require('../dev-config.json');

        if(rules.channel === message.channelId) {
            if(message.content === rules.acceptMessage) {
                let member = fetchMember(client, message);
                member.roles.add(rules.baseRole);
            }
        }
        else {
            if(message.content.length < 15) return;
            let user = await fetchUserModel(client, message);

            if(!user.hasrole && user.activity >= 15000) {
                fetchMember(client, message).roles.add(activityRole);
                await client.db.userModel.update({ hasrole: 1 }, { where: { id: user.id } });
            }

            var newDate = moment(user.lastmessage).add(1, 'm').toDate();
            if(Date.now() >= newDate) {
                let xp = 15 + (message.content.length > 2000 ? 35 : Math.floor(message.content.length * 0,0175));
                await client.db.userModel.update({ lastmessage: Date.now(), activity: user.activity + xp  }, { where: { id: user.id } });
            }
        }
	},
};


async function botTest(client, message) {
    const writeLogMessage = require("../utils/writeLogMessage.js");


    var moment = require('moment'); // require
    let msgs = await client.messageHelper.fetchLastMessagesByUserInInterval(message.author.id, 10);

    let threshold = 3; 
    let channels = {};
    let equalMessages = {};
    let messageIds = [];


    for(msg of msgs) {
        messageIds.push(msg.id);
        if(msg.channel in channels) {
            channels[msg.channel] = channels[msg.channel] + 1;
        }
        else {
            channels[msg.channel] = 1;
        }
        if(msg.message in equalMessages) {
            equalMessages[msg.message] = equalMessages[msg.message] + 1;
        }
        else {
            equalMessages[msg.message] = 1;
        }
    }
    if(equalMessages[msg.message] > threshold && Object.keys(channels).length > threshold) {
        writeLogMessage({client: client, type: "botDetected", args: msgs, message});

        console.log("Kick");
        let member = fetchMember(client, message);
        for(let msg of msgs) {
            deleteMessage(client, msg.channel, msg.id);
        }
        if(!member.kickable) return console.log("I cannot kick this member!");
        member.kick();
    }
    return;

    if(!user.hasrole && user.activity >= 15000) {
        fetchMember(client, message).roles.add(activityRole);
        await client.db.userModel.update({ hasrole: 1 }, { where: { id: user.id } });
    }

    var newDate = moment(user.lastmessage).add(1, 'm').toDate();
    if(Date.now() >= newDate) {
        let xp = 15 + (message.content.length > 2000 ? 35 : Math.floor(message.content.length * 0,0175));
        await client.db.userModel.update({ lastmessage: Date.now(), activity: user.activity + xp  }, { where: { id: user.id } });
    }

}

async function deleteMessage(client, channelId, messageId) {
    let channel = await client.channels.fetch(channelId);
    let message = await channel.messages.fetch(messageId);
    message.delete();
}

async function fetchUserModel(client, message) {

    let userId = message.author.id;
    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    let user = await client.db.userModel.findOne({ where: { userid: userId } });

    const member = fetchMember(client, message);

    if (user) {
        return user;
    }

    user = await client.db.userModel.create({
        userid: userId,
        username: member.user.username,
        lastmessage: Date.now(),
        joined: member.joinedTimestamp,
        activity: 0
    });

    return user;
}

function fetchMember(client, message) {
    let guild = client.guilds.cache.get(message.guildId);
    return guild.members.cache.get(message.author.id);
}

function getButtons() {
	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId('submit')
			.setLabel('Passt')
			.setStyle('PRIMARY'),
	)
		.addComponents(
			new MessageButton()
				.setCustomId('abort')
				.setLabel('Abbruch')
				.setStyle('DANGER'),
		);

	return row;
}