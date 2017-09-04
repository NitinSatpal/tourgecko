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
  Pinboard = mongoose.model('PinboardPins'),
  Language = mongoose.model('I18NLanguage'),
  InstamojoUser = mongoose.model('InstamojoUsers'),
  config = require(path.resolve('./config/config')),
  ModifyPinboard = require(path.resolve('./modules/hosts/server/controllers/pinboard/modifyPinboardForParticularUser.server.controller')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/* Payment gateway account signup */
var Insta = require('instamojo-nodejs');
Insta.setKeys(config.paymentGateWayInstamojo.instamojoKey, config.paymentGateWayInstamojo.instamojoSecret);

// This line will be removed later. Setting sandbox mode for now
// Insta.isSandboxMode(true);

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
      company.companyGSTIN = changedCompanyDetails.companyGSTIN;
      company.noGSTIN = changedCompanyDetails.noGSTIN;
      if (company.aboutHost != '' && company.aboutHost != null && company.aboutHost !== undefined) {
        ModifyPinboard.modifyPinboardGoalsForThisUser('completionOfAccountSetupAndLaunch', 'aboutHostAndLogo', company._id);
      }

      company.establishedIn = changedCompanyDetails.establishedIn;
      company.logoURL = changedCompanyDetails.logoURL;
      company.inquiryTime = changedCompanyDetails.inquiryTime;
      company.hostCompanyAddress = changedCompanyDetails.hostCompanyAddress;
      //company.isLogoPresent = changedCompanyDetails.isLogoPresent;
      if (company.logoURL === undefined || company.logoURL == '')
        company.logoURL = 'modules/hosts/client/companyLogo/default/logo.png';
      company.markModified('hostCompanyAddress');
      company.save(function (err, response) {
        if (err) {
          // error
        } else {
        }
      });
      res.json(company);
    });
  }
};

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
      if (!company.areSocialAccountsPresent || company.hostSocialAccounts || company.blogLink !== "")
        ModifyPinboard.modifyPinboardGoalsForThisUser('completionOfAccountSetupAndLaunch', 'socialProfiles', company._id);
      company.save(function (err, response) {
        if (err) {
          // error
        } else {
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
    var user = req.user;
    /* Get data for app based authentication */
    var data = new Insta.ApplicationBasedAuthenticationData();
    data.client_id = config.paymentGateWayInstamojo.instamojoKey;
    data.client_secret = config.paymentGateWayInstamojo.instamojoSecret;
    // App based authentication to get access token
    Insta.getAuthenticationAccessToken(data, function(appTokenError, appTokenResponse) {
      if (appTokenError) {
        errors.push('Something went wrong while creating the user details. Please contact tourgecko support');
        res.json({messages: errors, status: 'failure'});
      } else {
        // Use app based authentication token to create the user. First set the token in the header and then call the signup api
        Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                      config.paymentGateWayInstamojo.instamojoSecret,
                      'Bearer' + ' ' + appTokenResponse.access_token);
        // Set data for the user to be created on instamojo
        var email = Math.random().toString(36).substring(7) + '_instamojo@tourgecko.com';
        var password = config.paymentGateWayInstamojo.userPwdCommonPrefix + Math.random().toString(36).substring(7);
        var signupData = {
            'email': email,
            'password': password,
            'phone': user.mobile,
            'referrer': config.paymentGateWayInstamojo.referer
        }
        // Create the user by calling the api
        Insta.onBoardHost(signupData, function(signupError, signupResponse) {
          if (signupError) {
            errors.push('Something went wrong while creating the user details. Please contact tourgecko support');
            res.json({messages: errors, status: 'failure'});
          } else {
            // Get and set data for user based authentication
            var userDetails = Insta.UserBasedAuthenticationData();
            userDetails.client_id = config.paymentGateWayInstamojo.instamojoKey;
            userDetails.client_secret = config.paymentGateWayInstamojo.instamojoSecret;
            userDetails.username = signupResponse.email;
            userDetails.password = password;

            // User based authentication to get access token
            Insta.getAuthenticationAccessToken(userDetails, function(userTokenError, userTokenResponse) {
              if (userTokenError) {
                errors.push('Something went wrong while editing the user details. Please contact tourgecko support');
                res.json({messages: errors, status: 'failure'});
              } else {
                // Use user based authentication token to edit the user. First set the token in the header and then call the edit api
                Insta.setToken(config.paymentGateWayInstamojo.instamojoKey,
                              config.paymentGateWayInstamojo.instamojoSecret,
                              'Bearer' + ' ' + userTokenResponse.access_token);

                 // Set data for the user to be edited on instamojo
                var editHostData = {
                  'first_name' : user.firstName,
                  'last_name' : user.lastName,
                  'is_email_verified' : true,
                  'is_phone_verified' : true,
                  'location' : otherChangedPaymentDetails.hostCompanyAddress.city,
                  'public_phone' : user.mobile,
                  'public_email' : user.email,
                  'public_website' : otherChangedPaymentDetails.companyWebsite,
                  'referrer': config.paymentGateWayInstamojo.referer
                }

                // Edit the user by calling the api
                Insta.editOnBoardedHostDetails(editHostData, signupResponse.id, function(editHostError, editHostResponse) {
                  if (editHostError) {
                    errors.push('Something went wrong while editing the user details. Please contact tourgecko support');
                    res.json({messages: errors, status: 'failure'});
                  } else {
                    var instaUser = new InstamojoUser();
                    instaUser.instamojo_password = password;
                    instaUser.user = user._id;
                    instaUser.hostCompany = otherChangedPaymentDetails._id;
                    var commonPrefix = 'instamojo_';
                    for (var key in editHostResponse) {
                      if (editHostResponse.hasOwnProperty(key)) {
                        var val = editHostResponse[key];
                        instaUser[commonPrefix + key] = val;
                      }
                    }
                    instaUser.save(function() {
                      var userDetails = Insta.UserBasedAuthenticationData();
                      userDetails.client_id = config.paymentGateWayInstamojo.instamojoKey;
                      userDetails.client_secret = config.paymentGateWayInstamojo.instamojoSecret;
                      userDetails.username = instaUser.instamojo_email;
                      userDetails.password = instaUser.instamojo_password;
                      var errors = [];
                      var response;
                      Insta.getAuthenticationAccessToken(userDetails, function(userTokenError, userTokenResponse) {
                        if (userTokenError) {
                          errors.push('Something went wrong while saving bank details. Please contact tourgecko support');
                          res.json({messages: errors, status: 'failure'});
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
                            if (editHostError) {
                              for (var key in editHostError) {
                                var error = key + ': ' + editHostError[key];
                                errors.push(error);
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
                                instaUser.save(function (error, response) {
                                  if (error) {
                                    errors.push('Something went wrong while saving user details. Please contact tourgecko support');
                                    res.json({messages: errors, status: 'failure'});
                                  }
                                });
                                Company.findOne({user: req.user._id}).exec(function (error, company) {
                                  if (error) {
                                    errors.push('Something went wrong while saving the company details. Please contact tourgecko support');
                                    res.json({messages: errors, status: 'failure'});
                                  }
                                  company.hostBankAccountDetails.beneficiaryName = otherChangedPaymentDetails.hostBankAccountDetails.beneficiaryName;
                                  company.hostBankAccountDetails.beneficiaryAccNumber = otherChangedPaymentDetails.hostBankAccountDetails.beneficiaryAccNumber;
                                  company.hostBankAccountDetails.beneficiaryBankIFSCcode = otherChangedPaymentDetails.hostBankAccountDetails.beneficiaryBankIFSCcode;
                                  company.hostBankAccountDetails.beneficiaryBankCountry = changedPaymentDetailsCountry;
                                  company.hostBankAccountDetails.permanentAccountNumber = otherChangedPaymentDetails.hostBankAccountDetails.permanentAccountNumber;
                                  company.passConvenienceFee = otherChangedPaymentDetails.passConvenienceFee;
                                  company.paymentActivated = true;
                                  company.paymentGateway = otherChangedPaymentDetails.paymentGateway;
                                  company.markModified('hostBankAccountDetails');
                                  company.save(function (error, response) {
                                    if (error) {
                                      errors.push('Something went wrong while saving the company details. Please contact tourgecko support');
                                      res.json({messages: errors, status: 'failure'});
                                    }
                                    ModifyPinboard.modifyPinboardGoalsForThisUser('completionOfAccountSetupAndLaunch', 'activatePayment', company._id);
                                    res.json({messages: editHostResponse, status: 'success'});
                                  });
                                });
                              } else {
                                for (var key in editHostResponse) {
                                  var error = key + ': ' + editHostResponse[key];
                                  errors.push(error);
                                }
                                res.json({messages: errors, status: 'failure'});
                              }
                            }
                          });
                        }
                      });
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
};

exports.saveCanBeEditedPaymentDetails = function (req, res) {
  var otherChangedPaymentDetails = req.body;
  Company.findOne({user: req.user._id}).exec(function (error, company) {
    if (error) {
      errors.push('Something went wrong while saving the edited details. Please contact tourgecko support');
      res.json({messages: errors, status: 'failure'});
    }
    company.passConvenienceFee = otherChangedPaymentDetails[0].passConvenienceFee;
    company.save(function (error, response) {
      if (error) {
        errors.push('Something went wrong while saving the edited details. Please contact tourgecko support');
        res.json({messages: errors, status: 'failure'});
      }
      res.json({messages: company, status: 'success'});
    });
  });
}

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

// Save toursite theme details
exports.setTheToursiteTeme = function (req, res) {
  var themeColor = req.body.themeColor;
  if (req.user) {
    Company.findOne({user: req.user._id}).exec(function (err, company) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      var oldThemeColor = company.themeColor;
      company.themeColor = themeColor;
      company.save(function () {
        fs.readFile(path.resolve('./modules/core/client/css/themes.css'), 'utf8', function (err, data) {
          if (err) {
            return console.log(err);
          }

          var stringToBeReplaced = '.'+ company.toursite + ' .themeSelectedByHostColor { color : ' + oldThemeColor + ' !important;}' + '\n' +
                                   '.'+ company.toursite + ' .themeSelectedByHostBackgroundColor { background-color : ' + oldThemeColor + ' !important;}' + '\n' +
                                   '.'+ company.toursite + ' .themeSelectedByHostBorderColor::before { border: 2px solid ' + oldThemeColor + ' !important;}' + '\n' +
                                   '.'+ company.toursite + ' .themeSelectedByHostBorderColorLeft { border-left: 2px solid ' + oldThemeColor + ' !important;}' + '\n';
          
          var replacingString =  '.'+ company.toursite + ' .themeSelectedByHostColor { color : ' + themeColor + ' !important;}' + '\n' +
                                 '.'+ company.toursite + ' .themeSelectedByHostBackgroundColor { background-color : ' + themeColor + ' !important;}' + '\n' +
                                 '.'+ company.toursite + ' .themeSelectedByHostBorderColor::before { border: 2px solid ' + themeColor + ' !important;}' + '\n' +
                                 '.'+ company.toursite + ' .themeSelectedByHostBorderColorLeft { border-left: 2px solid ' + themeColor + ' !important;}' + '\n';

          var result = data.replace(stringToBeReplaced, replacingString);

          fs.writeFile(path.resolve('./modules/core/client/css/themes.css'), result, 'utf8', function (err) {
             if (err) return console.log(err);
          });
        });
      });
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

// save regional details
exports.uploadHostAddressProof = function (req, res) {
  var upload = multer(config.uploads.hostCompanyAddressProofUploads).array('addressProof');
  var user = req.user;
  var addressProofURL = '';
  if (user) {
    uploadAddressProof()
      .then(onUploadSuccess)
      .catch(function (err) {
        res.json(err);
      });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }

  function uploadAddressProof () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          // Send error code as we are customising the error messages.
          // reject(errorHandler.getErrorMessage(uploadError));
          reject(uploadError.code);
        } else {
          addressProofURL = req.files[0].path;
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
      company.addressProofURL = addressProofURL;
      company.save(function () {
        res.json({success: true, url: addressProofURL});
      });
    });
    return true;
  }
};

// save regional details
exports.uploadHostPanProof = function (req, res) {
  var upload = multer(config.uploads.hostCompanyPanProofUploads).array('panProof');
  var user = req.user;
  var panProofURL = '';
  if (user) {
    uploadPanProof()
      .then(onUploadSuccess)
      .catch(function (err) {
        res.json(err);
      });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }

  function uploadPanProof () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          // Send error code as we are customising the error messages.
          // reject(errorHandler.getErrorMessage(uploadError));
          reject(uploadError.code);
        } else {
          panProofURL = req.files[0].path;
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
      company.panProofURL = panProofURL;
      company.save();
    });
    res.json({success: true, url: panProofURL});
    return true;
  }
};
