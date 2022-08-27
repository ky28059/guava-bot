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
