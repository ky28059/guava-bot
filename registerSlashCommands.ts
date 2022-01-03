import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { token } from './config';


const commands = [
    new SlashCommandBuilder()
        .setName('whois')
        .setDescription('Get info about the target user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get info about')
                .setRequired(true))
        .toJSON(),
    new SlashCommandBuilder()
        .setName('fetch')
        .setDescription('Refetch the TSV data source.')
        .toJSON()
];

const clientId = '927093994754818069';
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
