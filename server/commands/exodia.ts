import { Message } from 'discord.js';
import _ = require('lodash');
import { QueryController } from '../database/query';
import { IFunctionParams } from '../services/message-responder';

export async function StartExodia(params: IFunctionParams) {
  const DEFAULT_TIMER = 30;
  const qc = new QueryController();
  const { message, args } = params;
  const authorUsername = message.author.id;
  const game = args[0] ? args[0].toLowerCase() : undefined;
  if (!game) return "Please specify a game when trying to summon exodia";
  const timer: number = parseInt(args[1]) > 60 ? parseInt(args[1]) : DEFAULT_TIMER;
  if (await isActiveGame(game, qc)) return "There is already a queue in place";
  setTimeout( async () => {await endSearch(game, message, authorUsername, qc)}, timer * 60 * 1000);
  await setActiveGame(game, qc);
  let mention = `<@&${getMention(message, game).map(role => role.id)[0]}>`;
  if (process.env["IS_DEV"]) {
    mention = "idiota";
  }
  await startParty(game, authorUsername, qc);
  return `${authorUsername} began the summoning ritual for <:exodiahead:812195660123340850> in ${game}. Join them ${mention}!
${timer} minutes until search ends!`;
};

export async function AddExodia(params: IFunctionParams) {
  const qc = new QueryController();
  const { message, args, command } = params;
  const authorUsername = message.author.id;
  const game = args[0] ? args[0].toLowerCase() : undefined;
  if (!game) return "Please specify a game you are trying to join.";
  if (!(await isActiveGame(game, qc))) return "There is no active game for you to join.";
  const joinStatus = await joinParty(game, command, authorUsername, qc);
  if (joinStatus === 'full') return `Sorry, the party is currently full.`;
  if (joinStatus === 'taken') return `Sorry, this part of Exodia is already taken.`;
  if (joinStatus === 'repeat') return `You're already in the party...`;
  if (joinStatus === 'success') return `You've successfully joined the party!`;
  if (joinStatus === 'letsgo') return `Party is found, let's go!`;
};

async function joinParty(game: string, command: string, authorUsername: string, qc: QueryController) {
  const currentParty = await qc.getLatestParty(game);
  const partyJson = currentParty.players;
  if (!_.every(partyJson, null)) {
    if (!_.includes(partyJson, authorUsername)) {
      if (partyJson === null) {
        partyJson[command] = authorUsername;
      } else {
        return 'taken';
      }
    } else {
      return "repeat";
    }
  } else {
    return "full";
  }
  if (!_.every(partyJson, null)) {
    const joinQuery = `UPDATE public.parties SET players = $1 WHERE uuid = $2`;
    const joinValues = [partyJson, currentParty.uuid];
    await qc.runQuery(joinQuery, joinValues);
    return "success";
  } else {
    return "letsgo";
  }
}

async function startParty(game: string, authorUsername: string, qc: QueryController) {
  const startQuery = `INSERT INTO public.parties (game,owner,players,timestamp) VALUES($1,$2,$3,NOW())`;
  const emptyJson = {exodiaHead: authorUsername, leftarm: null, leftleg: null, rightarm: null, rightleg: null};
  const startValues = [game, authorUsername, JSON.stringify(emptyJson)];
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

async function endSearch(game: string, message: Message, authorUsername:string, qc: QueryController) {
  if (await isActiveGame(game, qc)) {
    const endQuery = `UPDATE public.states SET ${game} = ${false}`;
    await qc.runQuery(endQuery);
    message.channel.send(`The ${game} Exodia party failed to summon for ${authorUsername} and friends.`);
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