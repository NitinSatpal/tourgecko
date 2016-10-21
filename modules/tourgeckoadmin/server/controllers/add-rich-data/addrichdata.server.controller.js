'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Theme = mongoose.model('Theme'),
  Activity = mongoose.model('Activity'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Adding themes.
exports.saveThemes = function (req, res) {

  Theme.collection.insert(req.body, onInsert);

  function onInsert(err, themes) {
    if (err) {
      console.log('themes not added');
    } else {
      res.json(themes);
    }
  }
};

// Adding activities
exports.saveActivities = function (req, res) {

  Activity.collection.insert(req.body, onInsert);

  function onInsert(err, activities) {
    if (err) {
      console.log('activities not added');
    } else {
      res.json(activities);
    }
  }
};

