'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  config = require(path.resolve('./config/config')),
  Twitter = require('twitter'),
  FB = require('fb'),
  Bitly = require('bitly'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


// Shorten the URL
exports.shortenTheURL = function (req, res) {
  var bitly = new Bitly(config.bitly.accessToken);
  bitly.shorten(req.query.longURL)
    .then(function(response) {
      var short_url = response.data.url;
      res.json(short_url);
      // Do something with data 
    }, function(error) {
      throw error;
    });
};

// Get FB Pages
exports.getFBPages = function (req, res) {
  if (!req.user.additionalProvidersData) {
    res.json('not connected');
  } else {
    FB.setAccessToken(req.user.additionalProvidersData.facebook.accessToken);
    FB.api('me/accounts', 'get', function (res) {
      if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
      }
      console.log('Post Id: ' + JSON.stringify(res));
    });
  }
}

// Post on Twitter
/* exports.postOnTwitter = function (req, res) {
  var output = "";
  var pathToScript = path.resolve('./scripts/socialPosts.py');
  console.log('path is ' +pathToScript);
  var python = require('child_process').spawn (
    'python',
    // second argument is array of parameters, e.g.:
    [ pathToScript
    , 'twitter'
    , JSON.stringify(req.body.productTitle)
    , JSON.stringify(req.body.destination)
    , JSON.stringify(req.body.productSummary)
    ]
  );
  python.stdout.on('data', function(data) {
    output += data
  });

  python.on('close', function(code) {
    if (code !== 0) {
      console.log('error');
      // return res.send(500, code);
    } else {
      var client = new Twitter({
        consumer_key: config.twitter.clientID,
        consumer_secret: config.twitter.clientSecret,
        access_token_key: req.user.additionalProvidersData.twitter.token,
        access_token_secret: req.user.additionalProvidersData.twitter.tokenSecret
      });

      client.post('statuses/update', {status: output}, function(error, tweet, response) {
        if (!error) {
          // Do nothing
        } else {
          res.json(error);
        }
      });
    }
  });
};*/

// Post on Twitter
//exports.postOnFB = function (req, res) {
  // FB.setAccessToken('EAAKE8WbyqA4BAA91U1a2ZCZA1vbcWKXVlTyhTL0ZAZCfDLZAEwWk8a7WNcKctfF2fOLq6hWHFXOwCdBkq7n7YO9tcXtNKsaFG6diI1WTMiABsEVas5Cg7PQxXROOnpbg472lOqZAMVwUx9vNZAUNJQwWhPKdkgVFWgZD');
  // FB.setAccessToken('EAAKE8WbyqA4BAFCYKZBCrZAwiOrZBlKvMgJSQp9xg7z3AaJEQN38xQoGtPdmzgSR0NvxLAukv1KvBsFUZBjw3Ai3aenWT2YoUIRkOZCarwXursy7AqtDoR7OWk1ZCPR4ZCECFZAcsUT685Yles6UOKGXa6zduxeb6KcZD');
  // FB.setAccessToken('EAAKE8WbyqA4BAGUy3r2UCrvt8tMIudOZBYchZB3v21vlYUFknmtT5tDStoRVHR74jqpGTZADQ7I50yDp7Fwzvur5AQas0HDboZB2OQdqgkZCosr28ZCQUxQQ1ILY2tDnNHdoh4yNZAzZBN3JUXbhBndeSeZAggW2viH8ZD');
  /* FB.api('/me/permissions', function (response) {
    if(!response || response.error) {
      res.json(response.error);
      return;
    }
    // var pageID = response.data[0].id;
    // console.log('id is ' + pageID);
    console.log('response: ' + JSON.stringify(response));
  });

  /* FB.api('/338587136484805?fields=access_token', function (responding) {
      if(!responding || responding.error) {
        console.log(responding.error);
        res.json(responding.error);
        return;
      }
      console.log('responding: ' + JSON.stringify(responding));
    }); 
}; */
