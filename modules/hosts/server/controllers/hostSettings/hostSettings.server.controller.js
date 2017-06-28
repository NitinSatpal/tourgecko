'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  multer = require('multer'),
  Company = mongoose.model('HostCompany'),
  User = mongoose.model('User'),
  Pinboard = mongoose.model('Pinboard'),
  Language = mongoose.model('I18NLanguage'),
  InstamojoUser = mongoose.model('InstamojoUsers'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/* Payment gateway account signup */
var Insta = require('instamojo-nodejs');
Insta.setKeys(config.paymentGateWayInstamojo.instamojoKey, config.paymentGateWayInstamojo.instamojoSecret);

// This line will be removed later. Setting sandbox mode for now
Insta.isSandboxMode(true);

// Fetching user company details here. Though we will need specific users company details always. But we are fetching as an array.
// Later point of time we may need company details of all the users. We can use this same api for that.
exports.fetchCompanyDetails = function (req, res) {
  if(req.user) {
    Company.find({user: req.user._id}).populate('user').exec(function (err, companies) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(companies);
    });
  }
};

// Save company details
exports.saveCompanyDetails = function (req, res) {
  var changedCompanyDetails = req.body[0];
  if (req.user) {
    Company.findOne({user: req.user._id}).exec(function (err, company) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      company.hostType = changedCompanyDetails.hostType;
      company.companyName = changedCompanyDetails.companyName;
      company.aboutHost = changedCompanyDetails.aboutHost;
      company.establishedIn = changedCompanyDetails.establishedIn;
      company.logoURL = changedCompanyDetails.logoURL;
      company.inquiryTime = changedCompanyDetails.inquiryTime;
      company.hostCompanyAddress = changedCompanyDetails.hostCompanyAddress;
      company.isLogoPresent = changedCompanyDetails.isLogoPresent;
      if (company.logoURL === undefined || company.logoURL == '')
        company.logoURL = 'modules/hosts/client/companyLogo/default/logo.png';
      if (company.logoURL != 'modules/hosts/client/companyLogo/default/logo.png')
        company.isLogoPresent = true;
      else
        company.isLogoPresent = false;
      company.markModified('hostCompanyAddress');
      company.save(function (err, response) {
        if (err) {
          // error
        } else {
          editPinBoardPinsForThisHost(response, 'logoAndAboutUs');
        }
      });
      res.json(company);
    });
  }
};

function editPinBoardPinsForThisHost (company, code) {
  if (code == 'logoAndAboutUs') {
    if (company.aboutHost != '' && (company.logoURL != '' || company.isLogoPresent == false)) {
      Pinboard.findOneAndUpdate({ initialPinUniqueCode: code, todoCompletedBy: {$not: { $in: [company.user.toString()]}}}, {$push: {todoCompletedBy:  company.user.toString()}}).exec(function (err, pinboardData) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
      });
    }
  } else if (code == 'inquiryAndSocial') {
    if(company.hostSocialAccounts || company.blogLink !== "" || company.areSocialAccountsPresent == false)
    Pinboard.findOneAndUpdate({ initialPinUniqueCode: code, todoCompletedBy: {$not: { $in: [company.user.toString()]}}}, {$push: {todoCompletedBy:  company.user.toString()}}).exec(function (err, pinboardData) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
      });
  }
}

exports.uploadCompanyLogo = function (req, res) {
  var upload = multer(config.uploads.hostCompanyLogoUploads).array('newLogo');
  var user = req.user;
  var newLogoURL = '';
  var newUUID;
  if (user) {
    uploadImage()
      .then(onUploadSuccess)
      .catch(function (err) {
        res.json(err);
      });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }

  function uploadImage () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          // Send error code as we are customising the error messages.
          // reject(errorHandler.getErrorMessage(uploadError));
          reject(uploadError.code);
        } else {
          newLogoURL = req.files[0].path;
          newUUID = req.files[0].filename;
          resolve();
        }
      });
    });
  }

  function onUploadSuccess () {
    Company.findOne({user: req.user._id}).exec(function (err, company) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      if (company.logoURL != '' && company.logoURL != 'modules/hosts/client/companyLogo/default/logo.png') {
        var previousId = company.logoURL.split('/')[4];
        fs.unlink(config.uploads.hostCompanyLogoUploads.dest + previousId);
      }
      company.logoURL = newLogoURL;
      company.isLogoPresent = true;
      company.save();
    });
    res.json({success: true, url: newLogoURL, newUuid: newUUID});
    return true;
  }
};

//Save contact details
exports.saveContactDetails = function (req, res) {
  var changedContactDetails = req.body[0];
  if (req.user) {
    Company.findOne({user: req.user._id}).exec(function (err, company) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      company.notificationEmail = changedContactDetails.notificationEmail;
      company.notificationMobile = changedContactDetails.notificationMobile;
      company.inquiryEmail = changedContactDetails.inquiryEmail;
      company.inquiryMobile = changedContactDetails.inquiryMobile;
      company.inquiryTime = changedContactDetails.inquiryTime;
      company.hostSocialAccounts = changedContactDetails.hostSocialAccounts;
      company.areSocialAccountsPresent = changedContactDetails.areSocialAccountsPresent;
      if (company.hostSocialAccounts || company.blogLink !== "")
        company.areSocialAccountsPresent = true;
      company.markModified('hostSocialAccounts');
      company.save(function (err, response) {
        if (err) {
          // error
        } else {
          editPinBoardPinsForThisHost(response, 'inquiryAndSocial');
        }
      });
      res.json(company);
    });
  }
};



