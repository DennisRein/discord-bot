const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu, Constants } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Initialisiere den Bot!')
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("log-channel")
                .setDescription("In welchen Channel soll ich meinen Log Output schreiben?")
                .setRequired(true)
        })
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("hi-bye-channel")
                .setDescription("In welchen Channel soll auflisten, falls jemand kommt und geht?")
                .setRequired(true)
        })
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("faultierhalle")
                .setDescription("Welcher Channel ist die Faultierhalle?")
                .setRequired(true)
        })
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("rules-channel")
                .setDescription("Welcher Channel ist der Regel Channel auf den ich neue User verweise?")
                .setRequired(true)
        })
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("twitch-channel")
                .setDescription("In welchen Channel schreibe ich die Benachrichtigung, dass Honeyball live ist?")
                .setRequired(true)
        })
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("welcome-channel")
                .setDescription("In welchem Channel soll ich die Neuen willkommen heißen?")
                .setRequired(true)
        })        
        .addChannelOption(channel => {
            return channel // Add return here
                .setName("wunschbrunnen-channel")
                .setDescription("In welchen Channel werden private Anliegen von Benutzern mit euch geteilt?")
                .setRequired(true)
        })
        .addRoleOption(role => {
            return role // Add return here
                .setName("voice-role")
                .setDescription("Welche Rolle erhalten Benutzer in Voice Channeln?")
                .setRequired(true)
            })
        .addRoleOption(role => {
            return role // Add return here
                .setName("base-role")
                .setDescription("Welche Rolle ist die Faultierrolle?")
                .setRequired(true)
            })
        .addRoleOption(role => {
            return role // Add return here
                .setName("activity-role")
                .setDescription("Welche Rolle erhalten User nach erreichen von 15000 Aktivitätspunkten")
                .setRequired(true)
            }),
	async execute(interaction) {
		if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}

        
        interaction.client.config = {};
        interaction.client.config.rules = {};
        interaction.client.config.guildId = interaction.guild.id;
        interaction.client.config.clientId = interaction.client.id;

        interaction.client.config.logChannel = interaction.options.get("log-channel").value
        interaction.client.config.ruleChannel = interaction.options.get("rules-channel").value
        interaction.client.config.rules.channel = interaction.options.get("faultierhalle").value
        interaction.client.config.welcomeChannel = interaction.options.get("welcome-channel").value
        interaction.client.config.wunschBrunnenChannel = interaction.options.get("wunschbrunnen-channel").value
        interaction.client.config.twitchNotificationChannel = interaction.options.get("twitch-channel").value
        interaction.client.config.hiByeChannel = interaction.options.get("hi-bye-channel").value
		
        interaction.client.config.rules.baseRole = interaction.options.get("base-role").value
		interaction.client.config.voiceRole = interaction.options.get("voice-role").value
        interaction.client.config.activityRole = interaction.options.get("activity-role").value

        await interaction.reply('Hallo, ich bin Axobotl. Ich stelle dir ein paar Fragen damit ich starten kann!');
        const roles = getRoles(interaction);
        const channels = getChannels(interaction);

        await interaction.followUp({ content: "Wie soll die Nachricht aussehen, wenn Honeyball live geht? Antworte bitte auf diese Nachricht mit der Nachricht", fetchReply: true }).then(message => {

            const SECONDS_TO_REPLY = 60 // replace 60 with how long to wait for message(in seconds).
            const MESSAGES_TO_COLLECT = 1
            const filter = (m) => m.author.id == interaction.user.id
            const collector = interaction.channel.createMessageCollector({ filter, time: SECONDS_TO_REPLY * 1000, max: MESSAGES_TO_COLLECT })
            collector.on('end', collected => {
                if (collected.size <= 0) {
                    interaction.deleteReply();

                }
            });
            collector.on('collect', async collected => {
                interaction.client.config.twitchLiveMessage = collected.content;
                await interaction.followUp({ content: "Mit welcher Willkommensnachricht soll ich neue Member grüßen? Benutze \"{0}\" als Platzhalter für den Nutzernamen und \"{1}\" als Platzhalter für den Regelchannel:", fetchReply: true }).then(message => {

                    const SECONDS_TO_REPLY = 60 // replace 60 with how long to wait for message(in seconds).
                    const MESSAGES_TO_COLLECT = 1
                    const filter = (m) => m.author.id == interaction.user.id
                    const collector = interaction.channel.createMessageCollector({ filter, time: SECONDS_TO_REPLY * 1000, max: MESSAGES_TO_COLLECT })
                    collector.on('end', collected => {
                        if (collected.size <= 0) {
                            interaction.deleteReply();
    
                        }
                    });
                    collector.on('collect', async collected => {
                        interaction.client.config.welcomeMessage = collected.content;
                        await interaction.followUp({ content: "Welche Nachricht sollen neue Benutzer in die Faultierhalle schreiben um freigeschalten zu werden? Antworte bitte auf diese Nachricht mit der Phrase", fetchReply: true }).then(message => {

                            const SECONDS_TO_REPLY = 60 // replace 60 with how long to wait for message(in seconds).
                            const MESSAGES_TO_COLLECT = 1
                            const filter = (m) => m.author.id == interaction.user.id
                            const collector = interaction.channel.createMessageCollector({ filter, time: SECONDS_TO_REPLY * 1000, max: MESSAGES_TO_COLLECT })
                            collector.on('end', collected => {
                                if (collected.size <= 0) {
                                    interaction.deleteReply();
            
                                }
                            });
                            collector.on('collect', async collected => {
                                interaction.client.config.rules.acceptMessage = collected.content;
                                
                                    let activityRoleRow = new MessageActionRow()
                                    .addComponents(
                                        new MessageSelectMenu()
                                            .setCustomId('modRole-done')
                                            .setPlaceholder('Mod Rollen?')
                                            .addOptions(roles)
                                            .setMinValues(1)
                                    );

                                await interaction.followUp({ content: `Welche Rollen zählen als "Mod Rollen" und können dementsprechend reagieren?`, components: [activityRoleRow]});

                            })
                        });
                    })
                })
                
            })
        })
    },
};

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
        if(name.toLowerCase().includes("mod")) {
            let option = {
                label: name,
                description: id,
                value: id
            }
            array.push(option);
        }
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
        if(name.toLowerCase().includes("mod")) {
            let option = {
                label: name,
                description: id,
                value: id
            }
            array.push(option);
        }
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