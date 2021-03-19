import { Message } from 'discord.js';
import _ = require('lodash');
import { QueryController } from '../database/query';
import { IFunctionParams } from '../services/message-responder';

export async function StartExodia(params: IFunctionParams) {
  const DEFAULT_TIMER = 20;
  const qc = new QueryController();
  const { message, args } = params;
  const authorUsername = message.author.username;
  const game = args[0].toLowerCase() || undefined;
  const timer: number = parseInt(args[1]) > 60 ? parseInt(args[1]) : DEFAULT_TIMER;
  if (await isActiveGame(game, qc)) return "There is already a queue in place";
  setTimeout( async () => {await endSearch(game, message, authorUsername, qc)}, timer * 60 * 1000);
  await setActiveGame(game, qc);
  const mention = `<@&${getMention(message, game).map(role => role.id)[0]}>`;
  await startParty(game, authorUsername, qc);
  return `${authorUsername} began the summoning ritual for <:exodiahead:812195660123340850> in ${game}. Join them ${mention}!
  ${timer} minutes until search ends!`;
};

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