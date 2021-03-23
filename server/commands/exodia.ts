import { Message, MessageEmbed, GuildMember, Snowflake, Collection } from 'discord.js';
import _ = require('lodash');
import { QueryController } from '../database/query';
import { IFunctionParams } from '../services/message-responder';

export enum ExodiaEmojis {
  Head = '<:exodiahead:812195660123340850>',
  LeftArm = '<:exodialeftarm:812194998090596352>',
  RightArm = '<:exodiarightarm:812195831318970388>',
  LeftLeg = '<:exodialeftleg:812195847491682304>',
  RightLeg = '<:exodiarightleg:812195861806186536>',
}

export enum ReverseExodiaEmojis {
  '<:exodiahead:812195660123340850>' = 'exodiaHead',
  '<:exodialeftarm:812194998090596352>' = 'leftarm',
  '<:exodiarightarm:812195831318970388>' = 'rightarm',
  '<:exodialeftleg:812195847491682304>' = 'leftleg',
  '<:exodiarightleg:812195861806186536>' = 'rightleg',
}

export enum ExodiaCase {
  head = 'Head',
  leftarm = 'LeftArm',
  rightarm = 'RightArm',
  leftleg = 'LeftLeg',
  rightleg = 'RightLeg',
}

export enum PartySize {
  dota2 = 5,
  csgo = 5,
}

export async function StartExodia(params: IFunctionParams) {
  const DEFAULT_TIMER = 30;
  const qc = new QueryController();
  const { message, args } = params;
  const authorId = message.author.id;
  const game = args[0] ? args[0].toLowerCase() : undefined;
  if (!game) return "Please specify a game when trying to summon exodia";
  const timer: number = parseInt(args[1]) > 60 ? parseInt(args[1]) : DEFAULT_TIMER;
  if (await isActiveGame(game, qc)) return "There is already a queue in place";
  setTimeout( async () => {await endSearch(game, authorId, true, qc, message)}, timer * 60 * 1000);
  await setActiveGame(game, qc);
  const mention = !process.env['IS_DEV'] ? `<@&${getMention(message, game).map(role => role.id)[0]}>` : 'idiots';
  const embedMessage = await generateEmbed(message, game, timer, mention);
  await startParty(game, authorId, embedMessage, timer, qc);
  return embedMessage;
};

async function generateEmbed(message: Message, game: string, timer: number, mention: string) {
  return new MessageEmbed()
    .setColor('DEFAULT')
    .setTitle(`${message.author.username}'s Exodia Summoning Party for ${game.toUpperCase()}`)
    .setURL('https://www.youtube.com/watch?v=OBaJBGY-HUc')
    .setAuthor(`ExodiaHunt`, message.author.defaultAvatarURL, message.author.defaultAvatarURL)
    .setDescription(`Game timer set for ${timer} minute(s)`)
    .addFields(
      { name: `JOIN NOW`, value: `There are 4 spots open ${mention}!` },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: message.author.username, value: ExodiaEmojis.Head, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: 'Empty', value: ExodiaEmojis.LeftArm, inline: true},
      { name: 'Empty', value: ExodiaEmojis.RightArm, inline: true},
      { name: '\u200B', value: '\u200B' },
      { name: 'Empty', value: ExodiaEmojis.LeftLeg, inline: true},
      { name: 'Empty', value: ExodiaEmojis.RightLeg, inline: true},
    )
    .setImage('https://i.imgur.com/D0w4G8Y.jpg')
    .setTimestamp()
    .setFooter(`fueled by rule34.xxx`, 'https://rule34.xxx/apple-touch-icon-114x114-precomposed.png');
}

export async function AddExodia(params: IFunctionParams) {
  const qc = new QueryController();
  const { message, args, command } = params;
  const game = args[0] ? args[0].toLowerCase() : undefined;
  const mention = !process.env['IS_DEV'] ? `<@&${getMention(message, game).map(role => role.id)[0]}>` : 'idiots';
  if (!game) return "Please specify a game you are trying to join.";
  if (!(await isActiveGame(game, qc))) return "There is no active game for you to join.";
  const joinStatus = await joinParty(game, command, message, mention, qc);
  return joinStatus;
};

