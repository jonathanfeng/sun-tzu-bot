import {Ping} from './ping';
import {SunTzuQuote} from './suntzu';
import {Rosh} from './roshan';
import {StartExodia} from './exodia';

export const COMMANDS = {
    'ping': Ping,
    'quote': SunTzuQuote,
    'shouldirosh?': Rosh,
    'exodia': StartExodia
};