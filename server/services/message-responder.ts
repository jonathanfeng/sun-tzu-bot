import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import {PingFinder} from "./ping-finder";
import {COMMANDS} from '../commands';
import * as _ from 'lodash';

export interface IFunctionParams {
  message: Message,
  command: string,
  args: string[]
}

@injectable()
export class MessageResponder {
  private pingFinder: PingFinder;
  private Function;

  constructor(
    @inject(TYPES.PingFinder) pingFinder: PingFinder
  ) {
    this.pingFinder = pingFinder;
    this.Function = COMMANDS
  }

  sanitizeCommand(command: string) {
    if (_.includes(['shouldirosh?', 'shouldwerosh?'], command)) return 'rosh';
    if (_.includes(['summonexodia'], command)) return 'exodia';
    if (_.includes(['leftarm', 'rightarm', 'leftleg', 'rightleg'], command)) return 'joinexodia';
    return command;
  }

  async handle(message: Message): Promise<void> {
    const {args, command} = this.pingFinder.parsePrefix(message.content);
    const sanitizedCommand = this.sanitizeCommand(command);
    const params: IFunctionParams = {
      message: message,
      command: command,
      args: args
    };
    if (!_.has(this.Function, sanitizedCommand)) return;
    const res = await this.Function[sanitizedCommand](params);
    if (res) {
      console.log(`Response: ${res}`);
      message.channel.send(res);
    }
    return;
  }
}