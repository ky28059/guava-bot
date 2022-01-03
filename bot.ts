import {Client, EmbedFieldData, MessageEmbed, User} from 'discord.js';
import fetch from 'node-fetch';
import {success, error} from './messages';
import {token, link, source} from './config';


type SpreadsheetRow = [
    id: string, year: string, name: string, subgroup: string, years: string,
    period: string, minecraft: string
];
let data: SpreadsheetRow[] = [];

// Refreshes current in-memory spreadsheet data
async function refreshData() {
    const raw = await (await fetch(source)).text();
    data = raw.split('\n').slice(1).map(row => row.split('\t').map(x => x.trim()) as SpreadsheetRow);
}


const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_PRESENCES",
        "GUILD_MEMBERS",
        "GUILD_MESSAGE_REACTIONS",
    ],
    presence: {activities: [{type: 'WATCHING', name: 'you.'}]},
    allowedMentions: {repliedUser: false}
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    await refreshData();
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'DM') return;

    const prefix = 'g';
    if (message.content.substring(0, prefix.length) === prefix) {
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift()?.toLowerCase();

        switch (commandName) {
            // whois [user]
            case 'whois':
                const [target] = args;
                const id = target?.match(/^<@!?(\d+)>$/)?.[1] ?? target;

                const user = client.users.cache.get(id);
                if (!user) {
                    await message.reply({embeds: [error('Invalid user provided.')]})
                    return;
                }

                const info = getUserInfoById(user.id);
                await message.reply({embeds: [info
                        ? userInfoEmbed(user, info)
                        : error('User not found.', `The requested user <@${user.id}> (${user.id}) was not found in the database. If they are in the spreadsheet, try doing /fetch.`)
                    ]});
                return;

            // fetch
            case 'fetch':
                await refreshData();
                await message.reply({embeds: [success({author: 'Successfully refreshed database.', authorURL: link})]});
                return;

            // help
            case 'help':
                // TODO
                break;
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'whois') { // /whois [user]
        const user = interaction.options.getUser('user')!;
        const info = getUserInfoById(user.id);

        return interaction.reply({embeds: [info
                ? userInfoEmbed(user, info)
                : error('User not found.', `The requested user <@${user.id}> (${user.id}) was not found in the database. If they are in the spreadsheet, try doing /fetch.`)
            ]});

    } else if (interaction.commandName === 'fetch') { // /fetch
        await refreshData();
        return interaction.reply({embeds: [success({author: 'Successfully refreshed database.', authorURL: link})]});
    }
});

function getUserInfoById(id: string) {
    return data.find(row => row[0] === id);
}

// Returns a MessageEmbed displaying the user's info
function userInfoEmbed(user: User, info: SpreadsheetRow) {
    const [id, year, name, subgroup, years, period, minecraft] = info;

    const fields: EmbedFieldData[] = [];

    if (year) fields.push({name: 'Year', value: year, inline: true});
    if (name) fields.push({name: 'Name', value: name, inline: true});
    if (years) fields.push({name: 'GRT Years', value: years, inline: true});
    if (subgroup) fields.push({name: 'Subgroup', value: subgroup, inline: true});
    fields.push({name: 'Discord', value: user.tag, inline: true});
    if (period) fields.push({name: 'Period', value: period, inline: true});
    if (minecraft) fields.push({name: 'Minecraft', value: minecraft, inline: true});

    return success({title: 'Guava Gang User Info', desc: `Information about <@${user.id}>:`, url: link})
        .setThumbnail(user.displayAvatarURL({format: 'png', dynamic: true, size: 1024 }))
        .addFields(fields);
}

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

client.login(token);
