import {EmbedFieldData, MessageEmbed, User} from 'discord.js';
import {SpreadsheetRow} from './bot';
import {link} from './config';


export function success() {
    return new MessageEmbed().setColor(0xf6b40c);
}

export function error(title: string, desc?: string) {
    const errorEmbed = new MessageEmbed()
        .setColor(0xb50300)
        .setAuthor({name: title});

    if (desc) errorEmbed.setDescription(desc);
    return errorEmbed;
}

// A MessageEmbed displaying the user's info.
export function userInfoEmbed(user: User, info: SpreadsheetRow) {
    const [id, year, name, subgroup, years, period, minecraft] = info;

    const fields: EmbedFieldData[] = [];

    if (year) fields.push({name: 'Year', value: year, inline: true});
    if (name) fields.push({name: 'Name', value: name, inline: true});
    if (years) fields.push({name: 'GRT Years', value: years, inline: true});
    if (subgroup) fields.push({name: 'Subgroup', value: subgroup, inline: true});
    fields.push({name: 'Discord', value: user.tag, inline: true});
    if (period) fields.push({name: 'Period', value: period, inline: true});
    if (minecraft) fields.push({name: 'Minecraft', value: minecraft, inline: true});

    return success()
        .setTitle('Guava Gang User Info')
        .setDescription(`Information about <@${user.id}>:`)
        .setURL(link)
        .setThumbnail(user.displayAvatarURL({format: 'png', dynamic: true, size: 1024 }))
        .addFields(fields);
}

// A MessageEmbed with info about Guava Bot.
export function helpEmbed() {
    return success()
        .setTitle('Guava Bot')
        .setDescription(`Guava Bot is open sourced on [GitHub](https://github.com/ky28059/guava-bot)! Edit the backing spreadsheet [here](${link}).`)
        .addFields([
            {name: 'whois @[user]', value: 'Gets info about the target user.', inline: true},
            {name: 'fetch', value: 'Refetches the TSV data source.', inline: true},
            {name: 'counting', value: 'Returns the current counting channel number.', inline: true},
            {name: 'reset', value: 'Force resets the counting number.', inline: true},
            {name: 'help', value: 'Sends info about this bot!', inline: true}
        ]);
}

// A MessageEmbed displaying the current counting number.
export function countingEmbed(currentNum: number) {
    return success()
        .setAuthor({name: `The current #counting number is ${currentNum}.`})
        .setDescription('Wrong? Try `/reset` or file a bug report with <@355534246439419904>.');
}

// A MessageEmbed with a success message for database refreshes.
export function refreshedEmbed() {
    return success()
        .setAuthor({name: 'Successfully refreshed database.', url: link})
}

// A MessageEmbed with a success message for counting number resets.
export function resetEmbed(currentNum: number) {
    return success()
        .setAuthor({name: `The #counting number has been reset to ${currentNum}.`})
}
