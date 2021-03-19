import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {MessageResponder} from "./services/message-responder";
import {PingFinder, IMessage} from "./services/ping-finder";
import pool from './database/dbconnect'

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private messageResponder: MessageResponder;
  private pingFinder: PingFinder;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.MessageResponder) messageResponder: MessageResponder,
    @inject(TYPES.PingFinder) pingFinder: PingFinder) {
    this.client = client;
    this.token = token;
    this.messageResponder = messageResponder;
    this.pingFinder = pingFinder;
    this.dbConnect();
  }

  private async dbConnect() {
    await pool.connect();
    console.log('Connected to database...')
  }

  public async listen(): Promise<string> {
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
    });
    
    this.client.on('message', async (message: Message) => {
      if (message.author.bot) {
        console.log(`Ignoring bot message: ${message}`)
        return;
      }
      if (!this.pingFinder.checkPing(message.content)) return;
      await this.messageResponder.handle(message);
    });

    return this.client.login(this.token);
  }
}