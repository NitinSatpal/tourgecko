'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  mailer = require('nodemailer'),
  xoauth2 = require('xoauth2'),
  User = mongoose.model('User');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Init user and add missing fields
  var user = new User(req.body);
  // We are generating one random token for verification purpose
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var token = '';
  for (var i = 16; i > 0; --i) {
    token += chars[Math.round(Math.random() * (chars.length - 1))];
  }

  user.provider = 'local';
  user.displayName = user.email.split('@')[0];
  user.firstName = user.email.split('@')[0];
  user.lastName = user.email.split('@')[0];
  user.username = user.email;
  user.isActive = false;
  user.verificationToken = token;

  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(user);
      var link = 'http://' + req.get('host') + '/userverification?id=' + token + '&user=' + user.displayName;
      var transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
          xoauth2: xoauth2.createXOAuth2Generator({
            user: 'nitinsatpal@gmail.com',
            pass: 'tulsihardevitulsi',
            clientId: '789865679055-k2unpukldioq6fpsjpet8uob8e5hunjr.apps.googleusercontent.com',
            clientSecret: 'A8QKhmKyqtrN_AWglBXqOWZR',
            refreshToken: '1/QxAwaritcLICN1l9nKhj1W_sYkDxIr9hzHj5AAYkO2M',
            accessToken: 'ya29.Ci9YA7hMsZSxSLCKkVUphlYGFLF30w_0VPkkFHx3rWtcs_AwZTDqMFYXV86c1cn70w'
          })
        }
      });

      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: '"Tourgecko" <nitinsatpal@gmail.communication>', // sender address
        to: user.email, // list of receivers
        subject: 'Verification link mail', // Subject line
        text: 'Testing mail', // plaintext body
        html: '<b>Dear ' + user.displayName + '</b> <br><br>' +
              'Welcome to tourgecko. <br><br>' +
              'Thank you for the registration. You are just one step away from simplifying your business<br><br>' +
              'Please click the following link to activate your account<br>' +
              link + '<br><br>' +
              'Regards,<br>' +
              'Team Tourgecko' // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: ' + info.response);
      });
      // Commenting the following part as we do not want user to auto login once signup. We will add one layer of security by
      // mail verification
      // Remove sensitive data before login
      /* user.password = undefined;
      user.salt = undefined;

      // We do not want automatic login but want user to activate its account
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      }); */
    }
  });
};

exports.verifyUser = function(req, res) {
  var searchThis = req.query.id;
  var safeUserObject = null;
  User.findOne({ verificationToken: searchThis }).sort('-created').populate('name').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (users === null) {
        res.render('modules/core/server/views/userNotFound', {
          error: 'User does not found. Please register first...'
        });
      } else {
        if (users.isActive === true) {
          res.render('modules/core/server/views/userAlreadyActivated', {
            error: 'User is already activated. Please login...'
          });
        } else {
          User.findOne({ verificationToken: searchThis }, function (err, doc) {
            doc.isActive = true;
            doc.save();
          });
          req.login(users, function (err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.redirect('/');
            }
          });
        }
      }
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
        /* res.render('modules/core/server/views/userNotActivated', {
        error: 'User is not yet activated. Please go to the verification link sent to your registered mail address...'
      }); */
      } else {
        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;
        console.log('the user is ' + user);
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
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(info || sessionRedirectURL || '/');
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
