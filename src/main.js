const fs = require('fs');
const { Client, Collection, GatewayIntentBits, PermissionsBitField, Partials } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

// Client-Setup: Intents und Partials nach neuer Discord.js API
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,    // Falls Voice relevant, sonst raus
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction
	]
});

const DB = require('./db.js');
const Twitch = require('./services/twitch.js');
const MessageHelper = require('./utils/messageHelper.js');
const BadDomainChecker = require('./utils/badDomainChecker.js');

client.db = new DB();
client.db.init();
client.db.sync();

client.activity = require('./activity.json');

// Twitch-Modul auskommentiert (bei Bedarf einkommentieren)
// client.twitch = new Twitch();

client.messageHelper = new MessageHelper(client);
client.badDomainChecker = new BadDomainChecker(client);

// Permissions: Neue BitField-API
client.memberHasPermission = function(member) {
  return member.permissions.has(PermissionsBitField.Flags.KickMembers) || member.user.id === "228154435589767168"
}

// Config laden
try {
  client.config = require('./config.json');
} catch {
  console.log("No config found");
}
client.configExists = function() {
  return client.config !== undefined;
}

// ReactionRole VORERST ENTFERNT – muss für Discord.js v22 neu gebaut werden
// try {
//   const { d } = require("./reaction-config.json");
//   client.rr = new ReactionRole(client, d);
// } catch(exception) {
//   console.log("Couldn't find a Reaction Config file");
// }

// Phrases laden
try {
  client.phrases = require("./phrases.json");
} catch {
  client.phrases = [];
  console.log("No phrases found");
}

// Events laden (src/events → fallback events/)
let eventFiles;
try {
  eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
} catch {
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

// Commands laden (src/commands → fallback commands/)
client.commands = new Collection();
let commandFiles;
try {
  commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
} catch {
  commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
}
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Login
client.login(process.env.DISCORD_TOKEN);
