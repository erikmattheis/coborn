// Actual Api Service
(function (myGsn, angular, undefined) {
  'use strict';
  var serviceId = '$gsnSdk';
  angular.module('gsn.core').service(serviceId, ['$window', '$timeout', '$rootScope', 'gsnApi', 'gsnProfile', 'gsnStore', 'gsnDfp', 'gsnYoutech', $gsnSdk]);

  function $gsnSdk($window, $timeout, $rootScope, gsnApi, gsnProfile, gsnStore, gsnDfp, gsnYoutech) {
    var returnObj = {
      hasInit: false
    };

    returnObj.init = function (options) {
      if (returnObj.hasInit) return;
      
      returnObj.hasInit = true;
      var currentToken = null;
      var onCallback = function(callbackFunction, data) {
        if (typeof(callbackFunction) == 'function') {
          callbackFunction({ success: true, response: data });
        }
      };
      
      var rpc = new easyXDM.Rpc(options, {
        remote: {
          triggerEvent: {}
        },
        local: {
          authenticate: function(grantType, user, pass) { gsnApi.doAuthenticate({ grant_type: grantType, client_id: gsnApi.getChainId(), access_type: 'offline', username: user, password: pass }); },
          apiGet: function (cacheObject, url, callbackFunction) { gsnApi.httpGetOrPostWithCache(cacheObject || {}, url).then(callbackFunction); },
          apiPost: function (cacheObject, url, postData, callbackFunction) { gsnApi.httpGetOrPostWithCache(cacheObject || {}, url, postData || {}).then(callbackFunction); },
          
          getToken: function (callbackFunction) { onCallback(callbackFunction, getToken());}, 
          getSiteId: function (callbackFunction) { onCallback(callbackFunction, gsnApi.getChainId()); }, 
          getStoreId: function (callbackFunction) { onCallback(callbackFunction, gsnApi.getSelectedStoreId()); },
          getProfileId: function (callbackFunction) { onCallback(callbackFunction, gsnApi.getProfileId()); },
          getShoppingListId: function (callbackFunction) { onCallback(callbackFunction, gsnApi.getSelectedShoppingListId()); }, 
          getConfig: function (callbackFunction) { onCallback(callbackFunction, gsnApi.getConfig()); },   
          
          mylist_addItem: function(item, callbackFunction) { gsnProfile.addItem(item); onCallback(callbackFunction); },
          mylist_updateItem: function (item, callbackFunction) { gsnProfile.addItem(item); onCallback(callbackFunction); },
          mylist_deleteItem: function(callbackFunction) { gsnProfile.removeItem(item); onCallback(callbackFunction); },
          mylist_deleteList: function (callbackFunction) { gsnProfile.deleteShoppingList(); onCallback(callbackFunction); },
          mylist_startNewList: function(callbackFunction) { gsnProfile.createNewShoppingList().then(callbackFunction); },
          mylist_refreshList: function (callbackFunction) { gsnProfile.getShoppingList().updateShoppingList().then(callbackFunction); },    
          mylist_getTitle: function (callbackFunction) { onCallback(callbackFunction, gsnProfile.getShoppingList().getTitle()); },         
          mylist_getCount: function (callbackFunction) { onCallback(callbackFunction, gsnProfile.getShoppingListCount()); },
          
          profile_register: function (profile, callbackFunction) { gsnProfile.registerProfile(profile).then(callbackFunction); },
          profile_update: function (profile, callbackFunction) { gsnProfile.updateProfile(profile).then(callbackFunction);},             
          profile_recoverUsername: function (email, callbackFunction) { gsnProfile.recoverUsername({Email: email}).then(callbackFunction); },   
          profile_recoverPassword: function (email, callbackFunction) { gsnProfile.recoverPassword({Email: email}).then(callbackFunction); },    
          profile_changePassword: function (userName, currentPassword, newPassword, callbackFunction) { gsnProfile.changePassword(userName, currentPassword, newPassword).then(callbackFunction); },      
          profile_selectStore: function (storeId, callbackFunction) { gsnProfile.selectStore(storeId).then(callbackFunction); },
          profile_get: function(callbackFunction) { gsnProfile.getProfile().then(function (data) { onCallback(callbackFunction, data); }); },   
          profile_logOut: function(callbackFunction) { gsnProfile.logOut(); onCallback(callbackFunction); },
          profile_isLoggedIn: function (callbackFunction) { onCallback(callbackFunction, getToken().grant_type !== 'anonymous'); },
          profile_getStore: function (callbackFunction) { gsnStore.getStore().then(function (store) { callbackFunction({ success: (gsnApi.isNull(store, null) !== null), response: store }); }); },
          
          store_hasCompleteCircular: function (callbackFunction) { onCallback(callbackFunction, gsnStore.hasCompleteCircular()); },
          store_getCircular: function(callbackFunction) { onCallback(callbackFunction, gsnStore.getCircularData()); },                
          store_getCategories: function (callbackFunction) { onCallback(callbackFunction, gsnStore.getCategories()); },                
          store_getInventoryCategories: function (callbackFunction) { gsnStore.getInventoryCategories().then(callbackFunction); },
          store_getSaleItemCategories: function (callbackFunction) { gsnStore.getSaleItemCategories().then(callbackFunction); },
          store_refreshCircular: function (forceRefresh, callbackFunction) { onCallback(callbackFunction, gsnStore.refreshCircular(forceRefresh)); }, 
          store_searchProducts: function (searchTerm, callbackFunction) { gsnStore.searchProducts(searchTerm).then(callbackFunction); },                 
          store_searchRecipes: function (searchTerm, callbackFunction) { gsnStore.searchRecipes(searchTerm).then(callbackFunction); },                    
          store_getAvailableVarieties: function (circularItemId, callbackFunction) { gsnStore.getAvailableVarieties(circularItemId).then(callbackFunction); },
          store_getAskTheChef: function (callbackFunction) { gsnStore.getAskTheChef().then(callbackFunction); },                     
          store_getFeaturedArticle: function (callbackFunction) { gsnStore.getFeaturedArticle().then(callbackFunction); },              
          store_getCookingTip: function (callbackFunction) { gsnStore.getCookingTip().then(callbackFunction); },                          
          store_getTopRecipes: function (callbackFunction) { gsnStore.getTopRecipes().then(callbackFunction); },                            
          store_getFeaturedRecipe: function (callbackFunction) { gsnStore.getFeaturedRecipe().then(callbackFunction); },                      
          store_getManufacturerCoupons: function (callbackFunction) { onCallback(callbackFunction, gsnStore.getManufacturerCoupons()); },              
          store_getManufacturerCouponTotalSavings: function (callbackFunction) { gsnStore.getManufacturerCouponTotalSavings().then(callbackFunction); }, 
          store_getStates: function (callbackFunction) { gsnStore.getStates().then(callbackFunction); },                                       
          store_getInstoreCoupons: function (callbackFunction) { onCallback(callbackFunction, gsnStore.getInstoreCoupons()); },                 
          store_getYoutechCoupons: function (callbackFunction) { onCallback(callbackFunction, gsnStore.getYoutechCoupons()); },                      
          store_getRecipe: function (recipeId, callbackFunction) { gsnStore.getFeaturedRecipe(recipeId).then(callbackFunction); },                    
          store_getStaticContent: function (contentName, callbackFunction) { gsnStore.getStaticContent(contentName).then(callbackFunction); },         
          store_getArticle: function (articleId, callbackFunction) { gsnStore.getArticle(articleId).then(callbackFunction); },                          
          store_getSaleItems: function (departmentId, categoryId, callbackFunction) { gsnStore.getSaleItems(departmentId, categoryId).then(callbackFunction); },   
          store_getInventory: function (departmentId, categoryId, callbackFunction) { gsnStore.getInventory(departmentId, categoryId).then(callbackFunction); },   
          store_getSpecialAttributes: function (callbackFunction) { gsnStore.getSpecialAttributes().then(callbackFunction); },
          store_getMealPlannerRecipes: function (callbackFunction) { gsnStore.getMealPlannerRecipes().then(callbackFunction); },                                 
          store_getAdPods: function (callbackFunction) { gsnStore.getAdPods().then(callbackFunction); },
          store_getStores: function (callbackFunction) { getStores().then(function (data) { onCallback(callbackFunction, data); }); }
        }
      });

      // check every second for changes in access_token
      setInterval(function () {
        var apiToken = getToken();
        if (apiToken) {
          var localToken = gsnApi.isNull(currentToken, {});
          if (localToken.user_id !== apiToken.user_id) {
            currentToken = apiToken;
            // if profile changed, initiate profile refresh in gsnProfile by setting access token  
            var profileId = parseInt(currentToken.user_id);
            gsnApi.setAccessToken(currentToken);
            rpc.triggerEvent({ type: 'gsnevent:profile-changed', arg: profileId });
          }
        }
      }, 2000);

      $rootScope.$on('gsnevent:login-success', function (evt, rst) {
        rpc.triggerEvent({ type: 'gsnevent:login-success', arg: rst.response });
      });

      $rootScope.$on('gsnevent:login-failed', function (evt, rst) {
        rpc.triggerEvent({ type: 'gsnevent:login-failed', arg: rst.response });
      });

      function getToken() {
        var rawToken = localStorage.getItem('gsnStorage-accessToken');
        return (typeof (rawToken) === 'string') ? angular.fromJson(rawToken) : {};
      }
    };
    
    return returnObj;
  }
})(window.Gsn, angular);