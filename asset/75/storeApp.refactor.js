/* bi     g traffic on home, coupons, circular and store locator */

var storeApp = angular
    .module('storeApp', ['oc.lazyLoad', 'ngRoute', 'ngSanitize', 'ngAnimate', 'ngTouch', 'chieffancypants.loadingBar', 'gsn.core', 'vcRecaptcha', 'ui.bootstrap', 'ui.keypress', 'ui.event', 'ui.utils', 'facebook', 'angulartics', 'angulartics.gsn.ga'])
    .config(['$ocLazyLoadProvider', '$routeProvider', '$locationProvider', '$sceDelegateProvider', '$sceProvider', '$httpProvider', 'FacebookProvider', '$analyticsProvider', function ($ocLazyLoadProvider, $routeProvider, $locationProvider, $sceDelegateProvider, $sceProvider, $httpProvider, FacebookProvider, $analyticsProvider) {

      gsn.applyConfig(window.globalConfig.data || {});
      gsn.config.ContentBaseUrl = window.location.port > 1000 ? "/asset/75" : gsn.config.ContentBaseUrl;
      gsn.initAngular($sceProvider, $sceDelegateProvider, $locationProvider, $httpProvider, FacebookProvider, $analyticsProvider);

      // setting up home file
      var homeFile = gsn.getContentUrl('/views/home.html');
      if (gsn.config.HomePage.ConfigData) {
        var homeFileConfig = gsn.config.HomePage.ConfigData.homefile;
        if (homeFileConfig) {
          homeFile = gsn.getThemeUrl('/views/' + homeFileConfig.Description)
        }
      }

      $ocLazyLoadProvider.config({
        debug: false,
        events: false
      });

      // storeRequired attribute identify route require a store selection
      $routeProvider
        .when('/', {
          templateUrl: homeFile,
          caseInsensitiveMatch: true
        })

        .when('/article', {
          templateUrl: gsn.getThemeUrl('/views/engine/article.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlArticle',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlArticle.js'
                ]
              });
            }]
          }
        })
/* TODO: test while logged in */
        .when('/changepassword', {
          templateUrl: gsn.getThemeUrl('/views/engine/modal-changePassword.html'),
          requireLogin: true,
          caseInsensitiveMatch: true,
          controller: 'ctrlChangePassword',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlChangePassword.js'
                ]
              });
            }]
          }
        })

        .when('/circular', {
          templateUrl: gsn.getThemeUrl('/views/engine/circular-view.html'),
          storeRequired: true,
          caseInsensitiveMatch: true,
          controller: 'ctrlCircular',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                serie: true,
                files: [
                  '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.3.0/handlebars.min.js',
                  '/vendor/jquery.digitalcirc.js',
                  '/src/directives/ctrlCircular.js',
                  '/src/directives/gsnAdUnit.js',
                  '/src/directives/gsnDigitalCirc.js',
                  '//cdnjs.cloudflare.com/ajax/libs/qtip2/2.2.0/jquery.qtip.min.css'
                ]
              });
            }]
          }
        })

        .when('/circular/:all', {
          templateUrl: gsn.getThemeUrl('/views/engine/circular-view.html'),
          storeRequired: true,
          caseInsensitiveMatch: true,
          controller: 'ctrlCircular',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                serie: true,
                files: [
                  '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.3.0/handlebars.min.js',
                  '/vendor/jquery.digitalcirc.js',
                  '/src/directives/ctrlCircular.js',
                  '/src/directives/gsnAdUnit.js',
                  '/src/directives/gsnPopover.js',
                  '//cdnjs.cloudflare.com/ajax/libs/qtip2/2.2.0/jquery.qtip.min.css'
                ]
              });
            }]
          }
        })

        /* TODO: separate ContactUsCtrl into module */
        .when('/contactus', {
          templateUrl: gsn.getThemeUrl('/views/engine/contact-us.html'),
          controller: 'ContactUsCtrl',
          caseInsensitiveMatch: true
        })

        .when('/coupons/printable', {
          templateUrl: gsn.getThemeUrl('/views/engine/coupons-printable.html'),
          storeRequired: true,
          caseInsensitiveMatch: true,
          controller: 'ctrlCouponClassic',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/gsnAdUnit.js',
                    '/src/services/gsnProLogicRewardCard.js',
                    '/src/directives/ctrlCouponClassic.js'
                ]
              });
            }]
          }
        })

        .when('/coupons/digital', {
          templateUrl: gsn.getThemeUrl('/views/engine/coupons-digital.html'),
          storeRequired: true,
          caseInsensitiveMatch: true,
          controller: 'ctrlCouponClassic',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlCouponClassic.js',
                    '/src/directives/gsnAdUnit.js',
                    '/src/services/gsnProLogicRewardCard.js'
                ]
              });
            }]
          }
        })

        .when('/coupons/store', {
          templateUrl: gsn.getThemeUrl('/views/engine/coupons-instore.html'),
          storeRequired: true,
          caseInsensitiveMatch: true,
          controller: 'ctrlCouponClassic',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlCouponClassic.js',
                    '/src/directives/gsnAdUnit.js',
                    '/src/services/gsnProLogicRewardCard.js'
                ]
              });
            }]
          }
        })

        .when('/mealplannerfull', {
          templateUrl: gsn.getThemeUrl('/views/engine/meal-planner.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlMealPlanner',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlMealPlanner.js',
                    '/src/directives/gsnAdUnit.js'
                ]
              });
            }]
          }
        })
