const beautify = require('beautify.log').default;
const { name } = require('../../config/bot-config.json');
const { commands, guildJoin, guildLeave } = require('../../config/logging-config.json');

function formatText(text) {
   return text.replace('BOTNAME', name);
}

module.exports = {
   info(text) {
      const prefix = '{fgGreen}[BOTNAME - INFO] {reset}';
      beautify.log(formatText(prefix + text));
   },

   warn(text, warn) {
      const prefix = '{fgYellow}[BOTNAME - WARN] {reset}';
      beautify.log(formatText(`${prefix + text}\n${warn}`));
   },

   error(text, err) {
      const prefix = '{fgRed}[BOTNAME - ERROR] {reset}';
      beautify.log(formatText(`${prefix + text}\n${err}`));
   },

   command(ctx) {
      if (commands) {
         const prefix = '{fgMagenta}[BOTNAME - COMMAND] {reset}';
         beautify.log(formatText(`${prefix}${ctx.member.displayName} (${ctx.member.id}) used ${ctx.commandName} in ${ctx.guild.name} (${ctx.guild.id})`));
      }
   },

   guildJoin(guild) {
      if (guildJoin) {
         const prefix = '{fgCyan}[BOTNAME - GUILD JOIN] {reset}';
         beautify.log(formatText(`${prefix}Joined (${guild.name}) (${guild.id}), members: ${guild.memberCount}`));
      }
   },

   guildLeave(guild) {
      if (guildLeave) {
         const prefix = '{fgYellow}[BOTNAME - GUILD LEAVE] {reset}';
         beautify.log(formatText(`${prefix}Left (${guild.name}) (${guild.id}), members: ${guild.memberCount}`));
      }
   },
};
