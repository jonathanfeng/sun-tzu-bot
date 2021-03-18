require('dotenv').config();
import container from "./inversify.config";
import {TYPES} from "./types";
import {Bot} from "./bot";

let bot = container.get<Bot>(TYPES.Bot);

bot.listen().then(() => {
  console.log('Waking Sun Tzu from slumber...');
}).catch((error) => {
  console.log(`Oh no! Failed to start ${error}`);
});