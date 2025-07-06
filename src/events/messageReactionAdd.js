module.exports = {
    name: 'messageReactionAdd',
    async execute(client, reaction, user) {
        if (!client.configExists()) {
            console.log('Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!');
            return;
        }

        const { modRoles, guildId } = client.config;

        // Mod-Emote-Schutz: Nur Mods dürfen mit Mod-Emotes reagieren
        if (reaction.emoji.name?.toLowerCase().includes('mod')) {
            let member = null;
            try {
                const guild = await client.guilds.fetch(guildId);
                member = await guild.members.fetch(user.id);
            } catch (e) {
                // Member nicht gefunden/left etc.
            }
            if (!member || !member.roles.cache.some(r => modRoles.includes(r.id))) {
                await reaction.users.remove(user.id);
                return;
            }
        }

        // Timed Roles Handling
        try {
            // Statischer JSON-Import – im produktiven System ggf. dynamisch neu laden
            const { d } = require("../reaction-config.json");
            const moment = require('moment');
            const msg = d.find(element => element.messageId === reaction.message.id);
            if (!msg || msg.timed === 'Nie') return;

            const timer = Number(msg.timed);
            if (isNaN(timer) || timer <= 0) return;

            const message = msg.messageId;
            const rec = msg.reaction;
            const roleId = msg.roleId;
            const channel = reaction.message.channelId;
            const newDate = moment(Date.now()).add(timer, 'h').toDate();

            // Upsert für den Timed Role Eintrag
            const [affectedRows] = await client.db.timedRolesModel.update(
                { loseroleafter: newDate },
                { where: { userid: user.id } }
            );
            if (affectedRows === 0) {
                await client.db.timedRolesModel.create({
                    userid: user.id,
                    reactionid: rec,
                    loseroleafter: newDate,
                    roleid: roleId,
                    channelid: channel,
                    messageid: message,
                });
            }
        } catch (err) {
            // Fehler beim Timed Role Handling: Hier bewusst still, Log nur bei echter Fehlersuche
        }
    }
};