/* TODO: test when logged in */
        .when('/savedlists', {
          templateUrl: gsn.getThemeUrl('/views/engine/saved-lists.html'),
          requireLogin: true,
          caseInsensitiveMatch: true,
          controller: 'ctrlShoppingList',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlShoppingList.js',
                    '/src/directives/gsnAdUnit.js'
                ]
              });
            }]
          }
        })

        .when('/mylist', {
          templateUrl: gsn.getThemeUrl('/views/engine/shopping-list.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlShoppingList',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlShoppingList.js',
                    '/src/directives/gsnAdUnit.js'
                ]
              });
            }]
          }
        })
/* TODO: missing image in template */
        .when('/mylist/print', {
          templateUrl: gsn.getThemeUrl('/views/engine/shopping-list-print.html'),
          layout: gsn.getThemeUrl('/views/layout-print.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlShoppingList',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlShoppingList.js',
                    '/src/directives/gsnAdUnit.js'
                ]
              });
            }]
          }
        })

        .when('/mylist/email', {
          templateUrl: gsn.getThemeUrl('/views/engine/shopping-list-email.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlEmail',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlEmail.js',
                    '/src/directives/gsnAdUnit.js',
                    '/src/directives/gsnTextCapture.js'
                ]
              });
            }]
          }
        })

        .when('/emailpreview/registration', {
          templateUrl: gsn.getThemeUrl('/views/email/registration.html'),
          layout: gsn.getThemeUrl('/views/layout-empty.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRegistration',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRegistration.js',
                    '/src/directives/gsnValidUser.js'

                ]
              });
            }]
          }
        })

        .when('/emailpreview/registration-facebook', {
          templateUrl: gsn.getThemeUrl('/views/email/registration-facebook.html'),
          layout: gsn.getThemeUrl('/views/layout-empty.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlEmailPreview',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlEmailPreview.js'
                ]
              });
            }]
          }
        })

