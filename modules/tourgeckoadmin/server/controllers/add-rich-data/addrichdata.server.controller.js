'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Theme = mongoose.model('Theme'),
  Activity = mongoose.model('Activity'),
  Language = mongoose.model('I18NLanguage'),
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

// Adding Languages
exports.saveLanguages = function (req, res) {
  
  Language.find().populate('').exec(function (err, savedLanguages) {
    if (err) {
      console.log('languages not added');
    } else {
      if (savedLanguages.length == 0) {
        Language.collection.insert(req.body, onInsert);
        function onInsert(err, languages) {
          if (err) {
            console.log('languages not added ' + err);
          } else {
            res.json(savedLanguages);
          }
        }savedLanguages
      } else {
        var index;
        for (index = 0; index < req.body.supportedLanguages.length; index++)
          savedLanguages[0].supportedLanguages.push(req.body.supportedLanguages[index]);
        

        savedLanguages[0].save();
        res.json(savedLanguages);
      }
    }
  });
};