// Save payment details
exports.savePaymentDetails = function (req, res) {
  var otherChangedPaymentDetails = req.body.otherAccDetails[0];
  var changedPaymentDetailsCountry = req.body.accCountryDetails;
  if (req.user) {
    InstamojoUser.findOne({user: req.user._id}).exec(function (err, instaUser) {
      var userDetails = Insta.UserBasedAuthenticationData();
      userDetails.client_id = config.paymentGateWayInstamojo.clientId;
      userDetails.client_secret = config.paymentGateWayInstamojo.clientSecret;
      userDetails.username = instaUser.instamojo_email;
      userDetails.password = instaUser.instamojo_password;
      Insta.getAuthenticationAccessToken(userDetails, function(userTokenError, userTokenResponse) {
        if (userTokenError) {
          res.json({messages: ['Something went wrong in authentication'], status: 'failure'});
        } else {
          Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                        config.paymentGateWayInstamojo.instamojoSecret,
                        'Bearer' + ' ' + userTokenResponse.access_token);

          var instamojo_Bank_Account_Data = {
            account_holder_name: otherChangedPaymentDetails.hostBankAccountDetails.beneficiaryName,
            account_number: otherChangedPaymentDetails.hostBankAccountDetails.beneficiaryAccNumber,
            ifsc_code: otherChangedPaymentDetails.hostBankAccountDetails.beneficiaryBankIFSCcode
          };

          Insta.setOnBoardedHostBankDetails(instamojo_Bank_Account_Data, instaUser.instamojo_id, function(editHostError, editHostResponse) {
            var errors = [];
            if (editHostError) {
              for (var key in editHostError) {
                errors.push(errorHandler.getCustomErrorMessage(key, editHostError[key]));
              }
              res.json({messages: errors, status: 'failure'});
            } else {
              if (editHostResponse.user) {
                var commonPrefix = 'instamojo_';
                for (var key in editHostResponse) {
                  if (editHostResponse.hasOwnProperty(key)) {
                    var val = editHostResponse[key];
                    instaUser[commonPrefix + key] = val;
                  }
                }
                instaUser.save(function (err, res) {
                  if (err) {
                    errors.push('Something went wrong while saving the gateway user response');
                    res.json({messages: errors, status: 'failure'});
                  }

                });
                Company.findOne({user: req.user._id}).exec(function (err, company) {
                  if (err) {
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  }
                  company.hostBankAccountDetails.beneficiaryName = otherChangedPaymentDetails.hostBankAccountDetails.beneficiaryName;
                  company.hostBankAccountDetails.beneficiaryAccNumber = otherChangedPaymentDetails.hostBankAccountDetails.beneficiaryAccNumber;
                  company.hostBankAccountDetails.beneficiaryBankIFSCcode = otherChangedPaymentDetails.hostBankAccountDetails.beneficiaryBankIFSCcode;
                  company.hostBankAccountDetails.beneficiaryBankCountry = changedPaymentDetailsCountry;
                  company.markModified('hostBankAccountDetails');
                  company.save(function (err, res) {
                    if (err) {
                      errors.push('Something went wrong while saving the host company details');
                      res.json({messages: errors, status: 'failure'});
                    }
                  });
                });

                res.json({message: editHostResponse, status: 'success'});
              } else {
                for (var key in editHostResponse) {
                  errors.push(errorHandler.getCustomErrorMessage(key, editHostResponse[key]));
                }
                res.json({messages: errors, status: 'failure'});
              }
            }
          });
        }
      });
    });
  }
};

// Save toursite details
exports.saveToursiteDetails = function (req, res) {
  var changedToursiteDetails = req.body[0];
  if (req.user) {
    Company.findOne({user: req.user._id}).exec(function (err, company) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      company.toursite = changedToursiteDetails.toursite;
      company.isToursiteInactive = changedToursiteDetails.isToursiteInactive;
      company.companyWebsite = changedToursiteDetails.companyWebsite;
      company.save();
      res.json(company);
    });
  }
};

// Save account details
/* exports.saveAccountDetails = function (req, res) {
  console.log(req.user._id);
  var changedAccountDetails = req.body;

  User.findOne({_id: req.user._id}).exec(function (err, user) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    user.email = changedAccountDetails.email;
    user.mobile = changedAccountDetails.mobile;
    user.firstName = changedAccountDetails.firstName;
    user.lastName = changedAccountDetails.lastName;
    user.displayName = changedAccountDetails.firstName + ' ' + changedAccountDetails.lastName;
    user.save();
    res.json(user);
  });
}; */

// Get supported languages
exports.getSupportedLanguages = function (req, res) {
  
  Language.find().populate('').exec(function (err, languages) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(languages);
  });
};

// save regional details
exports.saveRegionalDetails = function (req, res) {
  var changedRegionalDetails = req.body[0];
  if (req.user) {
    Company.findOne({user: req.user._id}).exec(function (err, company) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      company.defaultLanguage = changedRegionalDetails.defaultLanguage;
      company.defaultCurrency = changedRegionalDetails.defaultCurrency;
      company.save();
      res.json(company);
    });
  }
};
