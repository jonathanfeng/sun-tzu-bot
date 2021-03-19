import pool from './dbconnect';

export class QueryController {
  async getLastPinger(authorId: string) {
    const client = await pool.connect();
    const response = await client.query(`SELECT lastpinger FROM public.states`);
    await client.query(`UPDATE public.states SET lastPinger = $1`, [authorId]);
    client.release();
    return response.rows[0].lastpinger;
  }
  async runQuery(query: string, values: string[] = []) {
    const client = await pool.connect();
    const response = values.length === 0 ? await client.query(query) : await client.query(query, values);
    return response.rows;
  }
}