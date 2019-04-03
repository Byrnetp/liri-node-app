'use strict';
require('dotenv').config();
const keys = require('./keys.js');
const request = require('request');
const Spotify = require('node-spotify-api');
const moment = require('moment');
const fs = require('fs');

let command = process.argv[2];
let option = process.argv[3];

// do-what-it-says command
if (command == 'do-what-it-says') {
    let fileCommand = fs.readFileSync('./random.txt', 'utf8').split(' ');
    command = fileCommand[0];
    option = '';
    for (let i = 1; i < fileCommand.length; i++) {
        option = option.concat(fileCommand[i] + ' ');
    }
}

// taking the spaces out of the song/movie/artist names as they will be used inside URLs
if (option) {
    for (let i = 0; i < option.length; i++) {
        if (option[i] === ' ') {
            option = option.slice(0,i) + '%20' + option.slice(i + 1, option.length);
        }
    }
}

const spotify = new Spotify(keys.spotify);

// switch which contains commands for LIRI as cases
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
                console.log(`Song: ${response.tracks.items[0].name} \n`
                    + `Artist(s): ${artistList} \n`
                    + `Album: ${response.tracks.items[0].album.name} \n`
                    + `Preview Link: ${response.tracks.items[0].preview_url}`);
            })
            .catch((err) => {
                console.log(err);
            });
        break;

    case 'movie-this':
        const OMDbUrl = `http://www.omdbapi.com/?apikey=${process.env.OMDb_key}&t=${option || 'Mr.%20Nobody'}`;
        const OMDbPromise = new Promise((resolve, reject) => {
            request.get(OMDbUrl, (err, res, body) => {
                if (err) {
                    reject(`Error: ${err}`);
                    return;
                }
                if (res.statusCode !== 200) {
                    reject(`Error: ${JSON.parse(body)}`);
                    return;
                }
                resolve(JSON.parse(body));
            });
        });

        OMDbPromise.then((body) => {
            console.log(`Title: ${body.Title} \n`
                + `Released: ${body.Year}\n`
                + `IMDB Rating: ${body.imdbRating}\n`
                + `Rotten Tomatoes rating: ${body.Ratings[1].Value}\n`
                + `Produced in: ${body.Country}\n`
                + `Language: ${body.Language}\n`
                + `Actors/Actresses: ${body.Actors}\n`
                + `Plot: ${body.Plot}`);
        });
        OMDbPromise.catch((err) => console.log(err));

        break;

        case 'concert-this':
        const bandsUrl = `https://rest.bandsintown.com/artists/${option || 'Coldplay'}/events?app_id=${process.env.bandsintown_id}`;
        const bandsPromise = new Promise((resolve, reject) => {
            request.get(bandsUrl, (err, res, body) => {
                if (err) {
                    reject(`Error: ${err}`);
                    return;
                }
                if (res.statusCode !== 200) {
                    reject(`Error: ${body}`);
                    return;
                }
                
                resolve(JSON.parse(body));
            });
        });

        bandsPromise.then((body) => {
            if (body.length === 0) {
                console.log('Sorry, no upcoming concerts found.');
            } else {console.log(`Location: ${body[0].venue.city}, ${body[0].venue.region} ${body[0].venue.country}\n`
            + `Venue name: ${body[0].venue.name}\n`
            + `Time: ${moment(body[0].datetime).format('MM/DD/YYYY')}`);
            }
        });
        bandsPromise.catch((err) => console.log(err));

        break;

    default:
        console.log('LIRI commands: \n\n'
            + 'spotify-this-song "<song name>" -- returns song name, artist(s), album, and a preview link from Spotify\n\n'
            + 'movie-this "<movie name>" -- returns title, release year, IMDB rating, Rotten Tomatoes rating, country of origin, language, plot, and actors in the movie from OMDb\n\n'
            + 'concert-this "<artist name>" -- searches for an upcoming concert for a given artist and returns the name of the venue, the venue location, and the date of the show\n\n'
            + 'do-what-it-says -- reads the command written in random.txt and runs said command')
}