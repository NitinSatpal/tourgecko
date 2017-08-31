'use strict';

module.exports = {
  app: {
    title: 'tourgecko',
    description: 'All-In-One tour and activity management platform',
    keywords: 'Tours, Activities, Custom Price, Addons, Product, tour, gecko, tourgecko, tour gecko',
    domain: 'https://www.tourgecko.com',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
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
  sessionSecret: process.env.SESSION_SECRET || 'tourgecko',
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
  logo: 'https://tourgecko.com/modules/core/client/img/brand/logo-icon.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  uploads: {
    profileUpload: {
      dest: './modules/users/client/img/profile/uploads/'
    },
    productPictureUploads: {
      dest: './modules/hosts/client/pictures/products/tours/photos/'
    },
    productMapUploads: {
      dest: './modules/hosts/client/pictures/products/tours/maps/'
    },
    toursiteBannersUploads: {
      dest: './modules/hosts/client/banners/toursite/'
    },
    hostCompanyLogoUploads: {
      dest: './modules/hosts/client/companyLogo/'
    },
    hostCompanyAddressProofUploads: {
      dest: './modules/hosts/client/companyProof/address/'
    },
    hostCompanyPanProofUploads: {
      dest: './modules/hosts/client/companyProof/pan/'
    }
  }
};
