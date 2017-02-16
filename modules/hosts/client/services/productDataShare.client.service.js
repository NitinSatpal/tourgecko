(function () {
  'use strict';

  angular
    .module('hosts.services')
    .factory('ProductDataShareService', ProductDataShareService);


  function ProductDataShareService() {
    var productData;

    return {
        getProductData: function () {
            return productData;
        },
        saveProductData: function (data) {
            productData = data;
        }
    };
  }
}());
