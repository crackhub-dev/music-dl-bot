module.exports = {
    checkTextPerms(channel) {
        return Object.entries(this.textChannelPerms)
            .filter((p) => !channel.permissionsFor(channel.guild.me.id).has(p[0]))
            .map((p) => p[1]);
    },

    checkVoicePerms(vc) {
        return Object.entries(this.voiceChannelPerms)
            .filter((p) => !vc.permissionsFor(vc.guild.me.id).has(p[0]))
            .map((p) => p[1]);
    },

    checkGuildPerms(guild) {
        return Object.entries(this.guildPerms)
            .filter((p) => !guild.me.hasPermission(p[0]))
            .map((p) => p[1]);
    },

    textChannelPerms: {
        VIEW_CHANNEL: 'Read Messages',
        SEND_MESSAGES: 'Send Messages',
        EMBED_LINKS: 'Embed Links',
        ADD_REACTIONS: 'Add Reactions',
        USE_EXTERNAL_EMOJIS: 'Use External Emojis',
        ATTACH_FILES: 'Attach Files',
    },

    guildPerms: {
        MANAGE_CHANNELS: 'Manage Channels',
        MANAGE_ROLES: 'Manage Roles',
        MOVE_MEMBERS: 'Move Members',
        CREATE_INSTANT_INVITE: 'Create Invite',
    },

    voiceChannelPerms: {
        VIEW_CHANNEL: 'View Channel',
        CONNECT: 'Connect',
        SPEAK: 'Speak',
        USE_VAD: 'Use Voice Activity',
    },
};