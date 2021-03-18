import {injectable} from "inversify";

export interface IMessage {
  commandBody: string,
  args: string[],
  command: string,
}

@injectable()
export class PingFinder {

  private PREFIX = '!';

  public checkPing(stringToSearch: string): boolean {
    return stringToSearch.startsWith(this.PREFIX);
  }

  public parsePrefix(content: string): IMessage {
    const commandBody = content.slice(this.PREFIX.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    return {commandBody, args, command};
  }
}