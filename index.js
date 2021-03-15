const Discord = require('discord.js');
const process = require('process');
const fs = require('fs');
const random = require('random');

const client = new Discord.Client();
// constants
const DISCORD_API = process.env['DISCORD_API'];
const PREFIX = '!';
const simpleQuotes = JSON.parse(fs.readFileSync('quotes.json'));

let lastPinger = '';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  // ignore these messages
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return
  const commandBody = msg.content.slice(PREFIX.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

  console.log(`commandBody = ${commandBody} args = ${args} command = ${command} lastPinger = ${lastPinger}`)

  if (command === 'ping') {
    if (msg.author.id === lastPinger) return;
    msg.reply('lol fuck u bitch ass');
    lastPinger = msg.author.id;
  }

  if (command === 'quote') {
    const luckyNumber = random.int((min=0), (max=simpleQuotes.length));
    msg.reply(`Sun Tzu says: "${simpleQuotes[luckyNumber]}"`);
  }
});

client.login(DISCORD_API);

