import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { PermissionFlagsBits, Routes } from 'discord-api-types/v9';
import { token } from './config';


const commands = [
    new SlashCommandBuilder()
        .setName('whois')
        .setDescription('Gets info about the target user.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to get info about')
            .setRequired(true))
        .toJSON(),
    new SlashCommandBuilder()
        .setName('fetch')
        .setDescription('Refetches the TSV data source.')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('counting')
        .setDescription('Returns the current counting channel number.')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Force resets the counting number.')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Sends info about Guava Bot!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('server-update')
        .setDescription('Updates member roles across the server.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
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
