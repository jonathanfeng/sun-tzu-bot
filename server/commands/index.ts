export * from './ping';
export * from './suntzu';
export * from './roshan';
import {Ping} from './ping';
import {SunTzuQuote} from './suntzu';
import {Rosh} from './roshan';

export const COMMANDS = {
    'ping': Ping,
    'quote': SunTzuQuote,
    'shouldirosh?': Rosh
};