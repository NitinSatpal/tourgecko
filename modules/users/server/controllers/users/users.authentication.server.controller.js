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
  passport = require('passport'),
  nodemailer = require('nodemailer'),
  xoauth2 = require('xoauth2'),
  async = require('async'),
  crypto = require('crypto');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/guest/login',
  '/guest/signup'
];

var smtpTransport = nodemailer.createTransport({
  service: config.mailer.service,
  auth: {
    xoauth2: xoauth2.createXOAuth2Generator(config.mailer.auth)
  }
});
/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;
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
            hostCompany.toursite = toursite;
            hostCompany.notificationEmail = user.email;
            hostCompany.notificationMobile =user.mobile;
            hostCompany.inquiryEmail = user.email;
            hostCompany.inquiryMobile = user.mobile;
            hostCompany.isAccountActive = true;
            hostCompany.isOwnerAccount = true;
            hostCompany.save(function (err) {
              if(err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                // Do nothing
              }
            });
          }
        });
        res.json(user);
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
        user.verificationTokenExpires =  Date.now() + 3600000; // 1 hour
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
            res.render(path.resolve('modules/users/server/templates/user-verification-email'), {
              name: user.displayName,
              appName: config.app.title,
              url: baseUrl + '/api/auth/userverification?token=' + token + '&user=' + user.id
            }, function (err, emailHTML) {
              done(err, emailHTML, user);
            });
          }
        });
      },
      function (emailHTML, user, done) {
        var mailOptions = {
          to: user.email,
          from: config.mailer.from,
          subject: 'User verification',
          html: emailHTML
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          if (!err) {
            console.log('Message sent');
          } else {
            console.log('Message sending failed.');
            // return res.status(400).send({
              // message: 'Some problem occurred. Please try again after sometime or call us.'
            // });
          }
          done(err);
        });
      }
    ], function (err) {
      if (err) {
        return next(err);
      }
    });
    res.json(user);  
  }
};

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
      if (req.body.userId.id) {
        User.findOne({
          _id: req.body.userId.id
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
              HostCompany.findOne({ user: req.body.userId.id }, '-salt -password').sort('-created').exec(function (err, hostCompany) {
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
                hostCompany.memberSince = todayDate.getDate() + ' ' + (months[todayDate.getMonth()]) + ', ' + todayDate.getFullYear();
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
                    /* return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    }); */
                  } else {
                    // Do nothing
                  }
                });
              });
              
              res.json(user);
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
      res.render(path.resolve('modules/users/server/templates/user-verification-email'), {
        name: user.displayName,
        appName: config.app.title,
        url: baseUrl + '/api/auth/userverification?token=' + token + '&user=' + req.body.userId.id
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'User verification',
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          console.log('Message sent');
        } else {
          console.log('Message sending failed.');
          // return res.status(400).send({
            // message: 'Some problem occurred. Please try again after sometime or call us.'
          // });
        }
        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

/* Verify the user who is registered with us */
exports.validateUserVerification = function(req, res) {
  var userId = new mongoose.mongo.ObjectId(req.query.user);
  User.findOne({
    verificationToken: req.query.token,
    verificationTokenExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
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
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          // Remove sensitive data before login
          user.password = undefined;
          user.salt = undefined;

          req.login(user, function (err) {
            if (err) {
              res.status(400).send(err);
            } else {
              if (user.userType == 'host')
                res.redirect('/host/admin');
              else
                res.redirect('/guest/home');
            }
          });
        }
      });
    }
  });
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      if (user.isActive === false) {
        res.status(403).send(info);
        // return res.redirect(path.resolve('./modules/core/server/views/userNotActivated'));
      } else {
        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
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
