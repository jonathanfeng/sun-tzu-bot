const Discord = require('discord.js');
const client = new Discord.Client();
const process = require('process');

// constants
const DISCORD_API = process.env['DISCORD_API'];
const PREFIX = '!';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  console.log(msg);
  // ignore these messages
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.login(DISCORD_API);