/* TODO: test while logged in */

        .when('/myrecipes', {
          templateUrl: gsn.getThemeUrl('/views/engine/my-recipes.html'),
          requireLogin: true,
          caseInsensitiveMatch: true,
          controller: 'ctrlMyRecipes',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlMyRecipes.js',
                    '/src/directives/gsnAdUnit.js'
                ]
              });
            }]
          }
        })

        /* TODO: Address this later - ask Andrea

        .when('/myspecials', {
          templateUrl: gsn.getThemeUrl('/views/engine/my-specials.html'),
          requireLogin: true,
          caseInsensitiveMatch: true
        })
        */

        /* TODO: save for later - needs separate refactor there is no template /views/engine/profile-rewardcard.html
        .when('/profile', {
          templateUrl: gsn.getContentUrl('/views/engine/profile-rewardcard.html'),
          requireLogin: true,
          caseInsensitiveMatch: true
        })

        .when('/profile/rewardcard', {
          templateUrl: gsn.getContentUrl('/views/engine/profile-rewardcard.html'),
          requireLogin: true,
          caseInsensitiveMatch: true
        })

        .when('/profile/rewardcard/updated', {
          templateUrl: gsn.getThemeUrl('/views/engine/profile-edit.html'),
          requireLogin: true,
          caseInsensitiveMatch: true
        })

        */

        .when('/recipe', {
          templateUrl: gsn.getThemeUrl('/views/engine/recipe-details.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRecipe',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRecipe.js',
                    '/src/directives/gsnAdUnit.js',
                    '/src/directives/gsnTwitterShare.js'
                ]
              });
            }]
          }
        })

        .when('/recipe/print', {
          templateUrl: gsn.getThemeUrl('/views/engine/recipe-print.html'),
          caseInsensitiveMatch: true,
          layout: gsn.getThemeUrl('/views/layout-print.html'),
          controller: 'ctrlRecipe',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRecipe.js'
                ]
              });
            }]
          }
        })

        .when('/recipecenter', {
          templateUrl: gsn.getThemeUrl('/views/engine/recipe-center.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRecipeCenter',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRecipeCenter.js',
                    '/src/directives/gsnAdUnit.js'
                ]
              });
            }]
          }
        })

        .when('/recipe/search', {
          templateUrl: gsn.getThemeUrl('/views/engine/recipe-search.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRecipeSearch',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRecipeSearch.js',
                    '/src/directives/gsnAdUnit.js'
                ]
              });
            }]
          }
        })

        .when('/recipevideo', {
          templateUrl: gsn.getThemeUrl('/views/engine/recipe-video.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRecipeCenter',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/vendor/flowplayer-3.2.13.min.js',
                    '/src/directives/gsnFlowPlayer.js',
                    '/src/directives/ctrlRecipeCenter.js',
                    '/src/directives/gsnAdUnit.js'
                ]
              });
            }]
          }
        })

        .when('/recoverpassword', {
          templateUrl: gsn.getThemeUrl('/views/engine/recover-password.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRecovery',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRecovery.js'
                ]
              });
            }]
          }
        })

        .when('/recoverpassword', {
          templateUrl: gsn.getThemeUrl('/views/engine/recover-username.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRecovery',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRecovery.js'
                ]
              });
            }]
          }
        })

       .when('/registration', {
          templateUrl: gsn.getContentUrl('/views/engine/registration.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRegistration',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRegistration.js'
                ]
              });
            }]
          }
        })
          
       .when('/registration/facebook', {
          templateUrl: gsn.getContentUrl('/views/engine/registration.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRegistration',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRegistration.js'
                ]
              });
            }]
          }
        })

        /* TODO: easy to implement when needed but not now
        .when('/search', {
          templateUrl: gsn.getThemeUrl('/views/engine/custom/search.html'),
          caseInsensitiveMatch: true
        })
        */

       .when('/signin', {
          templateUrl: gsn.getThemeUrl('/views/engine/login.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlLogin',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlLogin.js'
                ]
              });
            }]
          }
        })

        .when('/storelocator', {
          templateUrl: gsn.getThemeUrl('/views/engine/store-locator.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlStoreLocator',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                serie: true,
                files: ['/vendor/ui-map.min.js',
                '/src/directives/ctrlStoreLocator.js'
                /*'js!//maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry' */
                ]
              });
            }]
          }
        })

        .when('/unsubscribe', {
          templateUrl: gsn.getThemeUrl('/views/engine/unsubscribe.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlRecovery',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlRecovery.js'
                ]
              });
            }]
          }
        })

        .otherwise({
          templateUrl: gsn.getThemeUrl('/views/engine/static-content.html'),
          caseInsensitiveMatch: true,
          controller: 'ctrlStaticContent',
          resolve: {
            lazy: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                    '/src/directives/ctrlStaticContent.js'
                ]
              });
            }]
          }
         });

      //#endregion

    }])
    .run(['$window', '$timeout', '$rootScope', 'gsnApi', 'gsnProfile', 'gsnStore', 'gsnDfp', 'gsnYoutech', 'gsnAdvertising', '$localStorage', function ($window, $timeout, $rootScope, gsnApi, gsnProfile, gsnStore, gsnDfp, gsnYoutech, gsnAdvertising, $localStorage) {
      /// <summary></summary>
      /// <param name="$window" type="Object"></param> 
      /// <param name="$timeout" type="Object"></param>  
      /// <param name="$rootScope" type="Object"></param>    
      /// <param name="gsnApi" type="Object"></param>
      /// <param name="gsnProfile" type="Object"></param>
      /// <param name="gsnStore" type="Object"></param>
      /// <param name="gsnDfp" type="Object">kick start dfp</param>
      /// <param name="gsnYoutech" type="Object">kick start youtech</param>

      // init profile so we can get token
      gsnProfile.initialize();

    }]);

