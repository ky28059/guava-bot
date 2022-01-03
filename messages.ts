import {MessageEmbed} from 'discord.js';


type EmbedOptions = {
    title?: string, desc?: string, url?: string,
    author?: string, authorURL?: string
};
export function success({title, desc, url, author, authorURL}: EmbedOptions) {
    const successEmbed = new MessageEmbed()
        .setColor(0xf6b40c)

    if (title) successEmbed.setTitle(title);
    if (desc) successEmbed.setDescription(desc);
    if (url) successEmbed.setURL(url);
    if (author) successEmbed.setAuthor({name: author, url: authorURL});
    return successEmbed;
}

export function error(title: string, desc?: string) {
    const errorEmbed = new MessageEmbed()
        .setColor(0xb50300)
        .setAuthor({name: title});

    if (desc) errorEmbed.setDescription(desc);
    return errorEmbed;
}
