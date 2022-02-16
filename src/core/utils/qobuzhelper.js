const cheerio = require('cheerio');
const axios = require('axios');

module.exports = {
    async findq(link, callback) {
        axios.get(link).then(response => {
            const $ = cheerio.load(response.data);
            try {
                const title = $('.album-meta__title').text();
                const artist = $('.album-meta__artist').text();
                const res = axios.get(`https://www.qobuz.com/api.json/0.2/catalog/search`, {
                    headers: {
                        'X-App-Id': '', // qobuz X-App-Id Header
                        'X-User-Auth-Token': '', //qobuz X-User-Auth-Token Header
                    },
                    params: { query: `${title} ${artist}`, offset: '0', limit: '10' },
                }).then(res => {
                    let albums = res.data.albums.items;
                    albums.forEach(album => {
                        if (album.title == title && album.artist.name == artist) {
                            let album_id = album.id;
                            let url = `https://play.qobuz.com/album/${album_id}`
                            return callback(url);
                        } else {
                            return callback(link)
                        }
                    })
                })
            } catch (err) {
                return err;
            }

        })



    }
}