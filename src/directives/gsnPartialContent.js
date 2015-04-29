(function (angular, $, undefined) {
  'use strict';
  var myModule = angular.module('gsn.core');
  
  myModule.directive('gsnPartialContent', ['$timeout', 'gsnStore', 'gsnApi', function ($timeout, gsnStore, gsnApi) {
    // Usage:   allow for store specific partial content
    // 
    // Creates: 2015-02-26
    // 
    var directive = {
      link: link,
      restrict: 'EA',
      scope: true,
    };
    return directive;

    function link(scope, element, attrs) {
      scope.activate = activate;
      scope.notFound = false;
      scope.partialContents = [];
      scope.contentDetail = {
        url: gsnApi.isNull(attrs.gsnPartialContent.replace(/^\/+/gi, ''), '').replace(/[\-]/gi, ' '),
        name: '',
        subName: ''
      };
      var partialData = { ContentData: {}, ConfigData: {}, ContentList: [] };

      function activate() {
        // parse contentName by forward slash
        var contentNames = scope.contentDetail.url.split('/');
        if (contentNames.length > 1) {
          scope.contentDetail.subName = contentNames[1];
        }

        scope.contentDetail.name = contentNames[0];

        if (scope.contentDetail.url.indexOf('.aspx') > 0) {
          // do nothing for aspx page
          scope.notFound = true;
          return;
        }

        // attempt to retrieve static content remotely
        gsnStore.getPartial(scope.contentDetail.name).then(function (rst) {
          if (rst.success) {
            processData(rst.response);
          } else {
            scope.notFound = true;
          }
        });
      }

      scope.getContentList = function() {
        var result = [];
        if (partialData.ContentList) {
          for (var i = 0; i < partialData.ContentList.length; i++) {
            var data = result.push(gsnApi.parseStoreSpecificContent(partialData.ContentList[i]));
            if (data.Description) {
              if (gsnApi.isNull(scope.contentDetail.subName, 0).length <= 0) {
                result.push(data);
                continue;
              }

              if (angular.lowercase(data.Headline) == scope.contentDetail.subName || data.SortBy == scope.contentDetail.subName) {
                result.push(data);
              }
            }
          }
        }

        return result;
      };

      scope.getContent = function (index) {
        return result.push(gsnApi.parseStoreSpecificContent(partialData.ContentData[index]));
      };

      scope.getConfig = function (name) {
        return gsnApi.parseStoreSpecificContent(partialData.ConfigData[name]);
      };

      scope.getConfigDescription = function (name, defaultValue) {
        var resultObj = scope.getConfig(name).Description;
        return gsnApi.isNull(resultObj, defaultValue);
      };

      scope.activate();

      //#region Internal Methods        
      function processData(data) {
        partialData = gsnApi.parsePartialContentData(data);
        scope.partialContents = scope.getContentList();
      }
      //#endregion
    }
  }]);
})(angular);