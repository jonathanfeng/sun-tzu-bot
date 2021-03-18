import * as fs from 'fs';
const simpleQuotes: string[] = JSON.parse(fs.readFileSync('data/quotes.json').toString());

export function SunTzuQuote(): string {
    const luckyNumber: number = Math.floor(Math.random() * Math.floor(simpleQuotes.length));
    return `"${simpleQuotes[luckyNumber]}" — Sun Tzu`;
}