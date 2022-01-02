import {MessageEmbed} from 'discord.js';


export function success(title: string, desc?: string) {
    const successEmbed = new MessageEmbed()
        .setColor(0xf6b40c)
        .setAuthor({name: title});

    if (desc) successEmbed.setDescription(desc);
    return successEmbed;
}

export function error(title: string, desc?: string) {
    const errorEmbed = new MessageEmbed()
        .setColor(0xb50300)
        .setAuthor({name: title});

    if (desc) errorEmbed.setDescription(desc);
    return errorEmbed;
}