// ContactUsCtrl
storeApp
  .controller('ContactUsCtrl', ['$scope', 'gsnProfile', 'gsnApi', '$timeout', 'gsnStore', '$interpolate', '$http', function ($scope, gsnProfile, gsnApi, $timeout, gsnStore, $interpolate, $http) {

    $scope.activate = activate;
    $scope.vm = { PrimaryStoreId: gsnApi.getSelectedStoreId(), ReceiveEmail: true };
    $scope.masterVm = { PrimaryStoreId: gsnApi.getSelectedStoreId(), ReceiveEmail: true };

    $scope.hasSubmitted = false;    // true when user has click the submit button
    $scope.isValidSubmit = true;    // true when result of submit is valid
    $scope.isSubmitting = false;    // true if we're waiting for result from server
    $scope.errorResponse = null;
    $scope.contactSuccess = false;
    $scope.topics = [];
    $scope.topicsByValue = {};
    $scope.storeList = [];
    $scope.captcha = {};
    $scope.storesById = {};

    var template;

    $http.get($scope.getContentUrl('/views/email/contact-us.html'))
      .success(function (response) {
        template = response.replace(/data-ctrl-email-preview/gi, '');
      });

    function activate() {
      gsnStore.getStores().then(function (rsp) {
        $scope.stores = rsp.response;

        // prebuild list base on roundy spec (ﾉωﾉ)
        // make sure that it is order by state, then by name
        $scope.storesById = gsnApi.mapObject($scope.stores, 'StoreId');
      });

      gsnProfile.getProfile().then(function (p) {
        if (p.success) {
          $scope.masterVm = angular.copy(p.response);
          $scope.doReset();
        }
      });

      $scope.topics = gsnApi.groupBy(getData(), 'ParentOption');
      $scope.topicsByValue = gsnApi.mapObject($scope.topics, 'key');
      $scope.parentTopics = $scope.topicsByValue[''];

      delete $scope.topicsByValue[''];
    }

    $scope.getSubTopics = function () {
      return $scope.topicsByValue[$scope.vm.Topic];
    };

    $scope.getFullStateName = function (store) {
      return '=========' + store.LinkState.FullName + '=========';
    };

    $scope.getStoreDisplayName = function (store) {
      return store.StoreName + ' - ' + store.PrimaryAddress + '(#' + store.StoreNumber + ')';
    };

    $scope.doSubmit = function () {
      var payload = $scope.vm;
      if ($scope.myContactUsForm.$valid) {
        payload.CaptchaChallenge = $scope.captcha.challenge;
        payload.CaptchaResponse = $scope.captcha.response;
        payload.Store = $scope.getStoreDisplayName($scope.storesById[payload.PrimaryStoreId]);
        $scope.email = payload;
        payload.EmailMessage = $interpolate(template)($scope);
        // prevent double submit
        if ($scope.isSubmitting) return;

        $scope.hasSubmitted = true;
        $scope.isSubmitting = true;
        $scope.errorResponse = null;
        gsnProfile.sendContactUs(payload)
            .then(function (result) {
              $scope.isSubmitting = false;
              $scope.isValidSubmit = result.success;
              if (result.success) {
                $scope.contactSuccess = true;
              } else if (typeof (result.response) == 'string') {
                $scope.errorResponse = result.response;
              } else {
                $scope.errorResponse = gsnApi.getServiceUnavailableMessage();
              }
            });
      }
    };

    $scope.doReset = function () {
      $scope.vm = angular.copy($scope.masterVm);
      $scope.vm.ConfirmEmail = $scope.vm.Email;
    };

    $scope.activate();

    function getData() {
      return [
          {
            "Value": "Company",
            "Text": "Company",
            "ParentOption": ""
          },
          {
            "Value": "Store",
            "Text": "Store (specify store below)",
            "ParentOption": ""
          },
          {
            "Value": "Other",
            "Text": "Other (specify below)",
            "ParentOption": ""
          },
          {
            "Value": "Employment",
            "Text": "Employment",
            "ParentOption": ""
          },
          {
            "Value": "Website",
            "Text": "Website",
            "ParentOption": ""
          },
          {
            "Value": "Pharmacy",
            "Text": "Pharmacy (specify store below)",
            "ParentOption": ""
          }
      ];
    }
}]);

