(function ($, win, undefined) {
  'use strict';
  var serviceId = 'gsnAisle50';
  angular.module('gsn.core').factory(serviceId, ['$rootScope', '$timeout', '$analytics', 'gsnApi', 'gsnProfile', '$window', gsnPrinter]);

  function gsnPrinter($rootScope, $timeout, $analytics, gsnApi, gsnProfile, $window) {
    // Usage: global mapping aisle50 redirect
    //
    // Creates: 2014-04-05 TomN
    // 

    var service = {
      redirect: redirect
    };

    $window.aisle50_redirect = service.redirect;

    return service;

    //#region Internal Methods 
    function goUrl(toUrl) {
      if ($window.top) {
        $window.top.location = toUrl;
      } else {
        $window.location = toUrl;
      }
    }
    
    function redirect(url, category) {
      try {
        $analytics.eventTrack('Aisle50', { category: category | 'Aisle50', label: url });
      } catch (e) {}
      
      var profileId = gsnProfile.getProfileId();
      var postUrl = gsnApi.getStoreUrl().replace(/store/gi, 'partner') + '/aisle50/' + profileId;
      gsnApi.httpGetOrPostWithCache({}, postUrl, {}).then(function(rsp) {
        if (rsp.success) {
          goUrl(url + '&' + rsp.response.replace(/(")+/gi, ''));
        }
      });
    }
    //#endregion
  }
})(window.jQuery || window.Zepto || window.tire, window);
