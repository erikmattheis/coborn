(function (angular, Gsn, undefined) {
  'use strict';
  var serviceId = 'gsnDfp';
  angular.module('gsn.core').service(serviceId, ['$rootScope', 'gsnApi', 'gsnStore', 'gsnProfile', '$sessionStorage', '$window', '$timeout', '$location', gsnDfp]);

  function gsnDfp($rootScope, gsnApi, gsnStore, gsnProfile, $sessionStorage, $window, $timeout, $location) {
    var service = {
      forceRefresh: false,
      hasShoppingList: false
    };

    $rootScope.$on('gsnevent:shoppinglistitem-updating', function (event, shoppingList, item) {
      var currentListId = gsnApi.getShoppingListId();
      if (shoppingList.ShoppingListId == currentListId) {
        var cat = gsnStore.getCategories()[item.CategoryId];
        Gsn.Advertising.addDept(cat.CategoryName);
        $timeout(doRefresh, 50);
      }
    });

    $rootScope.$on('gsnevent:shoppinglist-loaded', function (event, shoppingList, item) {
      service.hasShoppingList = true;
    });

    $rootScope.$on('$locationChangeSuccess', function (event, next) {
      $timeout(function() {
        var currentPath = angular.lowercase(gsnApi.isNull($location.path(), ''));
        Gsn.Advertising.setDefault({ page: currentPath });
        service.forceRefresh = true;
      }, 50);
    });

    $rootScope.$on('gsnevent:loadads', function (event, next) {
      $timeout(doRefresh, 50);
    });

    $rootScope.$on('gsnevent:digitalcircular-pagechanging', function (evt, data) {
      $timeout(doRefresh, 50);

      if (angular.element($window).scrollTop() > 140) {
        $window.scrollTo(0, 120);
      }
    });

    init();

    return service;

    // initialization
    function init() {
      if (service.isIE) {
        Gsn.Advertising.minSecondBetweenRefresh = 15;
      }
    }

    // attempt to update network id
    function updateNetworkId() {
      gsnStore.getStore().then(function (rst) {
        if (service.store != rst) {
          var baseNetworkId;

          if (rst) {
            baseNetworkId = '/' + rst.City + '-' + rst.StateName + '-' + rst.PostalCode + '-' + rst.StoreId;
            baseNetworkId = baseNetworkId.replace(/(undefined)+/gi, '').replace(/\s+/gi, '');
          }
          Gsn.Advertising.gsnNetworkStore = baseNetworkId;
        }
      });
    }

    // refresh method
    function doRefresh() {
      updateNetworkId();

      // targetted campaign
      if (parseFloat(gsnApi.isNull($sessionStorage.GsnCampaign, 0)) <= 0) {

        doCampaignRefresh();
        // don't need to continue with the refresh since it's being patched through get campaign above
        return;
      }


      // cause another refresh
      if (service.hasShoppingList) {
        service.hasShoppingList = false;
        Gsn.Advertising.depts = getAdDepts();
      }

      Gsn.Advertising.refresh(null, service.forceRefresh);
      service.forceRefresh = false;

    }

    // campaign refresh
    function doCampaignRefresh()
    {
      $sessionStorage.GsnCampaign = gsnApi.getProfileId();

      // try to get campaign
      gsnProfile.getCampaign().then(function (rst) {
        if (rst.success) {
          Gsn.Advertising.depts.length = 0;
          angular.forEach(rst.response, function (v, k) {
            Gsn.Advertising.depts.push(v.Value);
          });
        }
        Gsn.Advertising.refresh(null, service.forceRefresh);
        service.hasShoppingList = false;
        service.forceRefresh = false;
      });
    }

    function getAdDepts() {
      var items = gsnProfile.getShoppingList().allItems();
      var result = [];
      var categories = gsnStore.getCategories();
      var u = {};

      angular.forEach(items, function (item, idx) {
        if (gsnApi.isNull(item.CategoryId, null) === null) return;

        if (categories[item.CategoryId]) {
          var newKw = Gsn.Advertising.cleanKeyword(categories[item.CategoryId].CategoryName);
          if (u.hasOwnProperty(newKw)) {
            return;
          }
          result.push(newKw);
          u[newKw] = 1;
        }
      });
      return result;
    }

  }
})(angular, window.Gsn);