// Silver Demo Account - delete
storeApp.controller('SilverDemoAccountCtrl', ['$scope', 'gsnProfile', 'gsnApi', '$timeout', 'gsnStore', '$rootScope', function controller($scope, gsnProfile, gsnApi, $timeout, gsnStore, $rootScope) {

  $scope.activate = activate;
  $scope.profile = { PrimaryStoreId: gsnApi.getSelectedStoreId(), ReceiveEmail: true };

  $scope.hasSubmitted = false;    // true when user has click the submit button
  $scope.isValidSubmit = true;    // true when result of submit is valid
  $scope.isSubmitting = false;    // true if we're waiting for result from server
  $scope.isFacebook = false;
  $scope.profileStatus = { profileUpdated: 0 };

  function activate() {
    gsnStore.getStores().then(function (rsp) {
      $scope.stores = rsp.response;
    });

    gsnProfile.getProfile().then(function (p) {
      if (p.success) {
        $scope.profile = angular.copy(p.response);
        $scope.isFacebook = (gsnApi.isNull($scope.profile.FacebookUserId, '').length > 0);
      }
    });
  }

  $scope.updateProfile = function () {
    var profile = $scope.profile;
    if ($scope.myForm.$valid) {

      // prevent double submit
      if ($scope.isSubmitting) return;

      $scope.hasSubmitted = true;
      $scope.isSubmitting = true;
      gsnProfile.updateProfile(profile)
          .then(function (result) {
            $scope.isSubmitting = false;
            $scope.isValidSubmit = result.success;
            if (result.success) {
              gsnApi.setSelectedStoreId(profile.PrimaryStoreId);

              // trigger profile retrieval
              gsnProfile.getProfile(true);

              // Broadcast the update.
              $rootScope.$broadcast('gsnevent:updateprofile-successful', result);
            }
          });
    }
  };

  $scope.activate();

  ////
  // Handle the event 
  ////
  $scope.$on('gsnevent:updateprofile-successful', function (evt, result) {

    // We just updated the profile; update the counter.
    $scope.profileStatus.profileUpdated++;
  });

}]);
