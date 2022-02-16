const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    async detect(link, callback) {
        switch (true) {
            case link.includes("tidal"):
                if (link.includes("artist") || link.includes("playlist")) {
                    return callback(true);
                } else {
                    return callback(false)
                }
                break;
            case link.includes("www.qobuz.com"):
                axios.get(link).then(response => {
                    const $ = cheerio.load(response.data);
                    if ($('body').attr('context') == "artist" || $('body').attr('context') == "playlist_show") {
                        return callback(true);
                    } else {
                        return callback(false);
                    }
                })
                break;
            case link.includes("play.qobuz.com") || link.includes("open.qobuz.com"):
                if (link.includes("artist") || link.includes("playlist")) {
                    return callback(true);
                } else {
                    return callback(false)
                }
                break;
            case link.includes("deezer.com"):
                let cleaned_link = link.split("#")[0];
                if (cleaned_link.includes("artist") || cleaned_link.includes("playlist")) {
                    return callback(true);
                } else {
                    return callback(false)
                }
                break;
            case link.includes("soundcloud.com"):
                let splitArr = link.split("/");
                if (splitArr.length > 5) {
                    return callback(true);
                }
                if (splitArr.length < 5) {
                    return callback(true);
                }
                if (splitArr.length == 5) {
                    return callback(false);
                }
                break;
            case link.includes("spotify.com"):
                if (link.includes("artist") || link.includes("playlist")) {
                    return callback(true);
                } else {
                    return callback(false)
                }
                break;


        }

    }
}