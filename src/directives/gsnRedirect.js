(function (window, angular, undefined) {
  'use strict';

  angular.module('gsn.core').directive('gsnRedirect', ['$location', 'gsnApi', 'gsnStore', function ($location, gsnApi, gsnStore) {
    // Usage:  To support redirecting
    //
    // Creates: 2014-02-03 TomN
    //
    var directive = {
      link: link,
      restrict: 'A'
    };
    return directive;

    function link(scope, element, attrs) {

      function followRedirect() {
        var toUrl = gsnApi.isNull($location.search()[attrs.gsnRedirect], '/');

        // This is not injectable, but we define as directive here so we can unit test the controllers
        // so this is bad code, but I don't know how else we going to support 3rd party iframe requirement WTF?
        if (window.top) {
          window.top.location = toUrl;
        } else {
          $location.path(toUrl);
        }
      }

      var storeNumber = $location.search().storenumber;
      if (storeNumber) {
        scope.$on('gsnevent:store-setid', followRedirect);

        // select the store before following redirect
        gsnStore.getStores().then(function (rsp) {
          var storeByNumber = gsnApi.mapObject(rsp.response, 'StoreNumber');
          var store = storeByNumber[storeNumber];
          if (store) {
            gsnApi.setSelectedStoreId(store.StoreId);
          }
        });
        return;
      }

      followRedirect();
    }

  }]);
})(window, angular);
