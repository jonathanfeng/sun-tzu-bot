import { QueryController } from '../database/query';
import { IFunctionParams } from '../services/message-responder';

export async function Ping(params: IFunctionParams) {
    const qc = new QueryController();
    const authorId = params.message.author.id;
    const lastPinger = await qc.getLastPinger(authorId);

    if (authorId === lastPinger) {
        console.log(`Repeat pinger found: ${authorId}`);
        return;
    }
    return `Congrats! You found the !ping system! Do you want a cookie?`;
}