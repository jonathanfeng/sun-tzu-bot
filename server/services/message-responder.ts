import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import {PingFinder} from "./ping-finder";
import * as commands from "../commands";
import {QueryController} from '../database/query';


@injectable()
export class MessageResponder {
  private pingFinder: PingFinder;

  constructor(
    @inject(TYPES.PingFinder) pingFinder: PingFinder
  ) {
    this.pingFinder = pingFinder;
  }

  async getResponse(message: Message, command: string, args: string[]) {
    if (command === 'ping') {
      return await commands.Ping(message.author.id);
    }
    if (command === 'quote') {
      return commands.SunTzuQuote();
    }
    if (command === 'shouldirosh?') {
      return commands.Rosh();
    }
  }

  async handle(message: Message): Promise<void> {
    const {args, command} = this.pingFinder.parsePrefix(message.content);
    const res = await this.getResponse(message, command, args);
    if (res) {
      console.log(`Response: ${res}`);
      message.channel.send(res);
    }
    return;
  }
}