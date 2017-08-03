'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  UserAdmin = mongoose.model('UserAdministration'),
  HostCompany = mongoose.model('HostCompany'),
  PinboardGoal = mongoose.model('PinboardGoals'),
  PinboardPin = mongoose.model('PinboardPins'),
  passport = require('passport'),
  nodemailer = require('nodemailer'),
  mg = require('nodemailer-mailgun-transport'),
  xoauth2 = require('xoauth2'),
  async = require('async'),
  crypto = require('crypto'),
  moment = require('moment'),
  ModifyPinboard = require(path.resolve('./modules/hosts/server/controllers/pinboard/modifyPinboardForParticularUser.server.controller')),
  momentTimezone = require('moment-timezone');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/guest/login',
  '/guest/signup'
];

var nodemailerMailgun = nodemailer.createTransport(mg(config.mailgun));
/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;
  // check if email already exists. If yes, then check different cases.
  User.findOne({email: req.body.signupData.email}).exec(function (alreadyExistedUserError, alreadyExistedUser) {
    // check if user is already active. If user is already active, the check the existing user's role and the requested user role.
    // If they are same, throw an error else create the account as in this case, either our already existed host is trying to be
    // the customer or already existed customer is trying to be host
    if (alreadyExistedUser) {
      if (alreadyExistedUser.isActive) {
        if ((alreadyExistedUser.userType == 'host' && req.body.toursite) || 
          (alreadyExistedUser.userType == 'customer') && !req.body.toursite) {
          return res.status(400).send({
            message: 'Account with this email already exists'
          });
        } else {
          // create the account
          createTheUserAccount(req, res);
        }
      } else if (alreadyExistedUser.verificationTokenExpires) {
          // If user is not acitve. Check if verification token expiry  is set. If the verification token expiry is set, then again check
          // for the user roles as mentioned in the above if comment and take the decision accordingly. In case the verification token
          // expiry is undefined, the user is for sure the host and user has completed the first step of signup and not the second
          // and trying to create the account again. So just edit the existed user,

          if ((alreadyExistedUser.userType == 'host' && req.body.toursite) || 
            (alreadyExistedUser.userType == 'customer') && !req.body.toursite) {
            // check do we need to re fire the verification mail or need to ask the user to click the already fired mail
            var timeNow = Date.now();
            if (timeNow >= alreadyExistedUser.verificationTokenExpires.getTime()) {
              // it means the verification token is expired. Fire the verification mail again.
              fireTheVerificationMail(req, res, alreadyExistedUser);
            } else {
              res.json('aliveVerificationMail');
            }
          } else {
            // create the account
            createTheUserAccount(req, res);
          }
      } else {
        // the present account is for sure of the host. Just check wehther the requested account is also for the host. If yes
        // edit the already present account else create the account
        if (req.body.toursite) {
          // edit the present account. Email will be same, but user may have changed the mobile, toursite and password
          HostCompany.findOne({user: alreadyExistedUser._id}).exec(function (theCompanyErr, theCompany) {
              if (theCompanyErr) {
                res.json('contactSupport');
              }
              if (theCompany == null) {
                var hostCompany = new HostCompany();
                hostCompany.user = alreadyExistedUser._id;
                //if (toursite)
                hostCompany.toursite = req.body.toursite;
                hostCompany.notificationEmail = alreadyExistedUser.email;
                hostCompany.notificationMobile = alreadyExistedUser.mobile;
                hostCompany.inquiryEmail = alreadyExistedUser.email;
                hostCompany.inquiryMobile = alreadyExistedUser.mobile;
                hostCompany.isAccountActive = false;
                hostCompany.isOwnerAccount = true;
                hostCompany.save(function (err) {
                  if(err) {
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    // Do nothing
                    alreadyExistedUser.mobile = req.body.signupData.mobile;
                    alreadyExistedUser.password = req.body.signupData.password;
                    alreadyExistedUser.company = hostCompany._id;
                    alreadyExistedUser.save(function (userEditError) {
                      if (userEditError) {
                        res.json('contactSupport');
                      }
                      res.json(alreadyExistedUser);
                    });
                  }
                });
              } else {
                theCompany.toursite = req.body.toursite;
                theCompany.notificationEmail = alreadyExistedUser.email;
                theCompany.notificationMobile = alreadyExistedUser.mobile;
                theCompany.inquiryEmail = alreadyExistedUser.email;
                theCompany.inquiryMobile = alreadyExistedUser.mobile;
                theCompany.isAccountActive = false;
                theCompany.isOwnerAccount = true;
                theCompany.save(function (companySaveErr) {
                  if(companySaveErr) {
                    res.json('contactSupport')
                  } else {
                    // if user has changed password
                    alreadyExistedUser.mobile = req.body.signupData.mobile;
                    alreadyExistedUser.password = req.body.signupData.password;
                    alreadyExistedUser.save(function (userEditError) {
                      if (userEditError) {
                        res.json('contactSupport');
                      }
                      res.json(alreadyExistedUser);
                    });
                  }
                });
              }
            });
        } else {
          // create the account
          createTheUserAccount(req, res);
        }
      }
    } else {
      createTheUserAccount(req, res);
    }
  });
};

