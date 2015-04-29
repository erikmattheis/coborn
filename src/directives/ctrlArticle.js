(function (angular, undefined) {
  'use strict';

  var myDirectiveName = 'ctrlArticle';

  angular.module('gsn.core')
    .controller(myDirectiveName, ['$scope', 'gsnStore', 'gsnApi', '$location', myController])
    .directive(myDirectiveName, myDirective);

  function myDirective() {
    var directive = {
      restrict: 'EA',
      scope: true,
      controller: myDirectiveName
    };

    return directive;
  }

  function myController($scope, gsnStore, gsnApi, $location) {
    $scope.activate = activate;

    function activate() {
      gsnStore.getArticle($location.search().id).then(function (result) {
        if (result.success) {
          $scope.article = result.response;
        }
      });
    }

    $scope.activate();
    //#region Internal Methods

    //#endregion
  }
})(angular);
