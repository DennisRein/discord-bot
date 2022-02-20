const fs = require('fs');
const { Client, Collection, Intents, Permissions } = require('discord.js');
const { default: ReactionRole } = require("discordjs-reaction-role");
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER']});

const DB = require('./db.js');
const Twitch = require('./services/twitch.js');
const MessageHelper = require('./utils/messageHelper.js');
client.activity = require('./activity.json');

client.twitch = new Twitch();

client.db = new DB();

client.db.init();

client.messageHelper = new MessageHelper(client);

client.memberHasPermission = function(member) {
	return member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)
}

try {
	client.config = require('./config.json');
}
catch {
	console.log("No config found");
}
client.configExists = function() {
	return client.config !== undefined;
}

try {
	const { d } = require("./reaction-config.json");
	client.rr = new ReactionRole(client, d);
} catch(exception) {
	console.log("Couldn't find a Reaction Config file");
}

let eventFiles
try {
	eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
} 
catch {
	client.isproductive = true;
	eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
}

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(client, ...args));
	} else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
}


client.commands = new Collection();
let commandFiles
try { 
	commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
}
catch {
	commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
}
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}


client.login(process.env.DISCORD_TOKEN);