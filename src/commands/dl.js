//imports
const { exec } = require('child_process');
const fs = require('fs');
const uuid = require('short-uuid');
const logger = require('../core/utils/logger');
const { MessageEmbed } = require('discord.js-light');
const colors = require('../core/graphics/colors');
const { findq } = require('../core/utils/qobuzhelper');
const { detect } = require('../core/utils/artisthelper');
const { Base64 } = require('js-base64');
const { chooseSeviceAccount } = require('../core/utils/serviceAccountHelper');
//configuration constants; EDIT HERE
const REQUEST_CHANNEL = ''; //ID of channel where people request links
const UPLOAD_CHANNEL = ''; //ID of channel where the bot will post the uploads
const INDEX_URL = ''; //only needs to be specified if USE_INDEX is true, otherwise leave blank "". Make sure it has a trailing slash.
const ENABLED_SERVICES = ['tidal', 'qobuz', 'deezer', 'soundcloud', 'spotify']; // to disable, remove from the list
const BOT_DOWNLOADS_FOLDER = "/path/to/src/downloads"; // forward slashes, not backslashes for windows
const RCLONE_REMOTE = chooseSeviceAccount(); //random via chooseSeviceAccount() or one remote just as string
const USE_INDEX = true; //use google drive index or not, if set to true, make sure to specify INDEX_URL above, make sure to includd ":" at th end.
const ALLOW_ARTISTS_PLAYLISTS = false; //wether you want to allow playlist/artists to be downloaded (can be hard on resources if set to true!)
const SOUNDCLOUD_OAUTH_TOKEN = "OAuth xxxxxxx"; // soundcloud oAuth token. Only needs to be set if soundcloud is enabled, of course.
const USE_BASE_64 = true;
//end configuration constants

function genb64link(link) {
    const url = Base64.encodeURI(link, {
        urlsafe: true
    });
    return `https://links.gamesdrive.net/#/link/${url}.U2xhdiBNdXNpYyBCb3Q=`;
}



function isValidLink(link) {
    return link.startsWith('https://') || link.startsWith('http://');
}
async function zipAndUpload(ctx, id, msg, path, remote, useIndex, link, callback) {
    const author = ctx.message.author;
    await msg.edit(`${author}\nZipping...`);
    await msg.react('📦');
    exec(`7z a -mx0 -tzip ${path}/toUpload/${id}.zip ${path}/${id}/* `, (err, stdout, stderr) => {
        logger.info(`${stdout}`);

        if (err) {
            logger.error(`${err}`);
            ctx.message.reply(`*Error: Couldn't zip <${ctx.args[0]}>; ID: ${id}*`);
            msg.reactions.removeAll()
            fs.rmSync(`${BOT_DOWNLOADS_FOLDER}/${uploadID}`, { recursive: true });
            return;

        }
        if (fs.statSync(`${path}/toUpload/${id}.zip`).size <= 1000) {
            msg.edit(`${author}\nError: Couldn't rip <${ctx.args[0]}> (Most likely: GEO restriction.)`);
            msg.reactions.removeAll();
            ctx.message.react('❌');
            ctx.message.react('🌐');
            fs.rmSync(`${path}/toUpload/${id}.zip`);
            fs.rmSync(`${path}/${id}`, { recursive: true }, (err, stdout, stderr) => { logger.info(`Removed GEO restricted item.`); });
            return;
        }
        if (!err) {
            exec(`rm -rf ${path}/${id}`, (err, stdout, stderr) => {
                if (err) {
                    logger.error(`${err}`);
                    msg.reactions.removeAll();
                    msg.edit(`${author}\nError: Couldn't remove temp folder.`);
                }
                if (!err) {
                    msg.edit(`${author}\nUploading...`);
                    msg.react("📤");
                    exec(`rclone copy ${path}/toUpload/${id}.zip ${remote} --ignore-existing --transfers 4 --checkers 8 --bwlimit 95M --contimeout 60s --timeout 300s --retries 3 --low-level-retries 10 --drive-chunk-size 128M --stats 1s -P -v `, (err, stdout, stderr) => {
                        logger.info(stdout)
                        if (err) {
                            logger.error(`${err}`);
                            msg.delete(`${author}\n*Error: Couldn't upload <${ctx.args[0]}>; ID: ${id}*`);
                            msg.reactions.removeAll()
                            fs.rmSync(`${BOT_DOWNLOADS_FOLDER}/${uploadID}`, { recursive: true });
                            fs.rmSync(`${BOT_DOWNLOADS_FOLDER}/toUpload/${uploadID}.zip`);
                            return;
                        }
                        if (!err) {
                            if (useIndex === true) {
                                logger.info()
                                let link;
                                if (USE_BASE_64 == true) {
                                    link = genb64link(`${INDEX_URL}${id}.zip`);

                                } else {
                                    link = stdout;
                                }

                                fs.rmSync(`${path}/toUpload/${id}.zip`);
                                logger.info(link)
                                msg.react('🔗')
                                return callback(link);
                            }
                            if (useIndex === false) {
                                msg.edit(`${author}\nGenerating link...`);
                                msg.react('🔗')
                                exec(`rclone link ${remote}${id}.zip`, (err, stdout, stderr) => {
                                    logger.info(stdout)
                                    let link;
                                    if (USE_BASE_64 == true) {
                                        link = genb64link(stdout);

                                    } else {
                                        link = stdout;
                                    }

                                    fs.rmSync(`${path}/toUpload/${id}.zip`);
                                    logger.info(link)
                                    return callback(link);
                                })

                                fs.rmdirSync(`${path}/${id}`, { recursive: true, force: true });


                            }
                        }

                    })
                }
            });
        }
    });
}

