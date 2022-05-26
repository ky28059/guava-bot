import {Client, Message, TextChannel} from 'discord.js';
import fetch from 'node-fetch';
import {error, countingEmbed, helpEmbed, userInfoEmbed, refreshedEmbed, resetEmbed} from './messages';
import {token, link, source, countingId} from './config';


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
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_PRESENCES",
        "GUILD_MEMBERS",
        "GUILD_MESSAGE_REACTIONS",
    ],
    presence: {activities: [{type: 'WATCHING', name: 'you.'}]},
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
    // Parse last counting number
    const countingChannel = await client.channels.fetch(countingId) as TextChannel;
    const message = countingChannel.lastMessage;
    const match = message?.content.match(/\d+/);

    // If the last message does not exist or was not parseable, try the last 100.
    if (!message || !match) {
        for (const message of (await countingChannel.messages.fetch({limit: 100})).values()) {
            const match = message.content.match(/\d+/);
            if (!match) continue;
            currentNum = Number(match[0]);
            lastMessage = message;
            break;
        }
        return; // We hope this never triggers!
    }
    currentNum = Number(match[0]);
    lastMessage = message;
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'DM') return;

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

    const prefix = 'g';
    if (message.content.substring(0, prefix.length) === prefix) {
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift()?.toLowerCase();

        switch (commandName) {
            // whois @[user]
            case 'whois':
                const [target] = args;
                const id = target?.match(/^<@!?(\d+)>$/)?.[1] ?? target;

                const user = client.users.cache.get(id);
                if (!user)
                    return void await message.reply({embeds: [error('Invalid user provided.')]});

                const info = getUserInfoById(user.id);
                return void await message.reply({
                    embeds: [info
                        ? userInfoEmbed(user, info)
                        : error('User not found.', `The requested user <@${user.id}> (${user.id}) was not found in the database. If they are in the spreadsheet, try doing /fetch.`)
                    ]
                });

            // fetch
            case 'fetch':
                await refreshData();
                return void await message.reply({embeds: [refreshedEmbed()]});

            // counting
            case 'counting':
                return void await message.reply({embeds: [countingEmbed(currentNum)]});

            // reset
            case 'reset':
                await fetchCountingNumber();
                return void await message.reply({embeds: [resetEmbed(currentNum)]});

            // help
            case 'help':
                return void await message.reply({embeds: [helpEmbed()]});
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'whois') { // /whois @[user]
        const user = interaction.options.getUser('user')!;
        const info = getUserInfoById(user.id);

        return interaction.reply({
            embeds: [info
                ? userInfoEmbed(user, info)
                : error('User not found.', `The requested user <@${user.id}> (${user.id}) was not found in the database. If they are in the spreadsheet, try doing /fetch.`)
            ]
        });
    } else if (interaction.commandName === 'fetch') { // /fetch
        await refreshData();
        return interaction.reply({embeds: [refreshedEmbed()]});
    } else if (interaction.commandName === 'counting') { // /currentNumber
        return interaction.reply({embeds: [countingEmbed(currentNum)]});
    } else if (interaction.commandName === 'reset') { // /reset
        await fetchCountingNumber();
        return interaction.reply({embeds: [resetEmbed(currentNum)]});
    } else if (interaction.commandName === 'help') { // /help
        return interaction.reply({embeds: [helpEmbed()]});
    }
});

function getUserInfoById(id: string) {
    return data.find(row => row[0] === id);
}

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

client.login(token);
