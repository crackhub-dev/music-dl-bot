const { ShardingManager } = require('discord.js-light');
const { token } = require('./config/bot-config.json');
const Logger = require('./core/utils/logger');

const manager = new ShardingManager('./src/bot.js', { token });

manager.on('shardCreate', (shard) => Logger.info(`Launched shard n° ${shard.id}`));
manager.spawn();
