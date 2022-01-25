module.exports = {
	name: 'messageCreate',
	async execute(client, message) {
        var moment = require('moment'); // require

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