function createTheUserAccount (req, res) {

  // Init user and add missing fields
  var user = new User(req.body.signupData);
  user.username = user.email;
  user.provider = 'local';
  user.isActive = false;

  var hostCompany = new HostCompany();
  if(req.body.isHost) {
    var toursite = req.body.toursite;
    user.displayName = user.email.split('@')[0];
    user.company = hostCompany;

    // Then save the user
    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        var userAdmin = new UserAdmin();
        userAdmin.user = user;
        userAdmin.save(function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            hostCompany.user = user._id;
            //if (toursite)
            hostCompany.toursite = toursite;
            hostCompany.notificationEmail = user.email;
            hostCompany.notificationMobile = user.mobile;
            hostCompany.inquiryEmail = user.email;
            hostCompany.inquiryMobile = user.mobile;
            hostCompany.isAccountActive = false;
            hostCompany.isOwnerAccount = true;
            hostCompany.save(function (err) {
              if(err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                // Do nothing
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    async.waterfall([
      function (done) {
        crypto.randomBytes(20, function (err, buffer) {
          var token = buffer.toString('hex');
          done(err, token, user);
        });
      },
      function (token, user, done) {
        user.displayName = user.firstName + ' ' + user.lastName;
        user.verificationToken = token;
        user.verificationTokenExpires =  Date.now()+ 3600000; // 1 millisecond
        user.userType = 'customer';
        user.save(function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            var httpTransport = 'http://';
            if (config.secure && config.secure.ssl === true) {
              httpTransport = 'https://';
            }
            var baseUrl = req.app.get('domain') || httpTransport + req.headers.host;
            var assetOneUrl = baseUrl + '/modules/core/client/img/brand/logo.png';
            res.render(path.resolve('modules/users/server/templates/user-verification-email'), {
              name: user.displayName,
              assetOneUrl: assetOneUrl,
              url: baseUrl + '/api/auth/userverification?token=' + token + '&user=' + user.id
            }, function (err, emailHTML) {
              done(err, emailHTML, user);
            });
            res.json(user); 
          }
        });
      },
      function (emailHTML, user, done) {
        nodemailerMailgun.sendMail({
          from: 'tourgecko <noreply@tourgecko.com>',
          to: user.email, // An array if you have multiple recipients.
          //cc:'',
          //bcc:'',
          subject: 'Activate your tourgecko account',
          //You can use "html:" to send HTML email content. It's magic!
          html: emailHTML,
          //You can use "text:" to send plain-text content. It's oldschool!
          // text: req.body.guestDetails.guestMessage
        }, function (err, info) {
          if (err) {
            // console.warn('error');
          }
          else {
            // console.warn('success');
          }
        });
      }
    ], function (err) {
      if (err) {
        return next(err);
      }
    }); 
  }
}

exports.signupDetails = function(req, res, next) {
  async.waterfall([
    // Generate random token
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by username
    function (token, done) {

      if (req.body.userId) {
        User.findOne({
          _id: req.body.userId
        }, '-salt -password', function (err, user) {
          if (err || !user) {
            res.status(500).render('modules/core/server/views/500', {
              error: 'Oops! Something went wrong! Please fill the details again!'
            });
          } else if (user == null) {
            res.render('modules/core/server/views/userNotFound', {
              error: 'User does not found. Please register first...'
            });
          } else {
            var userDetails = req.body.detailsObj;
            user.displayName = userDetails.firstName + ' ' + userDetails.lastName;
            user.firstName = userDetails.firstName;
            user.lastName = userDetails.lastName;
            user.verificationToken = token;
            user.verificationTokenExpires = Date.now() + 3600000; // 1 hour
            user.userType = 'host';
            user.roles = ['hostAdmin'];

            user.save(function (err) {
              if (err) {
                res.status(500).render('modules/core/server/views/500', {
                  error: 'Oops! Something went wrong! Please fill the details again!'
                });
              }
              HostCompany.findOne({ user: req.body.userId }, '-salt -password').sort('-created').exec(function (err, hostCompany) {
                if (err) {
                  res.status(500).render('modules/core/server/views/500', {
                    error: 'Oops! Something went wrong...'
                  });
                }
                var todayDate = new Date();
                var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                hostCompany.user = user;
                hostCompany.companyName = userDetails.companyName;
                hostCompany.companyWebsite = userDetails.companyWebsite;
                hostCompany.hostType = userDetails.hostType;
                hostCompany.memberSince = todayDate.getDate() + ' ' + (months[todayDate.getMonth()]) + ' ' + todayDate.getFullYear();
                hostCompany.hostCompanyAddress = {
                  streetAddress: userDetails.streetAddress,
                  city: userDetails.city,
                  postalCode: userDetails.postalCode,
                  state: userDetails.state,
                  country: userDetails.country
                };
                hostCompany.markModified('hostCompanyAddress');
                hostCompany.save(function (err) {
                  if (err) {
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    assignInitialGoalsAndPins(hostCompany, user, req, res);
                    //res.json(user);
                    // company saved successfully
                  }
                });
              });
              done(err, token, user);
            });
          }
        });
      } else {
        res.render('modules/core/server/views/userNotFound', {
          error: 'User does not found. Please register first...'
        });
      }
    },
    function (token, user, done) {

      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      var baseUrl = req.app.get('domain') || httpTransport + req.headers.host;
      var assetOneUrl = baseUrl + '/modules/core/client/img/brand/logo.png';
      res.render(path.resolve('modules/users/server/templates/user-verification-email'), {
        name: user.displayName,
        assetOneUrl: assetOneUrl,
        appName: config.app.title,
        url: baseUrl + '/api/auth/userverification?token=' + token + '&user=' + req.body.userId
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      nodemailerMailgun.sendMail({
          from: 'tourgecko <noreply@tourgecko.com>',
          to: user.email, // An array if you have multiple recipients.
          //cc:'',
          //bcc:'',
          subject: 'Activate your tourgecko account',
          //You can use "html:" to send HTML email content. It's magic!
          html: emailHTML,
          //You can use "text:" to send plain-text content. It's oldschool!
          // text: req.body.guestDetails.guestMessage
        }, function (err, info) {
          if (err) {
            // console.warn('error');
            res.status(500).render('modules/core/server/views/500', {
              error: 'Oops! Something went wrong. Please contact tourgecko support.'
            });
          }
          else {
            res.json(user)
            // console.warn('success');
          }
        });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

function assignInitialGoalsAndPins (company, user, req, res) {
  HostCompany.findOne({ _id: company._id }).exec(function (err, hostCompany) {
    if (err) {
      // Do nothing for now
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong. Please contact tourgecko support.'
      });
    }
    PinboardGoal.find({isInitialGoal: true, $or: [{to : 'all'}, {to : user._id}]}).exec(function (err, goals) {
      if (err) {
        res.status(500).render('modules/core/server/views/500', {
          error: 'Oops! Something went wrong. Please contact tourgecko support.'
        });
      }
      var goalsObject = [];
      for (var index = 0; index < goals.length; index ++) {
        var tempObject = {};
        var goal = goals[index];
        for (var field in PinboardGoal.schema.paths) {          
           if ((field !== '_id') && (field !== '__v')) {
            var value = goal[field];
            tempObject[field] = value;
          }
        }
        goalsObject.push(tempObject);
      }
      hostCompany.pinboardGoals = goalsObject;
      hostCompany.save(function (companySaveErr) {
        if (companySaveErr) {
          res.status(500).render('modules/core/server/views/500', {
            error: 'Oops! Something went wrong. Please contact tourgecko support.'
          });
        }
        PinboardPin.find({isInitialPin: true, $or: [{to : 'all'}, {to : user._id}]}).exec(function (err, pins) {
          if (err) {
            res.status(500).render('modules/core/server/views/500', {
              error: 'Oops! Something went wrong. Please contact tourgecko support.'
            });
          }
          var pinsObject = [];
          for (var index = 0; index < pins.length; index ++) {
            var tempObject = {};
            var pin = pins[index];
            for (var field in PinboardPin.schema.paths) {          
               if ((field !== '_id') && (field !== '__v')) {
                var value = pin[field];
                tempObject[field] = value;
              }
            }
            pinsObject.push(tempObject);
          }
          hostCompany.pinboarPins = pinsObject;
          hostCompany.save(function (companySaveErr) {
            if (companySaveErr) {
              res.status(500).render('modules/core/server/views/500', {
                error: 'Oops! Something went wrong. Please contact tourgecko support.'
              });
            }
          });
        });
      });
    });
  });
}
exports.resendverificationemail = function (req, res) {
  async.waterfall([
    // Generate random token
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by username
    function (token, done) {
      User.findOne({
        email: req.body.email
      }, '-salt -password', function (err, user) {
        if (user.isActive)
          res.json('User Already Activated');
        user.verificationToken = token;
        user.verificationTokenExpires = Date.now() + 3600000; // 1 hour
        user.save(function (err) {
          if (err) {
            res.json('failure');
          }
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {

      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      var baseUrl = req.app.get('domain') || httpTransport + req.headers.host;
      res.render(path.resolve('modules/users/server/templates/user-verification-email'), {
        name: user.displayName,
        appName: config.app.title,
        url: baseUrl + '/api/auth/userverification?token=' + token + '&user=' + user._id
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      nodemailerMailgun.sendMail({
          from: 'tourgecko <noreply@tourgecko.com>',
          to: user.email, // An array if you have multiple recipients.
          //cc:'',
          //bcc:'',
          subject: 'Verification at Tourgecko',
          //You can use "html:" to send HTML email content. It's magic!
          html: emailHTML,
          //You can use "text:" to send plain-text content. It's oldschool!
          // text: req.body.guestDetails.guestMessage
        }, function (err, info) {
          if (err) {
            res.json('failure');
          }
          else {
            res.json('success');
          }
        });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
}

/* Verify the user who is registered with us */
exports.validateUserVerification = function(req, res) {
  var userId = new mongoose.mongo.ObjectId(req.query.user);
  User.findOne({verificationToken: req.query.token, verificationTokenExpires: {$gt: Date.now()}}).populate('company').exec(function (err, user) {
    if (err) {
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong! Please try again by clicking the same Activation link'
      });
    } else if (user == null || !user) {
      res.render('modules/core/server/views/activationTokenInvalidOrExpired', {
        error: 'Activation token is invalid or has expired.'
      });
    } else if (user.isActive === true) {
      res.render('modules/core/server/views/userAlreadyActivated', {
        error: 'User is already activated. Please login...'
      });
    } else {
      user.isActive = true;
      user.save(function (err) {
        if (err) {
          res.status(500).render('modules/core/server/views/500', {
            error: 'Oops! Something went wrong. Please contact tourgecko support.'
          });
        } else {
          HostCompany.findOne({ user: user._id }, '-salt -password').sort('-created').exec(function (hostCompanyErr, hostCompany) {
            if (hostCompanyErr) {
              res.status(500).render('modules/core/server/views/500', {
                error: 'Oops! Something went wrong. Please contact tourgecko support.'
              });
            }
            hostCompany.isAccountActive = true;
            hostCompany.paymentGateway = 'instamojo';
            hostCompany.save(function(hostCompanySaveErr) {
              if (hostCompanySaveErr) {
                res.status(500).render('modules/core/server/views/500', {
                  error: 'Oops! Something went wrong. Please contact tourgecko support.'
                });
              }
              // Remove sensitive data before login
              user.password = undefined;
              user.salt = undefined;

              req.login(user, function (err) {
                if (err) {
                  console.log('the error here is ' + err);
                  res.status(400).send(err);
                } else {
                  var httpTransport = 'http://';
                  if (config.secure && config.secure.ssl === true) {
                    httpTransport = 'https://';
                  }
                  var baseUrl = req.app.get('domain') || httpTransport + req.headers.host;
                  var letsDoItUrl = baseUrl + '/host/admin';
                  var assetOneUrl = baseUrl + '/modules/core/client/img/brand/logo.png';
                  var assetTwourl = baseUrl + '/modules/core/client/img/assets/welcomeHostEmailPic.png';
                  console.log('why its showing here ' + assetOneUrl);
                  var hostToursiteUrl = httpTransport + user.company.toursite + '.' + req.headers.host;

                  res.render(path.resolve('modules/users/server/templates/user-activated-email'), {
                    hostName: user.company.companyName,
                    hostEmail: user.email,
                    hostToursiteUrl: hostToursiteUrl,
                    letsDoItUrl: letsDoItUrl,
                    assetOneUrl: assetOneUrl,
                    assetTwourl: assetTwourl
                  }, function (err, emailHTML) {
                    nodemailerMailgun.sendMail({
                      from: 'tourgecko <noreply@tourgecko.com>',
                      to: user.email, // An array if you have multiple recipients.
                      //cc:'',
                      //bcc:'',
                      subject: 'Welcome to tourgecko !!',
                      //You can use "html:" to send HTML email content. It's magic!
                      html: emailHTML,
                      //You can use "text:" to send plain-text content. It's oldschool!
                      // text: req.body.guestDetails.guestMessage
                    }, function (err, info) {
                      if (err) {
                        console.warn('failure');
                      }
                      else {
                        console.warn('success');
                      }
                    });
                  });
                  if (user.userType == 'host')
                    res.redirect('/host/admin');
                  else
                    res.redirect('/guest/home');
                }
              });
            });
          });
        }
      });
    }
  });
};

exports.validateUserMobileNumberVerification = function (req, res) {
  User.findOne({_id: req.user._id, mobileVerificationToken: {$gt: Date.now()}}).exec(function (err, user) {
    if (err) {
      res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong. Please contact tourgecko support.'
      });
    } else if (user == null || !user) {
      res.json('askForNewTokenGeneration');
    } else if (user.isMobileNumberVerified == true) {
      res.json('mobileAlreadyVerified');
    } else if (user.mobileVerificationToken == req.params.mobileVerificationToken) {
      user.isMobileNumberVerified = true;
      user.save(function (err) {
        if (err) {
          res.status(500).render('modules/core/server/views/500', {
            error: 'Oops! Something went wrong. Please contact tourgecko support.'
          });
        }
        ModifyPinboard.modifyPinboardGoalsForThisUser('completionOfAccountSetupAndLaunch', 'verifyMobile', user.company);
        res.json('mobileVerificationSuccess');
      });
    } else
      res.json('mobileVerificationTokeMismatch');
  });
}

function fireTheVerificationMail (req, res, existedUser) {
  async.waterfall([
    // Generate random token
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by username
    function (token, done) {
      User.findOne({_id: existedUser._id}, '-salt -password', function (err, queriedUser) {
        queriedUser.verificationToken = token;
        queriedUser.verificationTokenExpires = Date.now() + 3600000; // 1 hour
        queriedUser.save(function (err) {
          if (err) {
            res.json('failure');
          }
          done(err, token, queriedUser);
        });
      });
    },
    function (token, user, done) {

      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      var baseUrl = req.app.get('domain') || httpTransport + req.headers.host;
      res.render(path.resolve('modules/users/server/templates/user-verification-email'), {
        name: user.displayName,
        appName: config.app.title,
        url: baseUrl + '/api/auth/userverification?token=' + token + '&user=' + user._id
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      nodemailerMailgun.sendMail({
          from: 'tourgecko <noreply@tourgecko.com>',
          to: user.email, // An array if you have multiple recipients.
          //cc:'',
          //bcc:'',
          subject: 'Verification at Tourgecko',
          //You can use "html:" to send HTML email content. It's magic!
          html: emailHTML,
          //You can use "text:" to send plain-text content. It's oldschool!
          // text: req.body.guestDetails.guestMessage
        }, function (err, info) {
          if (err) {
            res.json('contactSupport');
          }
          else {
            res.json('expiredVerificationMail');
          }
        });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
}

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      return res.status(400).send({
        message: 'Account with given email and password does not exist.'
      });
    } else {
      if (!user.isActive) {
        return res.status(400).send({
          message: 'Account with this email is not verified.'
        });
      } else {
        // Remove sensitive data before login
        // var tz = momentTimezone.tz.guess();
        // For now hardcoding the time zone to Indian timezone. Need to find a good way to detect the timezone.
        // Above commented line always giving UTC or may be the server of Zure is in UTC timezone.
        user.lastLogin = momentTimezone.utc(new Date()).tz('Asia/Calcutta').format('ddd Do MMMM YYYY h:mma');
        user.save(function() {
          user.password = undefined;
          user.salt = undefined;
          req.login(user, function (err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.json(user);
            }
          });
        });
      }
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page

    if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
      req.session.redirect_to = req.query.redirect_to;
    }
    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
  return function (req, res, next) {
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to;
    delete req.session.redirect_to;

    passport.authenticate(strategy, function (err, user, info) {
      if (err) {
        return res.redirect('/guest/login?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/guest/login');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/guest/login');
        }
        return res.redirect('/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
            user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              mobile: providerUserProfile.mobile,
              profileImageURL: providerUserProfile.profileImageURL,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            });
            user.roles = ['user'];

            // And save the user
            user.save(function (err) {
              return done(err, user);
            });
          });
        } else {
          return done(err, user);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, '/settings/accounts');
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};