module.exports = {
    name: 'dl',
    aliases: ['download'],
    description: 'Downloads music',
    reqArgs: true,
    usage: '{ link }',
    exampleUsage: 'dl <tidal | qobuz | deezer | soundcloud link>',
    category: 'utility',
    cooldown: 1,
    async run(ctx) {
        logger.info(ctx.args)
        if (ctx.channel != REQUEST_CHANNEL) {
            ctx.message.reply(`This command can only be used in <#${REQUEST_CHANNEL}>`);
        }

        if (ctx.channel == REQUEST_CHANNEL) {
            let link = ctx.args[0];
            let q = '--max-quality 4';
            if (ctx.args[1]) {
                q = `--max-quality ${ctx.args[1]}`
                if (ctx.args[1] > 4) {
                    q = '--max-quality 4';
                }
                if (ctx.args[1] < 0) {
                    q = '--max-quality 0';
                }
            }


            const author = ctx.message.author;
            const uploadID = uuid.generate();
            fs.mkdirSync(`${BOT_DOWNLOADS_FOLDER}/${uploadID}`);
            let service = ENABLED_SERVICES.find(service => link.includes(service));
            if (!service && isValidLink(link)) {
                return ctx.channel.send(`Invalid service. Valid services: ${ENABLED_SERVICES.join(', ')}`);
            }
            let valid_link = await isValidLink(link);
            if (!valid_link) {
                return ctx.message.reply(`Invalid link.`);
            }
            if (link.includes('www.qobuz.com')) {
                await findq(link, (url) => {
                    link = url
                })
            }
            let msg = await ctx.message.reply(`Processing <${link}>...`);
            if (service == 'tidal' || service == 'deezer' || service == 'qobuz') {

                if (ALLOW_ARTISTS_PLAYLISTS == false) {
                    detect(ctx.args[0], (r) => {
                        if (r == true) {
                            ctx.message.react('❌');
                            msg.edit(`**Downloading artists and playlists is not allowed.**`);
                            return;
                        }
                        if (r == false) {
                            msg.edit(`${author}\nRipping <${link}>...`);
                            msg.react('⬇️');
                            exec(`rip url ${link} ${q} -i -d ${BOT_DOWNLOADS_FOLDER}/${uploadID}`, (err, stdout, stderr) => {
                                if (err) {
                                    msg.reactions.removeAll()
                                    msg.edit(`${author}\n**Error: Couldn't download <${ctx.args[0]}>; ID: ${uploadID}** (possible reasons: region restrictions?, invalid link?)`);
                                    fs.rmSync(`${BOT_DOWNLOADS_FOLDER}/${uploadID}`, { recursive: true });
                                    return;
                                }
                                if (!err) {

                                    zipAndUpload(ctx, uploadID, msg, BOT_DOWNLOADS_FOLDER, RCLONE_REMOTE, USE_INDEX, link, (drive_link) => {

                                        logger.info("uploaded")
                                        const embed = new MessageEmbed()
                                            .setColor(colors.info)
                                            .setTitle(`Download is finished`)
                                            .setDescription(`Your requested link, <${ctx.args[0]}>, is now available for download:`)
                                            .addField(`Download link`, drive_link)
                                        let uc = ctx.guild.channels.cache.find(channel => channel.id === UPLOAD_CHANNEL);
                                        let finished_msg = uc.send(embed);
                                        uc.send(`<@${author.id}>`);
                                        msg.edit(`${author}\nDone! You can find your link in <#${UPLOAD_CHANNEL}>`);
                                        ctx.message.react('✅');
                                        msg.react('✅');

                                    });
                                }
                            });
                        }
                    })
                };





            }
            if (service == 'soundcloud') {
                if (ALLOW_ARTISTS_PLAYLISTS == false) {
                    detect(ctx.args[0], (r) => {
                        if (r == true) {
                            ctx.message.react('❌');
                            msg.edit(`**Downloading artists and playlists is not allowed.**`);
                            return;
                        }
                        if (r == false) {
                            msg.edit(`${author}\nRipping <${link}>...`);
                            msg.react("⬇️")
                            exec(`yt-dlp -x ${link} --output ${BOT_DOWNLOADS_FOLDER}/${uploadID}/"%(title)s.%(ext)s"  --add-header Authorization:"${SOUNDCLOUD_OAUTH_TOKEN}" --add-metadata --embed-thumbnail`, (err, stdout, stderr) => {
                                if (err) {
                                    logger.error(`${err}`);
                                    msg.reactions.removeAll()
                                    msg.edit(`${author}\n**Error: Couldn't download <${ctx.args[0]}>; ID: ${uploadID}**\n(possible reasons: region restrictions?, invalid link?)`);
                                    fs.rmSync(`${BOT_DOWNLOADS_FOLDER}/${uploadID}`, { recursive: true });
                                    return;
                                }
                                if (!err) {
                                    zipAndUpload(ctx, uploadID, msg, BOT_DOWNLOADS_FOLDER, RCLONE_REMOTE, USE_INDEX, link, (drive_link) => {
                                        const embed = new MessageEmbed()
                                            .setColor(colors.info)
                                            .setTitle(`Download is finished`)
                                            .setDescription(`Your requested link, <${ctx.args[0]}>, is now available for download:`)
                                            .addField(`Download link`, drive_link)
                                        let uc = ctx.guild.channels.cache.find(channel => channel.id === UPLOAD_CHANNEL);
                                        let finished_msg = uc.send(embed);
                                        uc.send(`<@${author.id}>`);
                                        msg.edit(`${author}\nDone! You can find your link in <#${UPLOAD_CHANNEL}>`);
                                        ctx.message.react('✅');
                                        msg.react('✅');

                                    });
                                }
                            });
                        }
                    })
                }

            }
            if (link.includes("spotify.com")) {
                if (link.includes("&utm_source=copy-link")) {
                    link = link.replace("&utm_source=copy-link", "");
                }
                if (ALLOW_ARTISTS_PLAYLISTS == false) {
                    detect(ctx.args[0], (r) => {
                        if (r == true) {
                            ctx.message.react('❌');
                            msg.edit(`**Downloading artists and playlists is not allowed.**`);
                            return;
                        }
                        if (r == false) {
                            msg.edit(`${author}\nRipping <${link}>...`);
                            msg.react('⬇️');
                            logger.info(`python ./src/core/utils/zspotify/ ${link} --root-path ${BOT_DOWNLOADS_FOLDER}/${uploadID}/`)
                            exec(`python ./src/core/utils/zspotify/ ${link} --root-path ${BOT_DOWNLOADS_FOLDER}/${uploadID}/`, (err, stdout, stderr) => {
                                if (err) {
                                    logger.error(`${err}`);
                                    msg.edit(`**Error: Couldn't download <${ctx.args[0]}>; ID: ${uploadID}**\n(possible reasons: region restrictions?, invalid link?)\n *Note: This issue might be exclusive to spotify, if this item is available on another service, try there.*`);
                                    fs.rmSync(`${BOT_DOWNLOADS_FOLDER}/${uploadID}`, { recursive: true });
                                    return;
                                }
                                if (!err) {
                                    logger.info(stdout)
                                    zipAndUpload(ctx, uploadID, msg, BOT_DOWNLOADS_FOLDER, RCLONE_REMOTE, USE_INDEX, link, (drive_link) => {
                                        logger.info(drive_link)
                                        const embed = new MessageEmbed()
                                            .setColor(colors.info)
                                            .setTitle(`Download is finished`)
                                            .setDescription(`Your requested link, <${ctx.args[0]}>, is now available for download:`)
                                            .addField(`Download link`, drive_link)
                                        let uc = ctx.guild.channels.cache.find(channel => channel.id === UPLOAD_CHANNEL);
                                        let finished_msg = uc.send(embed);
                                        uc.send(`<@${author.id}>`);
                                        msg.edit(`${author}\nDone! You can find your link in <#${UPLOAD_CHANNEL}>`);
                                        ctx.message.react('✅');
                                        msg.react('✅');
                                    });
                                }
                            })
                        }
                    });

                }
            }
        }

    }

};