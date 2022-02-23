const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
//const { i18next } = require("./i18n")
dotenv.config();

const commands = []

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

function translateCommand(command) {
        command.description = i18next.t(command.description);
        for(let i = 0; i < command.options.length; i++) {
                console.log(command.options[i].description);
                command.options[i].description = i18next.t(command.options[i].description)
        }


}

for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);


