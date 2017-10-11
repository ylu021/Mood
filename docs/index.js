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

      //Add a callback to notify when the detector is initialized and ready for runing.
      detector.addEventListener("onInitializeSuccess", function() {
        log('#logs', "The detector reports initialized");
        //Display canvas instead of video feed because we want to draw the feature points on it
        $("#affdex_elements").css("display", "none");
        $("#face_video").css("display", "none");
      });

      function log(node_name, msg) {
        $(node_name).append("<span>" + msg + "</span><br />")
      }

      //function executes when Start button is pushed.
      function onStart() {
        if (detector && !detector.isRunning) {
          $("#logs").html("");
          detector.start();
        }
        log('#logs', "Clicked the start button");
      }

      //function executes when the Stop button is pushed.
      function onStop() {
        log('#logs', "Clicked the stop button");
        if (detector && detector.isRunning) {
          detector.removeEventListener();
          detector.stop();
        }
      };

      //function executes when the Reset button is pushed.
      function onReset() {
        log('#logs', "Clicked the reset button");
        if (detector && detector.isRunning) {
          detector.reset();

          $('#results').html("");
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
        $('#results').html("");
        // log('#results', "Timestamp: " + timestamp.toFixed(2));
        // log('#results', "Number of faces found: " + faces.length);
        if (faces.length > 0) {
          // log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
   				 log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
           	return val.toFixed ? Number(val.toFixed(0)) : val;
           }));
          let engagement = faces[0].emotions['engagement'];
          let valence = faces[0].emotions['valence'];
          delete faces[0].emotions['engagement'];
          delete faces[0].emotions['valence'];
          let emotion = Object.keys(faces[0].emotions).reduce((a, b) => {						
          	return faces[0].emotions[a] > faces[0].emotions[b] ? a : b;
          });
          
          if(valence < 10 || engagement < 10 ) {
          	if(faces[0].emotions['surprise'] >= 0 && faces[0].emotions['surprise'] < 10) {
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
          
          // sadness detector
          if(faces[0].expressions['chinRaise'] !== 0 && faces[0].expressions['lipPucker'] !== 0) {
              	emotion = 'sadness';
              }
          log('#results', "Emotions: " + emotion);
          log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
          drawFeaturePoints(image, faces[0].featurePoints);
          if(emotion) {
          	detector.stop();
            alert(emotion);
            // if disgust play hiphop
            // if sad play ballad
            // if neutral play cheer up
            // if anger play rock
            // if happy play happy
          } else {
          	$('#results').html("Face loading..");
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

