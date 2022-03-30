const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Initialisiere den Bot!')
        .addStringOption(option =>
            option.setName('einstellung')
                .setDescription('Willst du nur einen Eintrag ändern?')
                .setRequired(false)
                .addChoice('Accept Message', 'rule.acceptMessage')
                .addChoice('Aktivitätsrolle', 'activityRole')
                .addChoice('Bot Log Channel', 'logChannel')
                .addChoice('Faultierhalle', 'rules.channel')
                .addChoice('Faultier, bzw. Rolle für Neue', 'rule.baseRole')
                .addChoice('Hi-Bye-Channel', 'hiBye')
                .addChoice('Mod Rollen', 'modRoles')
                .addChoice('Purge Intervall', 'purgeInterval')
                .addChoice('Regel Channel', 'ruleChannel')
                .addChoice('Twitch Live Channel', 'twitchNotificationChannel')
                .addChoice('Twitch Live Nachricht', 'twitchLiveMessage')
                .addChoice('Voice Rolle', 'voiceRole')
                .addChoice('Willkommens Channel', 'welcomeChannel')
                .addChoice('Willkommens Nachricht', 'welcomeMessage')
                .addChoice('Wunschbrunnen Channel', 'wunschBrunnenChannel'))
                ,
	async execute(interaction) {
		if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        const option = interaction.options.get("einstellung") ?? null;
        if(option) {
            if(!interaction.client.configExists()) {
                await interaction.reply({ content: 'Bevor du einzelne Einstellungen änderst, führe bitte einen kompletten Setup aus.', ephemeral: true });	
                return
            }
            await changeOption(interaction, option);
            return;

        }


        interaction.client.config = {};
        interaction.client.config.guildId = interaction.guild.id;
        interaction.client.config.clientId = interaction.client.id;

        await interaction.reply('Hallo, ich bin Axobotl. Ich stelle dir ein paar Fragen damit ich starten kann!');
        const roles = getRoles(interaction);
        const channels = getChannels(interaction);

        let activityRoleRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('modRole-selection')
                    .setPlaceholder('Mod Rollen?')
                    .addOptions(roles)
                    .setMinValues(1)
            );

        await interaction.followUp({ content: `Welche Rollen zählen als "Mod Rollen" und können dementsprechend reagieren?`, components: [activityRoleRow]});
    },
};


