module.exports = {
        name: 'messageReactionAdd',
        async execute(client, reaction, user) {
                if(!client.configExists()) {
                        console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');	
                        return; 
                }
                const { modRoles, guildId } = client.config;

                if (reaction.emoji.name.toLowerCase().includes('mod')) {
                        let guild = await client.guilds.fetch(guildId)
                        let member = await guild.members.fetch(user.id);
                        if (!member.roles.cache.find(r => modRoles.includes(r.id)))
                        {
                                reaction.users.remove(user.id);
                        }
                }
                try {
                        const { d } = require("../reaction-config.json");
                        var moment = require('moment');

        

                        const msg = d.find(element => element.messageId === reaction.message.id);
                        if(!msg || msg.timed === 'Nie') {
                                return;
                        }
                        let timer = msg.timed;
                        let message = msg.messageId;
                        let rec = msg.reaction;
                        let roleId = msg.roleId;
                        let channel = reaction.message.channelId;
                        var newDate = moment(Date.now()).add(timer, 'h').toDate();



                        const affectedRows = await client.db.timedRolesModel.update({ loseroleafter: newDate }, { where: { userid: user.id } });
                        if (affectedRows[0] === 0) {
                                await client.db.timedRolesModel.create({
                                        userid: user.id,
                                        reactionid: rec, 
                                        loseroleafter: newDate, 
                                        roleid: roleId,
                                        channelid: channel,
                                        messageid: message
                                    });
                        }


                } catch (exception) {
                        //console.log(exception);
                }

        }
}

