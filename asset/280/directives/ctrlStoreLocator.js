(function (angular, undefined) {
  'use strict';

  var myDirectiveName = 'ctrlStoreLocator';

  angular.module('gsn.core')
    .controller(myDirectiveName, ['$scope', 'gsnApi', '$notification', '$timeout', '$rootScope', '$location', 'gsnStore', myController])
    .directive(myDirectiveName, myDirective);

  function myDirective() {
    var directive = {
      restrict: 'EA',
      scope: true,
      controller: myDirectiveName
    };

    return directive;
  }

  var loadingScript;

  function myController($scope, gsnApi, $notification, $timeout, $rootScope, $location, gsnStore) {

    $scope.activate = activate;

    
    var geocoder = new google.maps.Geocoder();
    var defaultZoom = $scope.defaultZoom || 10;

    $scope.fromUrl = $location.search().fromUrl;
    $scope.geoLocationCache = {};
    $scope.myMarkers = [];
    $scope.currentMarker = null;
    $scope.showIntermission = 0;
    $scope.distanceOrigin = null;
    $scope.storeList = gsnStore.getStoreList();
    $scope.currentStoreId = gsnApi.getSelectedStoreId();
    $scope.searchCompleted = false;
    $scope.searchRadius = 10;
    $scope.searchIcon = null;   // https://sites.google.com/site/gmapsdevelopment/
    $scope.searchMarker = null;
    $scope.searchFailed = false;
    $scope.searchFailedResultCount = 1;
    $scope.pharmacyOnly = false;

    $scope.mapOptions = {
      center: new google.maps.LatLng(0, 0),
      zoom: defaultZoom,
      circle: null,
      panControl: false,
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      scaleControl: true,
      navigationControl: false,
      streetViewControl: false,
      //styles: myStyles,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.openMarkerInfo = function (marker, zoom) {
      $scope.currentMarker = marker;

      if (zoom) {
        $scope.myMap.setZoom(zoom);
      }

      $scope.myInfoWindow.open($scope.myMap, marker);
    };

    $scope.isCurrentStore = function (marker) {
      if (!marker) return false;

      return gsnApi.isNull($scope.currentStoreId, 0) == marker.location.StoreId;
    };

    $scope.setSearchResult = function (center) {
      $scope.searchCompleted = true;
      $scope.distanceOrigin = gsnApi.isNull(center, null);
      $scope.mapOptions.center = center;
      $timeout(function () {
        $scope.showAllStores(center);

        if ($scope.searchIcon) {
          if (center) {
            $scope.searchMarker = new google.maps.Marker({
              map: $scope.myMap,
              position: center,
              point: center.toUrlValue(),
              location: null,
              icon: $scope.searchIcon
            });

            google.maps.event.addListener($scope.searchMarker, 'click', function () {
              $scope.openMarkerInfo($scope.searchMarker);
            });
          }
        }

        $scope.fitAllMarkers();
      }, 50);
    };

    $scope.initializeMarker = function (stores) {
      $scope.currentMarker = null;

      // clear old marker
      if ($scope.myMarkers) {
        angular.forEach($scope.myMarkers, function (marker) {
          marker.setMap(null);
        });
      }

      if ($scope.searchMarker) {
        $scope.searchMarker.setMap(null);
        $scope.searchMarker = null;
      }

      var data = stores || [];
      var tempMarkers = [];
      var endIndex = data.length;

      // here we test with setting a limit on number of stores to show
      // if (endIndex > 10) endIndex = 10;

      for (var i = 0; i < endIndex; i++) {
        if ($scope.canShow(data[i])) {
          tempMarkers.push($scope.createMarker(data[i]));
        }
      }

      if (gsn.isNull($scope.myMap, null) !== null && $scope.myMarkers.length > 0) {
        $scope.fitAllMarkers();
      }

      $scope.myMarkers = tempMarkers;
    };

    // find the best zoom to fit all markers
    $scope.fitAllMarkers = function () {
      if (gsnApi.isNull($scope.myMap, null) === null) {
        $timeout($scope.fitAllMarkers, 500);
        return;
      }

      $timeout(function () {
        if ($scope.myMarkers.length == 1) {
          $scope.mapOptions.center = $scope.myMarkers[0].getPosition();
          $scope.mapOptions.zoom = $scope.defaultZoom || 10;
          $scope.myMap.setZoom($scope.mapOptions.zoom);
          $scope.myMap.setCenter($scope.mapOptions.center);
          return;
        }

        // make sure this is on the UI thread
        var markers = $scope.myMarkers;
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
          bounds.extend(markers[i].getPosition());
        }

        if ($scope.searchMarker) {
          bounds.extend($scope.searchMarker.getPosition());
        }

        $scope.myMap.fitBounds(bounds);
      }, 20);
    };

    $scope.showAllStores = function (distanceOrigin) {
      $scope.distanceOrigin = gsnApi.isNull(distanceOrigin, null);
      $scope.mapOptions.zoom = defaultZoom;
      var result = $scope.storeList;
      var result2 = [];
      if (gsn.isNull($scope.distanceOrigin, null) !== null) {
        result = [];
        var searchRadius = parseFloat($scope.searchRadius);
        if (isNaN(searchRadius)) searchRadius = 10;

        // calculate distance from center
        angular.forEach($scope.storeList, function (store) {
          var storeLatLng = new google.maps.LatLng(store.Latitude, store.Longitude);
          store.Distance = google.maps.geometry.spherical.computeDistanceBetween(distanceOrigin, storeLatLng) * 0.000621371192;
          store.zDistance = parseFloat(gsnApi.isNull(store.Distance, 0)).toFixed(2);
          result2.push(store);
          if (store.Distance <= searchRadius) {
            result.push(store);
          }
        });

        gsnApi.sortOn(result2, "Distance");
        $scope.searchFailed = (result.length <= 0 && result2.length > 0);
        if ($scope.searchFailed) {
          for (var i = 0; i < $scope.searchFailedResultCount; i++) {
            result.push(result2[i]);
          }
        } else {
          gsnApi.sortOn(result, "Distance");
        }
      }

      $scope.initializeMarker(result);
    };

    $scope.canShow = function (store) {
      return !$scope.pharmacyOnly || $scope.pharmacyOnly && gsnApi.isNull(gsnApi.isNull(store.Settings[21], {}).SettingValue, '').length > 0;
    };

    $scope.doClear = function () {
      $scope.search.storeLocator = '';
      $scope.searchCompleted = false;
      $scope.showAllStores();
      $scope.fitAllMarkers();
    };

    $scope.doSearch = function (isSilent) {
      $scope.searchCompleted = false;
      $scope.searchFailed = false;
      var newValue = $scope.search.storeLocator;

      if (gsnApi.isNull(newValue, '').length > 1) {
        var point = $scope.geoLocationCache[newValue];

        if (point) {
          $scope.setSearchResult(point);
        } else {

          geocoder.geocode({ 'address': newValue }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              point = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
              $scope.geoLocationCache[newValue] = point;
              $scope.setSearchResult(point);
            } else {
              $notification.alert('Error searching for: ' + newValue);
            }
          });
        }
      } else if (!isSilent) {
        $notification.alert('Zip or City, State is required.');
      }
    };

    function activate() {
      gsnStore.getStore().then(function (store) {
        var show = gsnApi.isNull($location.search().show, '');
        if (show == 'event') {
          if (store) {
            $location.url($scope.decodeServerUrl(store.Settings[28].SettingValue));
          }
        }
      });
    }

    $scope.viewEvents = function (marker) {
      gsnApi.setSelectedStoreId(marker.location.StoreId);
      $location.path($scope.decodeServerUrl(marker.location.Settings[28].SettingValue));
    };

    $scope.viewSpecials = function (marker) {
      gsnApi.setSelectedStoreId(marker.location.StoreId);
      $location.url('/circular');
    };

    $scope.selectStore = function (marker, reload) {
      $scope.gvm.reloadOnStoreSelection = reload;
      gsnApi.setSelectedStoreId(marker.location.StoreId);
      if (gsnApi.isNull($location.search().show, '') == 'event') {
        $location.url($scope.decodeServerUrl(marker.location.Settings[28].SettingValue));
      }
      else if (gsnApi.isNull($location.search().fromUrl, '').length > 0) {
        $location.url($location.search().fromUrl);
      }
    };

    $scope.$on('gsnevent:store-persisted', function (evt, store) {
      if ($scope.gvm.reloadOnStoreSelection) {
        $scope.goUrl($scope.currentPath, '_reload');
      }
    });

    // wait until map has been created, then add markers
    // since map must be there and center must be set before markers show up on map
    $scope.$watch('myMap', function (newValue) {
      if (newValue) {
        if ($scope.storeList) {
          newValue.setCenter(new google.maps.LatLng($scope.storeList[0].Latitude, $scope.storeList[0].Longitude), defaultZoom);
          $scope.initializeMarker(gsnStore.getStoreList());

          if (gsnApi.isNull($scope.fromUrl, null) !== null && gsnApi.isNull(gsnApi.getSelectedStoreId(), 0) <= 0) {
            $scope.showIntermission++;
          }
        }
      }
    });

    $scope.$on('gsnevent:storelist-loaded', function (event, data) {
      gsnApi.reload();
    });

    $scope.$on('gsnevent:store-setid', function (event, result) {
      $scope.currentStoreId = gsnApi.getSelectedStoreId();
    });

    $scope.$watch('pharmacyOnly', function (event, result) {
      var newValue = $scope.search.storeLocator;
      if (gsnApi.isNull(newValue, '').length > 1) {
        $scope.doSearch(true);
      } else {
        $scope.showAllStores(null);
      }
    });

    $scope.activate();

    //#region Internal Methods

    // helper method to add marker to map
    // populate marker array and distance
    $scope.createMarker = function (location) {
      var point = new google.maps.LatLng(location.Latitude, location.Longitude);

      //location.Phone = location.Phone.replace(/\D+/gi, '');
      var marker = new google.maps.Marker({
        map: $scope.myMap,
        position: point,
        location: location
      });

      google.maps.event.addListener(marker, 'click', function () {
        $scope.openMarkerInfo(marker);
      });

      location.zDistance = parseFloat(gsnApi.isNull(location.Distance, 0)).toFixed(2);

      return marker;
    };
    //#endregion
  }

})(angular);
