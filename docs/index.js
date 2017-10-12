      // SDK Needs to create video and canvas nodes in the DOM in order to function
      // Here we are adding those nodes a predefined div.
      var divRoot = $("#affdex_elements")[0];
      var width = 640;
      var height = 480;
      var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
      //Construct a CameraDetector and specify the image width / height and face detector mode.
      var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

      //Enable detection of all Expressions, Emotions and Emojis classifiers.
      detector.detectAllEmotions();
      detector.detectAllExpressions();
      detector.detectAllEmojis();
      $('#reset').hide();

      var token = '';

      //Add a callback to notify when the detector is initialized and ready for runing.
      detector.addEventListener("onInitializeSuccess", function() {
        log('#logs', "The detector reports initialized");
        // Display canvas instead of video feed because we want to draw the feature points on it
        $("#face_video").css("display", "none");
        // Obtaining an spotify token
        // obtainToken();
      });

      // function obtainToken() {
      //   console.log('obtaining token');
      //   let xhr = new XMLHttpRequest();
      //   xhr.open('POST', 'https://accounts.spotify.com/api/token', true);
      //   xhr.setRequestHeader('Allow', 'OPTIONS, POST');
      //   xhr.setRequestHeader('Authorization', `Basic ${client_id}:${client_secret}`); // imported crendentials
      //   xhr.setRequestHeader('Content-type', 'application/json');
      //   xhr.send('grant_type=client_credentials');
      //   xhr.onreadystatechange = function() {
      //     if (xhr.readyState == 4 && xhr.status == 200) {
      //       localStorage.setItem('access_token', xhr.responseText['access_token']);
      //     }else {
      //       console.log('Spotify API Authorization Error');
      //     }
      //   }
      // }
      //
      // function renewToken(done) {
      //   let xhr = new XMLHttpRequest();
      //   xhr.open('POST', 'https://accounts.spotify.com/api/token', true);
      //   xhr.setRequestHeader('Authorization', `Basic ${client_id}:${client_secret}`); // imported crendentials
      //   xhr.setRequestHeader('Content-type', 'application/json');
      //   xhr.send('grant_type=client_credentials');
      //   xhr.onreadystatechange = function() {
      //     if (xhr.readyState == 4 && xhr.status == 200) {
      //       done(null, xhr.responseText['access_token']);
      //     }else {
      //       done('Token cannot be renewed', null);
      //     }
      //   }
      // }

      function getDevice(done) {
        let xhr = new XMLHttpRequest();
        let token = localStorage.getItem('access_token');
        xhr.open('GET', 'https://api.spotify.com/v1/me/player/devices', true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
            done(null, xhr.responseText['devices'][0]['id']);
          }else {
            // TASK: retry
          }
        }
      }

      function searchPlaylist(keyword, done) {
        // console.log('searching playlist');
        let xhr = new XMLHttpRequest();
        xhr.open('POST', `/search`, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
            // got my search
            // console.log('got my search', xhr.responseText, typeof(xhr.responseText));
            const res = JSON.parse(xhr.responseText)
            done(null, JSON.parse(xhr.responseText));
            // const items = xhr.responseText['playlists']['items'];
            // if(items && items.length > 0) {
            //   // have result
            //   let idx = Math.floor(Math.random() * (items.length-1));
            //   let playlist = xhr.responseText['playlists']['items'][idx];
            //   const playlistId = playlist['id'];
            //   done(null, playlistId);
            // } else {
            //   // no playlist result search for type=track
            // }
          }
        }
        xhr.send({ q: keyword });
      }

      function devicePlay(playlistId, deviceId) {
        let xhr = new XMLHttpRequest();
        let token = localStorage.getItem('access_token');
        xhr.open('PUT', 'https://api.spotify.com/v1/me/player/play', true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(`context_uri=spotify:playlist:${playlistId}`);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
            done(null, xhr.responseText['devices'][0]['id']);
          }else {
            // TASK: retry
          }
        }
      }

      function log(node_name, msg) {
        //$(node_name).append("<span>" + msg + "</span><br />")
      }

      //function executes when Start button is pushed.
      function onStart() {
        if (detector && !detector.isRunning) {
          $("#logs").html("");
          $("#affdex_elements").css('visibility', 'hidden');
          $("#affdex_elements").css("display", "none");
          detector.start();
        }
        log('#logs', "Clicked the start button");
        displayLoading();
      }

      //function executes when the Stop button is pushed.
      function onStop() {
        log('#logs', "Clicked the stop button");
        if (detector && detector.isRunning) {
          detector.removeEventListener();
          detector.stop();
        }
      };

      function displayLoading() {
        $('#start').hide();
        $('#reset').hide();
        $('#emojis').html("<span>Reading your emotion <img src='https://loading.io/spinners/ellipsis/index.discuss-ellipsis-preloader.svg' /></span>");
      }

      //function executes when the Reset button is pushed.
      function onReset() {
        console.log('reset ', detector);
        log('#logs', "Clicked the reset button");
        if (detector) {
          detector.start();
          displayLoading();
          $('body').css('color', 'black');
          $('body').css('backgroundColor', 'white');
          $('.container-fluid').children().last().remove();
          $('#results').html("");
          $('#start').hide();
        }
      };

      //Add a callback to notify when camera access is allowed
      detector.addEventListener("onWebcamConnectSuccess", function() {
        log('#logs', "Webcam access allowed");
      });

      //Add a callback to notify when camera access is denied
      detector.addEventListener("onWebcamConnectFailure", function() {
        log('#logs', "webcam denied");
        console.log("Webcam access denied");
      });

      //Add a callback to notify when detector is stopped
      detector.addEventListener("onStopSuccess", function() {
        log('#logs', "The detector reports stopped");
        $("#results").html("");
      });

      //Add a callback to receive the results from processing an image.
      //The faces object contains the list of the faces detected in an image.
      //Faces object contains probabilities for all the different expressions, emotions and appearance metrics
      detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
        // $('#results').html("");
        // log('#results', "Timestamp: " + timestamp.toFixed(2));
        // log('#results', "Number of faces found: " + faces.length);
        if (faces.length > 0) {
          // log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
   				 log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
           	return val.toFixed ? Number(val.toFixed(0)) : val;
           }));
          let engagement = faces[0].emotions['engagement'];
          let valence = faces[0].emotions['valence'];
          let attention = faces[0].expressions['attention'];
          delete faces[0].emotions['engagement'];
          delete faces[0].emotions['valence'];
          let emotion = Object.keys(faces[0].emotions).reduce((a, b) => {
          	return faces[0].emotions[a] > faces[0].emotions[b] ? a : b;
          });

          if(valence == 0 || engagement == 0 ) {
            // if(emotion!=='joy' && faces[0].expressions['chinRaise'] !== 0 && faces[0].expressions['lipPucker'] !== 0) {
            //   emotion = 'sadness';
            // }
          	if(emotion!=='joy' && faces[0].emotions['surprise'] >= 0 && faces[0].emotions['surprise'] < 10) {
            	emotion = 'neutral';
            }
          } else {
          	if(valence < 0) {
              // negative emotions
              if(faces[0].expressions['innerBrowRaise'] !== 0 ||
                faces[0].expressions['lipCornerDepressor'] !== 0) {
                emotion = 'sadness';
              }
              else if(faces[0].expressions['lipPress'] !== 0 || faces[0].expressions['lipStretch'] !== 0 || faces[0].expressions['lipSuck'] !== 0) {
                emotion = 'sadness';
              }
          	}
          }
          console.log(emotion);

          log('#results', "Emotions: " + emotion);
          log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
          // drawFeaturePoints(image, faces[0].featurePoints);
          if(emotion) {
          	detector.stop();
            // alert(emotion);
            let bgcolor = 'white';
            let themecolor = 'black';
            let playlist = 'happy';
            switch(emotion) {
              case 'disgust':
                bgcolor = 'darkolivegreen';
                playlist = 'hiphop';
                themecolor = 'white';
                break;
              case 'sadness':
                bgcolor = 'midnightblue';
                playlist = 'ballad';
                themecolor = 'white';
                break;
              case 'neutral':
                bgcolor = 'seashell';
                playlist = 'cheerup';
                break;
              case 'anger':
                bgcolor = 'slategray';
                playlist = 'rock';
                break;
              case 'joy':
                bgcolor = 'lemonchiffon';
                playlist = 'happy';
                break;
            }

            // console.log(bgcolor, playlist);
            $('body').css('backgroundColor', bgcolor);
            $('body').css('color', themecolor);
            console.log(faces[0].emojis.dominantEmoji);
            $('#emojis').html(faces[0].emojis.dominantEmoji);
            if($('.container-fluid').children().last().attr('id') !== 'playlist'){
              searchPlaylist(playlist, function(err, data) {
                if(!err && data) {
                  // console.log('playlist found, data', data, typeof(data));
                  const link = `https://open.spotify.com/embed?uri=spotify:user:${data.owner}:playlist:${data.id}`;
                  // console.log(link);
                  $('.container-fluid').append(`
                    <div class="row justify-content-center" id="playlist"><iframe src="${link}" width="90%" height="50%" style="" frameborder="0" allowtransparency="true"></iframe></div>
                  `);
                  $('#reset').show();
                }
              });
            }
            // if disgust play hiphop
            // if sad play ballad
            // if neutral play cheer up
            // if anger play rock
            // if happy play happy
          }
        }
      });

      //Draw the detected facial feature points on the image
      function drawFeaturePoints(img, featurePoints) {
        var contxt = $('#face_video_canvas')[0].getContext('2d');

        var hRatio = contxt.canvas.width / img.width;
        var vRatio = contxt.canvas.height / img.height;
        var ratio = Math.min(hRatio, vRatio);

        contxt.strokeStyle = "#FFFFFF";
        for (var id in featurePoints) {
          contxt.beginPath();
          contxt.arc(featurePoints[id].x,
            featurePoints[id].y, 2, 0, 2 * Math.PI);
          contxt.stroke();

        }
      }
