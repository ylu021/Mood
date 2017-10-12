require('dotenv').config();
const express = require('express');
const app = express();
const request = require('request');
const path = require('path');
let token = '';

const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

app.get('/', function(req, res) {
  getToken().then(function(data) {
    token = data.access_token;
    res.sendFile(path.join(__dirname+'/docs/index.html'));
  });
});

app.post('/search', function(req, res) {
  // get search query
  const query = req.query['q'];

  // logic
  searchPlaylist(query).then(function(data) {
    console.log(data);
    if(data) {
      console.log(data);
      res.status(200).send(data);
    }
  });
});

function searchPlaylist(query) {
  return new Promise(function(resolve, reject) {
    var options = {
      url: `https://api.spotify.com/v1/search?q=${query}&type=playlist`,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true
    };
    request.get(options, function(error, response, body) {
      if(!error) {
          console.log('success');
          const items = body['playlists']['items'];

          if(items && items.length > 0) {
            // have result
            const idx = Math.floor(Math.random() * (items.length - 1));
            const playlistId = items[idx]['id'];
            const playlistOwner = items[idx]['owner']['id'];
            console.log('success2', playlistId);
            resolve({id: playlistId, owner: playlistOwner});
          } else {
            // no playlist result search for type=track
          }
      }
    });
  });
}

function getToken() {
    return new Promise(function(resolve, reject) {
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          // use the access token to access the Spotify Web API
          resolve(body);

          // var options = {
          //   url: 'https://api.spotify.com/v1/users/jmperezperez',
          //   headers: {
          //     'Authorization': 'Bearer ' + token
          //   },
          //   json: true
          // };
          // request.get(options, function(error, response, body) {
          //   console.log(body);
          // });
        }
      });
    })
}

app.use(express.static(__dirname + '/docs')); //__dir and not _dir
const port = 8000; // you can use any port
app.listen(port);
console.log('server on' + port);
