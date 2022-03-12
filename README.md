# guava bot
Reverse engineered Artoo !whois bot for a certain elusive discord server. Most of the framework was taken from 
[PortalBot](https://github.com/ky28059/PortalBot) and [RBot](https://github.com/ky28059/RBot).

https://discord.com/oauth2/authorize?client_id=927093994754818069&scope=bot+applications.commands&permissions=8

To run locally, create a `config.ts` in the root directory which exports your bot token, spreadsheet link, TSV source, and
counting channel ID:
```ts
// config.ts
export const token = 'totally-real-discord-token';
export const link = 'https://docs.google.com/spreadsheets/d/some-spreadsheet-id/edit?usp=sharing';
export const source = 'https://docs.google.com/spreadsheets/d/e/some-spreadsheet-id/pub?gid=0&single=true&output=tsv';
export const countingId = '100000000000000000';
```
Install dependencies with `npm install`, run `npm run registerSlashCommands` to register slash commands with the Discord application, 
and `npm start` to run the bot.
