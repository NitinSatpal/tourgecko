'use strict';

module.exports = {
  app: {
    title: 'Tourgecko Development',
    description: 'Simplified tours',
    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
    // domain: 'http://www.tourgecko.com',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  mailer: {
    service: 'gmail',
    from: 'nitinsatpal@gmail.com',
    auth: {
      user: process.env.gmailUser,
      pass: process.env.gmailPass,
      clientId: process.env.clientId,
      clientSecret: process.env.clientSecret,
      refreshToken: process.env.refreshToken,
      accessToken: process.env.accessToken
    }
  },
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  // DOMAIN config should be set to the fully qualified application accessible
  // URL. For example: https://www.myapp.com (including port if required).
  domain: process.env.DOMAIN,
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: process.env.SESSION_SECRET || 'MEAN',
  // sessionKey is the cookie session name
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  // Lusca config
  csrf: {
    csrf: false,
    csp: false,
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    xssProtection: true
  },
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  uploads: {
    profileUpload: {
      dest: './modules/users/client/img/profile/uploads/', // Profile upload destination path
      limits: {
        fileSize: 1 * 1024 * 1024 // Max file size in bytes (1 MB)
      }
    },
    productPictureUploads: {
      dest: './modules/hosts/client/pictures/products/tours/photos/', // prpoduct images upload destination path
      limits: {
        fileSize: 10 * 1024 * 1024 // Max file size in bytes (1 MB)
      }
    },
    productMapUploads: {
      dest: './modules/hosts/client/pictures/products/tours/maps/', // product map upload destination path
      limits: {
        fileSize: 10 * 1024 * 1024 // Max file size in bytes (1 MB)
      }
    },
    hostCompanyLogoUploads: {
      dest: './modules/hosts/client/companyLogo/', // company logo upload destination path
      limits: {
        fileSize: 10 * 1024 * 1024 // Max file size in bytes (1 MB)
      }
    }
  }
};
