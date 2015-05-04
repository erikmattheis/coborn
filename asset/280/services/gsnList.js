(function (angular, undefined) {
  'use strict';
  var serviceId = 'gsnList';
  angular.module('gsn.core').factory(serviceId, ['$rootScope', '$http', 'gsnApi', '$q', '$sessionStorage', gsnList]);

  function gsnList($rootScope, $http, gsnApi, $q, $sessionStorage) {

    var betterStorage = $sessionStorage;
    
    // just a shopping list object
    function myShoppingList(shoppingListId, shoppingList) {
      var returnObj = { ShoppingListId: shoppingListId };
      var $mySavedData = { list: shoppingList, items: {}, hasLoaded: false, countCache: 0, itemIdentity: 1 };
      
      loadListFromSession();
      
      returnObj.getItemKey = function (item) {
        var itemKey = item.ItemTypeId;
        if (item.ItemTypeId == 7 || item.AdCode) {
          itemKey = item.AdCode + gsnApi.isNull(item.BrandName, '') + gsnApi.isNull(item.Description, '');
        }
        
        return itemKey + '_' + item.ItemId;
      };

      // replace local item with server item
      function processServerItem(serverItem, localItem) {
        if (serverItem) {
          var itemKey = returnObj.getItemKey(localItem);
          delete $mySavedData.items[itemKey];
          
          // set new server item order
          serverItem.Order = localItem.Order;

          // Add the new server item.
          $mySavedData.items[returnObj.getItemKey(serverItem)] = serverItem;

          // Since we are chainging the saved data, the count is suspect.
          $mySavedData.countCache = 0;
        }
      }

      returnObj.syncItem = function (itemToSync) {
        var existingItem = returnObj.getItem(itemToSync.ItemId, itemToSync.ItemTypeId) || itemToSync;
        if (existingItem != itemToSync) {
          existingItem.Quantity = itemToSync.Quantity;
        }

        if (parseInt(existingItem.Quantity) > 0) {
          // build new item to make sure posting of only required fields
          var itemToPost = angular.copy(existingItem);

          /* jshint -W069 */
          delete itemToPost['BarcodeImageUrl'];
          delete itemToPost['BottomTagLine'];
          delete itemToPost['Description1'];
          delete itemToPost['Description2'];
          delete itemToPost['Description3'];
          delete itemToPost['Description4'];
          delete itemToPost['EndDate'];
          delete itemToPost['ImageUrl'];
          delete itemToPost['SmallImageUrl'];
          delete itemToPost['StartDate'];
          delete itemToPost['TopTagLine'];
          delete itemToPost['TotalDownloads'];
          delete itemToPost['TotalDownloadsAllowed'];
          delete itemToPost['Varieties'];
          /* jshint +W069 */

          $rootScope.$broadcast('gsnevent:shoppinglistitem-updating', returnObj, existingItem, $mySavedData);

          gsnApi.getAccessToken().then(function () {

            var url = gsnApi.getShoppingListApiUrl() + '/UpdateItem/' + returnObj.ShoppingListId;
            var hPayload = gsnApi.getApiHeaders();
            hPayload.shopping_list_id = returnObj.ShoppingListId;
            $http.post(url, itemToPost, { headers: hPayload }).success(function (response) {
              if (response.Id) {
                processServerItem(response, existingItem);
              }
              
              $rootScope.$broadcast('gsnevent:shoppinglist-changed', returnObj);
              saveListToSession();
            }).error(function () {
              // reset to previous quantity on failure
              if (existingItem.OldQuantity) {
                existingItem.NewQuantity = existingItem.OldQuantity;
                existingItem.Quantity = existingItem.OldQuantity;
              }
            });
          });
        } else {
          returnObj.removeItem(existingItem);
        }

        $rootScope.$broadcast('gsnevent:shoppinglist-changed', returnObj);
        saveListToSession();
      };

      // add item to list
      returnObj.addItem = function (item, deferSync) {
        if (gsnApi.isNull(item.ItemId, 0) <= 0) {

          // this is to help with getItemKey?
          item.ItemId = ($mySavedData.itemIdentity++);
        }
        
        $mySavedData.countCache = 0;
        var existingItem = $mySavedData.items[returnObj.getItemKey(item)];

        if (gsn.isNull(existingItem, null) === null) {
          // remove any ties to existing shopping list
          delete item.Id;
          delete item.ShoppingListItemId;
          item.ShoppingListId = returnObj.ShoppingListId;

          existingItem = item;
          $mySavedData.items[returnObj.getItemKey(existingItem)] = existingItem;

        }
        else { // update existing item

          var newQuantity = gsnApi.isNaN(parseInt(item.Quantity), 1);
          var existingQuantity = gsnApi.isNaN(parseInt(existingItem.Quantity), 1);
          if (newQuantity > existingQuantity) {
            existingItem.Quantity = newQuantity;
          } else {
            existingItem.Quantity = existingQuantity + newQuantity;
          }
        }

        if (existingItem.IsCoupon) {

          // Get the temp quantity.
          var tmpQuantity = gsnApi.isNaN(parseInt(existingItem.Quantity), 0);

          // Now, assign the quantity.
          existingItem.Quantity = (tmpQuantity > 0) ? tmpQuantity : 1;
        }

        existingItem.Order = ($mySavedData.itemIdentity++);

        if (!gsnApi.isNull(deferSync, false)) {
          returnObj.syncItem(existingItem);
        }

        return existingItem;
      };

      returnObj.addItems = function (items) {
        var deferred = $q.defer();
        var toAdd = [];
        angular.forEach(items, function (v, k) {
          var rst = angular.copy(returnObj.addItem(v, true));
          toAdd.push(rst);
        });

        $rootScope.$broadcast('gsnevent:shoppinglistitems-updating', returnObj);

        $mySavedData.countCache = 0;
        gsnApi.getAccessToken().then(function () {

          var url = gsnApi.getShoppingListApiUrl() + '/SaveItems/' + returnObj.ShoppingListId;
          var hPayload = gsnApi.getApiHeaders();
          hPayload.shopping_list_id = returnObj.ShoppingListId;
          $http.post(url, toAdd, { headers: hPayload }).success(function (response) {
            $rootScope.$broadcast('gsnevent:shoppinglist-changed', returnObj);
            deferred.resolve({ success: true, response: response });
            saveListToSession();
          }).error(function () {
            deferred.resolve({ success: false, response: response });
          });
        });

        return deferred.promise;
      };

      // remove item from list
      returnObj.removeItem = function (inputItem, deferRemove) {
        var item = returnObj.getItem(inputItem);
        if (item) {
          item.Quantity = 0;
          delete $mySavedData.items[returnObj.getItemKey(item)];

          if (deferRemove) return returnObj;

          $mySavedData.countCache = 0;
          gsnApi.getAccessToken().then(function () {
            $rootScope.$broadcast('gsnevent:shoppinglist-item-removing', returnObj, item);

            var url = gsnApi.getShoppingListApiUrl() + '/DeleteItems/' + returnObj.ShoppingListId;
            var hPayload = gsnApi.getApiHeaders();
            hPayload.shopping_list_id = returnObj.ShoppingListId;
            $http.post(url, [item.Id || item.ItemId], { headers: hPayload }).success(function (response) {
              $rootScope.$broadcast('gsnevent:shoppinglist-changed', returnObj);
              saveListToSession();
            });
          });
        }

        return returnObj;
      };

      returnObj.removeItems = function (itemList) {
        var deferred = $q.defer();
        var toRemove = [];

        $mySavedData.countCache = 0;
        angular.forEach(itemList, function (v, k) {
          var key = returnObj.getItemKey(item);
          var listItem = returnObj.getItem(key);
          if (listItem) {
            toRemove.push(v.Id);
            item.Quantity = 0;
            delete $mySavedData.items[key];
          }
        });

        gsnApi.getAccessToken().then(function () {
          $rootScope.$broadcast('gsnevent:shoppinglist-items-removing', returnObj, item);

          var url = gsnApi.getShoppingListApiUrl() + '/DeleteItems/' + returnObj.ShoppingListId;
          var hPayload = gsnApi.getApiHeaders();
          hPayload.shopping_list_id = returnObj.ShoppingListId;
          $http.post(url, toRemove, { headers: hPayload }).success(function (response) {
            $rootScope.$broadcast('gsnevent:shoppinglist-changed', returnObj);
            deferred.resolve({ success: true, response: response });
            saveListToSession();
          }).error(function (response) {
            deferred.resolve({ success: false, response: response });
          });
        });

        return deferred.promise;
      };

      // get item by object or id
      returnObj.getItem = function (itemId, itemTypeId) {
        // just return whatever found, no need to validate item
        // it's up to the user to call isValidItem to validate
        var adCode, brandName, myDescription;
        if (typeof (itemId) == "object") {
          adCode = itemId.AdCode;
          brandName = itemId.BrandName;
          myDescription = itemId.Description;
          itemTypeId = itemId.ItemTypeId;
          itemId = itemId.ItemId;
        }
        
        var myItemKey = returnObj.getItemKey({ ItemId: itemId, ItemTypeId: gsnApi.isNull(itemTypeId, 8), AdCode: adCode, BrandName: brandName, Description: myDescription });
        return $mySavedData.items[myItemKey];
      };

      returnObj.isValidItem = function (item) {
        var itemType = typeof (item);

        if (itemType !== 'undefined' && itemType !== 'function') {
          return (item.Quantity > 0);
        }

        return false;
      };

      // return all items
      returnObj.allItems = function () {
        var result = [];
        var items = $mySavedData.items;
        angular.forEach(items, function (item, index) {
          if (returnObj.isValidItem(item)) {
            result.push(item);
          }
        });

        return result;
      };

      // get count of items
      returnObj.getCount = function () {
        if ($mySavedData.countCache > 0) return $mySavedData.countCache;
        
        var count = 0;
        var items = $mySavedData.items;
        angular.forEach(items, function(item, index) {
          if (returnObj.isValidItem(item)) {
            count += gsnApi.isNaN(parseInt(item.Quantity), 0);
          }
        });
        
        $mySavedData.countCache = count;
        return count;
      };

      // clear items
      returnObj.clearItems = function () {
        // clear the items
        $mySavedData.items = {};

        $mySavedData.countCache = 0;
        returnObj.saveChanges();
      };

      returnObj.getTitle = function () {
        return ($mySavedData.list) ? $mySavedData.list.Title : '';
      };

      returnObj.getStatus = function () {
        return ($mySavedData.list) ? $mySavedData.list.StatusId : 1;
      };

      // cause shopping list delete
      returnObj.deleteList = function () {
        // call DeleteShoppingList          

        $mySavedData.countCache = 0;
        gsnApi.getAccessToken().then(function () {

          var url = gsnApi.getShoppingListApiUrl() + '/Delete/' + returnObj.ShoppingListId;
          var hPayload = gsnApi.getApiHeaders();
          hPayload.shopping_list_id = returnObj.ShoppingListId;
          $http.post(url, {}, { headers: hPayload }).success(function (response) {
            // do nothing                      
            $rootScope.$broadcast('gsnevent:shoppinglist-deleted', returnObj);
            saveListToSession();
          });
        });

        return returnObj;
      };

      // save changes
      returnObj.saveChanges = function () {
        if (returnObj.savingDeferred) return returnObj.savingDeferred.promise;
        var deferred = $q.defer();
        returnObj.savingDeferred = deferred;

        $mySavedData.countCache = 0;
        var syncitems = [];

        // since we immediately update item with server as it get added to list
        // all we need is to send back the item id to tell server item still on list
        // this is also how we mass delete items
        var items = returnObj.allItems();
        angular.forEach(items, function (item) {
          syncitems.push(item.ItemId);
        });

        gsnApi.getAccessToken().then(function () {

          var url = gsnApi.getShoppingListApiUrl() + '/DeleteOtherItems/' + returnObj.ShoppingListId;
          var hPayload = gsnApi.getApiHeaders();
          hPayload.shopping_list_id = returnObj.ShoppingListId;
          $http.post(url, syncitems, { headers: hPayload }).success(function (response) {
            deferred.resolve({ success: true, response: returnObj });
            returnObj.savingDeferred = null;

            $rootScope.$broadcast('gsnevent:shoppinglist-changed', returnObj);
            saveListToSession();
          }).error(function (response) {
            deferred.resolve({ success: false, response: response });
            returnObj.savingDeferred = null;
          });
        });

        return deferred.promise;
      };

      // cause change to shopping list title
      returnObj.setTitle = function (title) {
        var deferred = $q.defer();

        $mySavedData.countCache = 0;
        gsnApi.getAccessToken().then(function () {

          var url = gsnApi.getShoppingListApiUrl() + '/Update/' + returnObj.ShoppingListId + '?title=' + encodeURIComponent(title);
          var hPayload = gsnApi.getApiHeaders();
          hPayload.shopping_list_id = returnObj.ShoppingListId;
          $http.post(url, {}, { headers: hPayload }).success(function (response) {
            deferred.resolve({ success: true, response: returnObj });
            $mySavedData.list.Title = title;

            // Send these two broadcast messages.
            $rootScope.$broadcast('gsnevent:shopping-list-saved');
            $rootScope.$broadcast('gsnevent:shoppinglist-changed', returnObj);
            saveListToSession();
          }).error(function (response) {
            console.log(returnObj.ShoppingListId + ' setTitle error: ' + response);
            deferred.resolve({ success: false, response: response });
          });
        });

        return deferred.promise;
      };

      returnObj.hasLoaded = function () {
        return $mySavedData.hasLoaded;
      };

      returnObj.getListData = function() {
        return angular.copy($mySavedData.list);
      };

      function saveListToSession() {
        betterStorage.currentShoppingList = $mySavedData;
      }

      function loadListFromSession() {
        var list = betterStorage.currentShoppingList;
        if (list && list.list && list.list.Id == shoppingListId) {
          $mySavedData.hasLoaded = list.hasLoaded;
          $mySavedData.items = list.items;
          $mySavedData.itemIdentity = list.itemIdentity;
          $mySavedData.countCache = list.countCache;
        }
      }


      function processShoppingList(result) {
        $mySavedData.items = {};

        angular.forEach(result, function (item, index) {
          item.Order = index;
          $mySavedData.items[returnObj.getItemKey(item)] = item;
        });

        $mySavedData.hasLoaded = true;
        $mySavedData.itemIdentity = result.length + 1;
        $rootScope.$broadcast('gsnevent:shoppinglist-loaded', returnObj, result);
        saveListToSession();
      }

      returnObj.updateShoppingList = function () {
        if (returnObj.deferred) return returnObj.deferred.promise;

        var deferred = $q.defer();
        returnObj.deferred = deferred;
        
        if (returnObj.ShoppingListId > 0) {
          if ($mySavedData.hasLoaded) {
            $rootScope.$broadcast('gsnevent:shoppinglist-loaded', returnObj, $mySavedData.items);
            deferred.resolve({ success: true, response: returnObj });
            returnObj.deferred = null;
          } else {

            $mySavedData.items = {};
            $mySavedData.countCache = 0;
            
            gsnApi.getAccessToken().then(function () {
              // call GetShoppingList(int shoppinglistid, int profileid)
              var url = gsnApi.getShoppingListApiUrl() + '/ItemsBy/' + returnObj.ShoppingListId + '?nocache=' + (new Date()).getTime();

              var hPayload = gsnApi.getApiHeaders();
              hPayload.shopping_list_id = returnObj.ShoppingListId;
              $http.get(url, { headers: hPayload }).success(function (response) {
                processShoppingList(response);
                $rootScope.$broadcast('gsnevent:shoppinglist-loaded', returnObj, $mySavedData.items);
                deferred.resolve({ success: true, response: returnObj });
                returnObj.deferred = null;
              }).error(function (response) {
                $rootScope.$broadcast('gsnevent:shoppinglist-loadfail', response);
                deferred.resolve({ success: false, response: response });
                returnObj.deferred = null;
              });
            });
          }
        }

        return deferred.promise;
      };

      return returnObj;
    }

    return myShoppingList;
  }
})(angular);