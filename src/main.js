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
const BadDomainChecker = require('./utils/badDomainChecker.js');
client.db = new DB();

client.db.init();

client.db.sync();

client.activity = require('./activity.json');

//client.twitch = new Twitch();



client.messageHelper = new MessageHelper(client);

client.badDomainChecker = new BadDomainChecker(client);

client.memberHasPermission = function(member) {
	return member.permissions.has(Permissions.FLAGS.KICK_MEMBERS) || member.user.id === "228154435589767168"
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

try {
	client.phrases = require("./phrases.json");
}
catch {
	client.phrases = [];
	console.log("No phrases found");
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