async function changeOption(interaction, option) {
    interaction.client.singleOptionChange = true;
    let channelRow;
    let modRoleRow;
    switch(option.value) {
        case 'rule.acceptMessage':
            await interaction.reply({ content: "Welche Nachricht sollen neue Benutzer in die Faultierhalle schreiben um freigeschalten zu werden? Antworte bitte auf diese Nachricht mit der Phrase", fetchReply: true }).then(message => {
  
                const SECONDS_TO_REPLY = 60 // replace 60 with how long to wait for message(in seconds).
                const MESSAGES_TO_COLLECT = 1
                const filter = (m) => m.author.id == interaction.user.id
                const collector = interaction.channel.createMessageCollector({filter, time: SECONDS_TO_REPLY * 1000, max: MESSAGES_TO_COLLECT})
                collector.on('end', collected => {
                    if (collected.size <= 0) {
                        interaction.deleteReply();
                        
                    }
                });
                collector.on('collect', async collected => {
                    interaction.client.config.rules.acceptMessage = collected.content;
                    await updateConf(interaction);
                })
            });
            break;
        case 'activityRole':
            channelRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('activityRole-selection')
                    .setPlaceholder('Activity Role?')
                    .addOptions(getRoles(interaction))
            );
    
            await interaction.reply({ content: `Welche Rolle erhalten User nach erreichen von 15000 Aktivitätspunkten`, components: [channelRow]});
    
            break;
        case 'logChannel':
            modRoleRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('logChannel-selection')
                    .setPlaceholder('Log Channel?')
                    .addOptions(getChannels(interaction))
            );
    
            await interaction.reply({ content: `In welchen Channel soll ich meinen Log Output schreiben?`, components: [modRoleRow]});
    
            break;
        case 'hiBye':
            modRoleRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('hiBye-selection')
                    .setPlaceholder('Hi-Bye-Channel?')
                    .addOptions(getChannels(interaction))
            );
    
            await interaction.reply({ content: `In welchen Channel soll auflisten, falls jemand kommt und geht?`, components: [modRoleRow]});
    
            break;
        case 'rules.channel':
            channelRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('faultierHalle-selection')
                    .setPlaceholder('Faultierhalle?')
                    .addOptions(getChannels(interaction))
            );
    
            await interaction.reply({ content: `Welcher Channel ist die Faultierhalle?`, components: [channelRow]});
    
            break;
        case 'rule.baseRole':
            modRoleRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('baseRole-selection')
                    .setPlaceholder('Base Role?')
                    .addOptions(getRoles(interaction))
            );           
            await interaction.reply({ content: `Welche Rolle erhalten Benutzer, nachdem sie diese Phrase angegeben haben?`, components: [modRoleRow]});

            break;
        case 'modRoles':
            let activityRoleRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('modRole-selection')
                    .setPlaceholder('Mod Rollen?')
                    .addOptions(getRoles(interaction))
                    .setMinValues(1)
            );

            await interaction.reply({ content: `Welche Rollen zählen als "Mod Rollen" und können dementsprechend reagieren?`, components: [activityRoleRow]});

            break;
        case 'purgeInterval':
            channelRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('purgeInterval-selection')
                    .setPlaceholder('Purge interval?')
                    .addOptions(getDays())
            );
    
            await interaction.reply({ content: `Nach wievielen Tagen soll ich Benutzer ohne Rolle vom Server entfernen?`, components: [channelRow]});
    
            break;
        case 'ruleChannel':
            channelRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('ruleChannel-selection')
                    .setPlaceholder('Rule Channel?')
                    .addOptions(getChannels(interaction))
            );
    
            await interaction.reply({ content: `Welcher Channel ist der Regel Channel auf den ich neue User verweise?`, components: [channelRow]});
    
            break;
        case 'twitchNotificationChannel':
            channelRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('liveChannel-selection')
                    .setPlaceholder('Live Channel?')
                    .addOptions(getChannels(interaction))
            );
    
            await interaction.followUp({ content: `In welchen Channel schreibe ich die Benachrichtigung, dass Honeyball live ist?`, components: [channelRow]});
    
            break;
        case 'twitchLiveMessage':
            await interaction.reply({ content: "Die letzte Frage, wie soll die Nachricht aussehen, wenn Honeyball live geht? Antworte bitte auf diese Nachricht mit der Nachricht", fetchReply: true }).then(message => {
  
                const SECONDS_TO_REPLY = 60 // replace 60 with how long to wait for message(in seconds).
                const MESSAGES_TO_COLLECT = 1
                const filter = (m) => m.author.id == interaction.user.id
                const collector = interaction.channel.createMessageCollector({filter, time: SECONDS_TO_REPLY * 1000, max: MESSAGES_TO_COLLECT})
                collector.on('end', collected => {
                    if (collected.size <= 0) {
                        interaction.deleteReply();
                        
                    }
                });
                collector.on('collect', async collected => { 
                    interaction.client.config.twitchLiveMessage = collected.content;
                    await updateConf(interaction);
                })
            })
            break;
        case 'voiceRole':
            channelRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('voiceRole-selection')
                    .setPlaceholder('Voice Role?')
                    .addOptions(getRoles(interaction))
            );
    
            await interaction.reply({ content: `Welche Rolle erhalten Benutzer in Voice Channeln?`, components: [channelRow]});
    
            break;
        case 'welcomeChannel':
            channelRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('welcome-selection')
                    .setPlaceholder('Welcome Channel?')
                    .addOptions(getChannels(interaction))
            );
    
            await interaction.reply({ content: `In welchem Channel soll ich die Neuen willkommen heißen?`, components: [channelRow]});
    
            break;
        case 'welcomeMessage':
            await interaction.reply({ content: "Mit welcher Willkommensnachricht soll ich neue Member grüßen? Benutze \"{0}\" als Platzhalter für den Nutzernamen und \"{1}\" als Platzhalter für den Regelchannel:", fetchReply: true }).then(message => {
  
                const SECONDS_TO_REPLY = 60 // replace 60 with how long to wait for message(in seconds).
                const MESSAGES_TO_COLLECT = 1
                const filter = (m) => m.author.id == interaction.user.id
                const collector = interaction.channel.createMessageCollector({filter, time: SECONDS_TO_REPLY * 1000, max: MESSAGES_TO_COLLECT})
                collector.on('end', collected => {
                    if (collected.size <= 0) {
                        interaction.deleteReply();
                        
                    }
                });
                collector.on('collect', async collected => {
                    interaction.client.config.welcomeMessage = collected.content;
                    await updateConf(interaction);
                })
            })
            break;
        case 'wunschBrunnenChannel':
            channelRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('wunschbrunneChannel-selection')
                    .setPlaceholder('Wunschbrunnen Channel?')
                    .addOptions(getChannels(interaction))
            );
    
            await interaction.reply({ content: `In welchen Channel werden private Anliegen von Benutzern mit euch geteilt? Wunschbrunnen Channel:`, components: [channelRow]});
    
            break;
        }


    /*

    modRole-selection
    logChannel-selection
    ruleChannel-selection
    faultierHalle-selection
    baseRole-selection
    welcome-selection
    activityRole-selection
    purgeInterval-selection
    voiceRole-selection
    wunschbrunneChannel-selection
    liveChannel-selection
    */
}

async function updateConf(interaction) {
    const createConf = require("../utils/createConfig");
    createConf(interaction.client);

    await interaction.followUp({ content: `Einstellung wurde aktualisiert` });

    var schedule = require('node-schedule');

    let schedName = 'midnight';
    schedule.cancelJob(schedName)
    clearInterval(interaction.client.interval);

    interaction.client.emit('ready', interaction.client);

    interaction.client.singleOptionChange = false;
}

function getRoles(interaction) {
    var array = [];
    let roles = interaction.guild.roles;

    for (const role of roles.cache) {
        let r = role[1];
        let id = r.id;
        let name = r.name;
        let option = {
            label: name,
            description: id,
            value: id
        }
        array.push(option);
    }

    return array;
}

function getChannels(interaction) {
    var array = [];
    let channels = interaction.guild.channels;

    for (const channel of channels.cache) {
        let r = channel[1];
        if(r.type !== "GUILD_TEXT") continue;
        let id = r.id;
        let name = r.name;
        let option = {
            label: name,
            description: id,
            value: id
        }
        array.push(option);
    }

    return array;
}

function getDays() {
	var array = []
	for(let i = 1; i < 25; i++) {
		let option = {
            label: i.toString(),
            description: "Days",
            value: i.toString()
        }
		array.push(option);
	}
	return array;

}