async function joinParty(game: string, command: string, message: Message, mention: string, qc: QueryController) {
  const authorId = message.author.id;
  const authorUsername = message.author.username;
  const currentParty = await qc.getLatestParty(game);
  const createTime = new Date(currentParty.timestamp).getTime();
  const partyJson = currentParty.players;
  const embedMessage: MessageEmbed = new MessageEmbed(currentParty.embedmessage);
  if (!_.every(partyJson, null)) {
    if (!_.includes(partyJson, authorId)) {
      if (partyJson[command] === null) {
        partyJson[command] = authorId;
        _.forEach(embedMessage.fields, field => {
          if (field.value === ExodiaEmojis[ExodiaCase[command]]) {
            field.name = authorUsername;
          }
        });
        currentParty.playercount += 1;
      } else {
        return `Sorry, this part of Exodia is already taken.`;
      }
    } else {
      return `You're already in the party...`;
    }
  } else {
    return `Sorry, the party is currently full.`;
  }
  if (!_.every(partyJson, null)) {
    embedMessage.fields[0].value = `There are ${PartySize[game]-currentParty.playercount} spots open ${mention}!`;
    embedMessage.setTimestamp();
    const timeLeft = Math.floor(((currentParty.timer * 60) - (embedMessage.timestamp - createTime)/1000)/60);
    embedMessage.setDescription(`There are ${timeLeft} minute(s) left!`);
  } else {
    embedMessage.setDescription(`Party is found! Let's go!`);
    embedMessage.fields[0].value = `Party is found! Let's go!`;

    const mentionArray = [];
    embedMessage.fields.forEach(field => {
      if (ReverseExodiaEmojis[field.value]) {
        const part = ReverseExodiaEmojis[field.value];
        mentionArray.push(`<@${partyJson[part]}>`);
      }
    });
    embedMessage.addField(`Tagging players:`, mentionArray.join(', '));
    endSearch(game, authorId, false, qc);
    return embedMessage;
  }
  const joinQuery = `UPDATE public.parties SET players = $1, embedMessage = $2, playercount = $3 WHERE uuid = $4`;
  const joinValues = [JSON.stringify(partyJson), JSON.stringify(embedMessage), currentParty.playercount, currentParty.uuid];
  await qc.runQuery(joinQuery, joinValues);
  return embedMessage;
}

async function startParty(game: string, authorId: string, embedMessage: MessageEmbed, timer:number, qc: QueryController) {
  const startQuery = `INSERT INTO public.parties (game,owner,players,timestamp, embedmessage, timer) VALUES($1,$2,$3,NOW(),$4,$5)`;
  const emptyJson = {exodiaHead: authorId, leftarm: null, leftleg: null, rightarm: null, rightleg: null};
  const startValues = [game, authorId, JSON.stringify(emptyJson), JSON.stringify(embedMessage), timer.toString()];
  await qc.runQuery(startQuery, startValues);
};

function getMention(message: Message, game: string) {
  if (game === 'dota2') {
    return message.guild.roles.cache.filter(role => role.name === 'dotards');
  }
  if (game === 'csgo') {
    return message.guild.roles.cache.filter(role => role.name === 'goers');
  }
};

async function endSearch(game: string, authorId:string, isFail: boolean, qc: QueryController, message?: Message) {
  if (await isActiveGame(game, qc)) {
    const endQuery = `UPDATE public.states SET ${game} = ${false}`;
    await qc.runQuery(endQuery);
    if (isFail) {
      message.channel.send(`The ${game} Exodia party failed to summon for ${authorId} and friends.`);
    }
  }
};

async function setActiveGame(game: string, qc: QueryController) {
  const setActiveQuery = `UPDATE public.states SET ${game} = ${true}`;
  await qc.runQuery(setActiveQuery);
};

async function isActiveGame(game: string, qc: QueryController) {
  const gameQuery = `SELECT ${game} FROM public.states`;
  const rows = await qc.runQuery(gameQuery);
  return rows[0][game];
};