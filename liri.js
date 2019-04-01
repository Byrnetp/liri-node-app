'use strict';
const dotenv = require('dotenv').config();
const keys = require('./keys.js');
const request = require('request');
const Spotify = require('node-spotify-api');
const moment = require('moment');
const fs = require('fs');

const command = process.argv[2];
const option = process.argv[3];

const spotify = new Spotify(keys.spotify);

switch (command) {
    case 'spotify-this-song':
        spotify
            .search({ type: 'track', query: option || 'The Sign' })
            .then((response) => {
                const artists = response.tracks.items[0].artists;
                let artistList = `${artists[0].name}`;
                for (let i = 1; i < artists.length; i++) {
                    artistList += `, ${artists[i].name}`;
                }
                console.log(`Song: ${response.tracks.items[0].name} Artist(s): ${artistList} Album: ${response.tracks.items[0].album.name} Preview Link: ${response.tracks.items[0].preview_url}`);
            })
            .catch((err) => {
                console.log(err);
            });
        break;
    default:
        console.log('LIRI commands: \nconcert-this "<song name>" -- returns song name, artist(s), album, and a preview link from Spotify.')
}