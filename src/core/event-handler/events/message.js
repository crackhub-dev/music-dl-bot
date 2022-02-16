const commandHandler = require('../../command-handler/command-handler');
const permissionsHandler = require('../../discord-utils/permissions-handler');
const embeds = require('../../graphics/embeds');
const Logger = require('../../utils/logger');
const Ctx = require('../../command-handler/Ctx');
const commandConfigs = require('../../../config/commands-config.json');

module.exports = async(client, message) => {
    try {
        if (message.author.bot) {
            return;
        }

        if (!message.guild) {
            return;
        }

        const { guild, channel, member } = message;


        const commandCheck = await commandHandler.getCommandData(message, commandConfigs.prefix);
        if (!commandCheck.command) {
            return;
        }

        const { command, args } = commandCheck;

        if (command.reqArgs && !args.length) {
            await channel.send(embeds.error('The command is missing some arguments'));
            return;
        }

        const missingTextPerms = permissionsHandler.checkTextPerms(channel);
        if (missingTextPerms.length > 0) {
            await channel.send(embeds.error(`Missing text channel permissions:\n- ${missingTextPerms.join('\n- ')}`));
            return;
        }

        const missingGuildPerms = permissionsHandler.checkGuildPerms(guild);
        if (missingGuildPerms.length > 0) {
            await channel.send(embeds.error(`Missing server permissions:\n- ${missingGuildPerms.join('\n- ')}`));
            return;
        }


        const ctx = new Ctx(message, command.name, args);

        const error = await commandHandler.runCommand(ctx);
        Logger.command(ctx);
        if (error) {
            await channel.send(embeds.error(`Error while executing the command ${command.name}`));
            Logger.error(`Error caused by the ${ctx.commandName} command`, error);
        }
    } catch (e) {
        Logger.error('Error from message event', e);
    }
};