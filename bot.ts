import {ActivityType, Client, Message} from 'discord.js';
import fetch from 'node-fetch';
import {error, success, userInfoEmbed} from './messages';
import {countingId, link, source, token} from './config';


export type SpreadsheetRow = [
    id: string, year: string, name: string, subgroup: string, years: string,
    period: string, minecraft: string
];
let data: SpreadsheetRow[] = [];

// Refreshes current in-memory spreadsheet data
async function refreshData() {
    const raw = await (await fetch(source)).text();
    data = raw.split('\n').slice(1).map(row => row.split('\t').map(x => x.trim()) as SpreadsheetRow);
}

// Current counting number and last user ID for counting channel passive enforcement
let currentNum: number;
let lastMessage: Message;


const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildPresences",
        "GuildMembers",
        "GuildMessageReactions",
        "MessageContent"
    ],
    presence: {activities: [{type: ActivityType.Watching, name: 'you.'}]},
    allowedMentions: {repliedUser: false}
});

// Fetch spreadsheet data and counting number on ready
client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    await refreshData();
    await fetchCountingNumber();
});

// Fetches the counting number from the last parseable message in #counting.
async function fetchCountingNumber() {
    const countingChannel = await client.channels.fetch(countingId);
    if (!countingChannel?.isTextBased()) return;

    let message = countingChannel.lastMessage;
    let match = message?.content.match(/\d+/);

    // If the last message does not exist or was not parseable, repeatedly fetch in batches of 100
    // until a match is found.
    while (!message || !match) {
        const messages = (await countingChannel.messages.fetch({limit: 100, before: message?.id})).values();
        for (const fetchedMessage of messages) {
            message = fetchedMessage;
            match = fetchedMessage.content.match(/\d+/);
            if (match) break;
        }
    }

    currentNum = Number(match[0]);
    lastMessage = message;
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

    // Enforce counting channel rules
    if (message.channel.id === countingId) {
        // If the number isn't the next number in the sequence, flag it
        if (!message.content.includes((currentNum + 1).toString())) await message.react('🚩');
        // If the number was sent by the same person as the previous number and there isn't a 1-day gap between
        // messages, flag it
        if (message.author.id === lastMessage.author.id && message.createdTimestamp - lastMessage.createdTimestamp < 1000 * 60 * 60 * 24)
            await message.react('🙅');
        lastMessage = message;
        currentNum++;
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'whois') { // /whois @[user]
        const user = interaction.options.getUser('user')!;
        const info = getUserInfoById(user.id);

        return void await interaction.reply({
            embeds: [info
                ? userInfoEmbed(user, info)
                : error('User not found.', `The requested user <@${user.id}> (${user.id}) was not found in the database. If they are in the spreadsheet, try doing /fetch.`)
            ]
        });
    }
    if (interaction.commandName === 'fetch') { // /fetch
        await refreshData();
        const refreshedEmbed = success()
            .setAuthor({name: 'Successfully refreshed database.', url: link})
        return void await interaction.reply({embeds: [refreshedEmbed]});
    }
    if (interaction.commandName === 'counting') { // /currentNumber
        const countingEmbed = success()
            .setAuthor({name: `The current #counting number is ${currentNum}.`})
            .setDescription('Wrong? Try `/reset` or file a bug report with <@355534246439419904>.')
        return void await interaction.reply({embeds: [countingEmbed]});
    }
    if (interaction.commandName === 'reset') { // /reset
        await fetchCountingNumber();
        const resetEmbed = success()
            .setAuthor({name: `The #counting number has been reset to ${currentNum}.`})
        return void await interaction.reply({embeds: [resetEmbed]});
    }
    if (interaction.commandName === 'help') { // /help
        const helpEmbed = success()
            .setTitle('Guava Bot')
            .setDescription(`Guava Bot is open sourced on [GitHub](https://github.com/ky28059/guava-bot)! Edit the backing spreadsheet [here](${link}).`)
            .addFields(
                {name: '/whois @[user]', value: 'Gets info about the target user.', inline: true},
                {name: '/fetch', value: 'Refetches the TSV data source.', inline: true},
                {name: '/counting', value: 'Returns the current counting channel number.', inline: true},
                {name: '/reset', value: 'Force resets the counting number.', inline: true},
                {name: '/help', value: 'Sends info about this bot!', inline: true}
            );
        return void await interaction.reply({embeds: [helpEmbed]});
    }
    if (interaction.commandName === 'server-update') { // /server-update
        const members = client.guilds.cache.get('672196526809808917')!.members.cache;
        const year = new Date().getFullYear();

        let removed = 0;
        let replaced = 0;

        members.forEach((member) => {
            const graduating = member.roles.cache.find((role) => role.name === year.toString());

            // Leadership, Mech Lead, Animation, Business, CNC, Controls, DT, Pneumatics, Welding
            const subgroupRoles = [
                '672201645849051177', '672560919464640515', '672201172563525643', '672200311586160661',
                '672200955353104394', '672199426441478147', '672199532540461096', '672197502451056727',
                '672202451792822275'
            ]
            const subgroupAlumRoles = [
                '757027038166253698', '757026560204341310', '757028193352941638', '757027351098818601',
                '757027739168669726', '757027371885920356', '757027278281637989', '757026879042486393',
                '757029219271180309'
            ]

            const newRoles = new Set([...member.roles.cache.map(role => role.id)]);

            // TODO: better way to keep track of replaced / removed roles? The current setup makes the if statements
            // a little ugly.
            member.roles.cache.forEach((role) => {
                // Remove period roles
                if (role.id === '687020827794735228' || role.id === '687020871247855631') {
                    newRoles.delete(role.id);
                    return removed += 1;
                }

                // Change rookie to veteran
                if (role.id === '748634881864761394') {
                    newRoles.delete(role.id);
                    newRoles.add('748647862346317865');
                    return replaced += 1;
                }

                // If graduating, remove unemployed
                if (!graduating) return;
                if (role.id === '672199782181109770') {
                    newRoles.delete(role.id);
                    return removed += 1;
                }

                // If graduating, change veteran to boomer
                if (role.id === '748647862346317865') {
                    newRoles.delete(role.id);
                    newRoles.add('672332582595330079');
                    return replaced += 1;
                }

                // If graduating, change all subgroup roles to subgroup alum roles
                const index = subgroupRoles.findIndex((id) => role.id === id);
                if (index !== -1) {
                    newRoles.delete(subgroupRoles[index])
                    newRoles.add(subgroupAlumRoles[index]);
                    return replaced += 1;
                }
            })

            member.roles.set([...newRoles], `Role update for ${graduating ? 'graduating' : 'non-graduating'} member.`);
        })

        const updateEmbed = success()
            .setTitle(`${year} server update`)
            .setDescription(`Parsed ${members.size} members, removed ${removed} roles, and replaced ${replaced} roles. Remember that new positions still need to be added manually!`)
        return void await interaction.reply({embeds: [updateEmbed]});
    }
});

// Refetch counting number when the last message in #counting is deleted
client.on('messageDelete', async (message) => {
    if (message.author?.bot) return;
    if (message.id !== lastMessage.id) return;

    await fetchCountingNumber();
});

function getUserInfoById(id: string) {
    return data.find(row => row[0] === id);
}

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

client.login(token);
