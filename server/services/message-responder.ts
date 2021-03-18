import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import {PingFinder} from "./ping-finder";
import * as commands from "../commands";

@injectable()
export class MessageResponder {
  private pingFinder: PingFinder;

  constructor(
    @inject(TYPES.PingFinder) pingFinder: PingFinder
  ) {
    this.pingFinder = pingFinder;
  }

  handle(message: Message): Promise<Message | Message[]> {
    const {args, command} = this.pingFinder.parsePrefix(message.content);
    let res: string;
    if (command === 'ping') {
      res = commands.Ping();
    }
    if (command === 'quote') {
      res = commands.SunTzuQuote();
    }
    if (command === 'shouldirosh?') {
      res = commands.Rosh();
    }
    if (res) return message.channel.send(res);
    return Promise.reject();
  }
}