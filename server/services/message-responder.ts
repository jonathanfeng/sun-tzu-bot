import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import {PingFinder} from "./ping-finder";
import {COMMANDS} from '../commands';

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

  async handle(message: Message): Promise<void> {
    const {args, command} = this.pingFinder.parsePrefix(message.content);
    const params: IFunctionParams = {
      message: message,
      command: command,
      args: args
    };
    const res = await this.Function[command](params);
    if (res) {
      console.log(`Response: ${res}`);
      message.channel.send(res);
    }
    return;
  }
}