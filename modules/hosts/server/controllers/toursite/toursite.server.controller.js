
'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Product = mongoose.model('Product'),
  Company = mongoose.model('HostCompany'),
  multer = require('multer'),
  fs = require('fs'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Finding if toursite exists or not.
exports.getToursite = function (req, res) {
  var userId;
  if (req.user !== undefined)
    userId = req.user._id;
  var tourSite = req.query.toursite;
  if (userId === undefined) {
    Company.findOne({ toursite: tourSite, isToursiteInactive: false }, '-salt -password').sort('-created').populate('user').exec(function (err, company) {
      if (err) {
        res.status(500).render('modules/core/server/views/500', {
          error: 'Oops! Something went wrong...'
        });
      }
      res.json(company);
    });
  } else {
    if (req.user) {
      Company.findOne({ user: req.user._id }, '-salt -password').sort('-created').populate('user').exec(function (err, company) {
        if (err) {
          res.status(500).render('modules/core/server/views/500', {
            error: 'Oops! Something went wrong...'
          });
        }
        res.json(company);
      });
    }
  }
};

// Fetch toursite data i.e. data of the toursite for a specific user.
exports.getToursiteData = function (req, res) {
  var tourSite = req.params.toursite;

  Company.findOne({ toursite: tourSite }, '-salt -password').exec(function (err, company) {
    if (err) {
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
      });
    }
    Product.count({user: company.user, isPublished: true}, function(error, count){
      Product.find({user: company.user, isPublished: true}).limit(10).sort('-created').populate('user').exec(function (err, products) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json({productArray: products, productCount: count, companyData: company});
      });
    });
  });
};


// Fetch toursite data i.e. data of the toursite for a specific user.
exports.getToursiteDataForCurrentPage = function (req, res) {
  var tourSite = req.params.toursite;
  var pageNumber = req.params.pageNumber;
  var itemsPerPage = req.params.itemsPerPage;
  
  Company.findOne({ toursite: tourSite }, '-salt -password').exec(function (err, company) {
    if (err) {
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
      });
    }
    
    Product.find({hostCompany: company._id}).sort('-created').skip((pageNumber - 1) * itemsPerPage).limit(itemsPerPage).populate('user').populate('hostCompany').exec(function (err, products) {
      if (err) {
        console.log('the error is ' + err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json({productArray: products, companyData: company});
    });
  });
};

exports.uploadToursiteBanners = function (req, res) {
  var upload = multer(config.uploads.toursiteBannersUploads).array('toursiteBanners');
  var newUUID = '';
  var size = '';
  var name = '';
  var user = req.user;
  if (user) {
    uploadBanners()
      .then(onUploadSuccess)
      .catch(function (err) {
        res.json(err);
      });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }

  function uploadBanners () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          // Send error code as we are customising the error messages.
          // reject(errorHandler.getErrorMessage(uploadError));
          reject(uploadError.code);
        } else {
          Company.findOne({ user: user._id }).exec(function (err, company) {
            if (err) {
              res.status(500).render('modules/core/server/views/500', {
                error: 'Oops! Something went wrong...'
              });
            }
            var tempFileObject = {url: config.uploads.toursiteBannersUploads.dest + req.files[0].filename, size: req.files[0].size, name: req.files[0].originalname}
            company.toursiteBanners.push(tempFileObject);
            company.save();
          });
          newUUID = req.files[0].filename;
          resolve();
        }
      });
    });
  }
  function onUploadSuccess () {
    res.json({success: true, newUuid: newUUID});
    return true;
  }
}

exports.deleteToursiteBanners = function (req, res) {
  var url = config.uploads.toursiteBannersUploads.dest + req.body.qquuid;
  Company.findOne({ user: req.user._id }).exec(function (err, company) {
    if (err) {
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
      });
    }
    var filesObjectArray =  company.toursiteBanners;
    var deleteIndex = -1;
    for(var index = 0; index < filesObjectArray.length; index++) {
      if (filesObjectArray[index].url == url) {
        deleteIndex = index;
        break;
      }
    }
    filesObjectArray.splice(deleteIndex, 1);
    company.toursiteBanners = filesObjectArray;
   
    company.save(function () {
      fs.unlink(config.uploads.toursiteBannersUploads.dest + req.body.qquuid)
      res.json({success: true, deletedUuid: req.body.qquuid});
    });
  });
}

exports.getUploadedBannersForTheToursite = function (req, res) {
  console.log('fetching ' + req.user._id);
  Company.findOne({ user: req.user._id }).exec(function (err, company) {
    if (err) {
      console.log('fetching the error' + err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    var previouslyUploadedBanners = [];
    var previouslyUploadedBannersTemp = company.toursiteBanners;
    for (var index = 0; index < previouslyUploadedBannersTemp.length; index ++) {
      var tempFilePath = previouslyUploadedBannersTemp[index].url.split('/');
      var tempFile = {uuid: tempFilePath[tempFilePath.length - 1], name: previouslyUploadedBannersTemp[index].name, thumbnailUrl:  previouslyUploadedBannersTemp[index].url, size: previouslyUploadedBannersTemp[index].size};
      previouslyUploadedBanners.push(tempFile);
    }
    res.json(previouslyUploadedBanners);
  });
}