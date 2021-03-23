import {Ping} from './ping';
import {SunTzuQuote} from './suntzu';
import {Rosh} from './roshan';
import {StartExodia, AddExodia} from './exodia';
import {Help} from './help';

export const COMMANDS = {
    'ping': Ping,
    'quote': SunTzuQuote,
    'shouldirosh?': Rosh,
    'exodia': StartExodia,
    'joinexodia': AddExodia,
    'help': Help,
};