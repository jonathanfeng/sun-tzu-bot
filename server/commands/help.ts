const helpText = `Thank you for using Sun-Tzu-Bot! Here are my commands:
**!quote** -- returns a random Sun Tzu quote (original purpose of bot)
**!summonexodia <game> <opt: timer>** -- starts a party-finder for game (must include game in argument)
    - optional timer argument (minutes)
    - tags everyone in the server with the role for the game
    - Once the party is full, everyone in the party will be automatically tagged
    *To join the party-finder, use one of these commands below:*
    **!leftarm <game>**
    **!rightarm <game>**
    **!leftleg <game>**
    **!rightleg <game>**
**!shouldirosh?** -- helps you decide whether or not to rosh in game
**!ping** -- test me
`;

export function Help(): string {
    return helpText;
}