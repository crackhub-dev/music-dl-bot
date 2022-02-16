const launchTimestamp = Date.now();

const Discord = require('discord.js-light');
const Logger = require('./core/utils/logger');
const eventManager = require('./core/event-handler/event-handler');
const { token, intents } = require('./config/bot-config.json');

// Create the Discord client with the appropriate options
const client = new Discord.Client({
    disableMentions: 'everyone',
    messageCacheMaxSize: 30,
    messageEditHistoryMaxSize: 0,
    ws: {
        // List of intents for the bot, can be found at
        // https://discord.js.org/#/docs/main/stable/class/Intents?scrollTo=s-FLAGS
        intents,
    },
    // Discord-js light caching options (modify for your needs)
    cacheGuilds: true,
    cacheChannels: true,
    cacheOverwrites: true,
    cacheRoles: true,
    cacheEmojis: false,
    cachePresences: false,
});

eventManager.init(client, { launchTimestamp });

client.login(token)
    .then(() => Logger.info('Logged into Discord successfully'))
    .catch((err) => {
        Logger.error('Error logging into Discord', err);
        process.exit();
    });