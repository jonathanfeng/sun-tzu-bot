import { QueryController } from '../database/query';

export async function Ping(accountId: string) {
    const qc = new QueryController();
    const lastPinger = await qc.getLastPinger(accountId);

    if (accountId === lastPinger) {
        console.log(`Repeat pinger found: ${accountId}`);
        return;
    }
    return "lol fuck u bitch ass";
}