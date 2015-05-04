(function (angular, undefined) {
  'use strict';

  var myDirectiveName = 'ctrlRecipe';

  angular.module('gsn.core')
    .controller(myDirectiveName, ['$scope', 'gsnStore', 'gsnApi', '$location', '$window', '$timeout', 'gsnProfile', myController])
    .directive(myDirectiveName, myDirective);

  function myDirective() {
    var directive = {
      restrict: 'EA',
      scope: true,
      controller: myDirectiveName
    };

    return directive;
  }

  function myController($scope, gsnStore, gsnApi, $location, $window, $timeout, gsnProfile) {
    $scope.activate = activate;
    $scope.addSelectedIngredients = addSelectedIngredients;
    $scope.selectAllIngredients = selectAllIngredients;
    $scope.vm = {
      recipe: {},
      recipeRating: { myRating: -1 },
      savedRecipe: { RecipeInfo: {} }
    };
    $scope.recipeId = ($location.search().id || 'featured').toLowerCase();
    $scope.recipeQuantity = null;

    function activate() {
      if ($scope.recipeId == 'featured' || $scope.recipeId === '') {
        if ($scope.currentPath.indexOf('featured') < 0) {
          $scope.goUrl('/recipe/featured');
          return;
        }
      }

      var myFunction = gsnStore.getFeaturedRecipe();
      if ($scope.recipeId != 'featured') {
        myFunction = gsnStore.getRecipe($scope.recipeId);
      }

      myFunction.then(function (result) {
        if (result.success) {
          $scope.vm.recipe = result.response;

          $scope.nutrients = gsnApi.mapObject($scope.vm.recipe.Nutrients, 'Description');
          // caculate recipe rating
          var ratingTotal = 0;
          $scope.vm.recipeRating.userCount = $scope.vm.recipe.Ratings.length;
          $scope.vm.recipeRating.rating = 0;
          var myProfileId = gsnApi.getProfileId();
          if ($scope.vm.recipeRating.userCount > 0) {
            angular.forEach($scope.vm.recipe.Ratings, function (item) {
              ratingTotal += item.Rating;
              if (myProfileId == item.ConsumerId) {
                $scope.vm.recipeRating.myRating = item.Rating;
              }
            });

            $scope.vm.recipeRating.rating = Math.round(ratingTotal / $scope.vm.recipeRating.userCount);
          }

          if ($scope.currentPath.indexOf('print') > 0) {
            $timeout(function () {
              $window.print();
            }, 1000);
          }
        }
      });

      myFunction.then(function (result) {
        if (result.success) {
          $scope.vm.savedRecipe = result.response[0];
        }
      });

    }

    $scope.doSaveRecipe = function (item) {
      gsnProfile.saveRecipe($scope.vm.recipe.RecipeId, item.Comment);
      $scope.$emit('gsnevent:closemodal');
    };

    $scope.$watch("vm.recipeRating.myRating", function (newValue, oldValue) {
      if (newValue > 0) {
        gsnProfile.rateRecipe($scope.vm.recipe.RecipeId, newValue);
      }
    });

    $scope.activate();

    //#region Internal Methods
    function addSelectedIngredients() {
      var toAdd = [];
      angular.forEach($scope.vm.recipe.Ingredients, function (v, k) {
        if (v.selected) {
          if (v.Quantity > 0) {
            v.Quantity = Math.round(v.Quantity + 0.4);
          } else {
            v.Quantity = 1;
          }

          if (gsnApi.isNull($scope.recipeQuantity, null) !== null) {
            v.Quantity = $scope.recipeQuantity;
          }

          toAdd.push(v);
        }
      });

      gsnProfile.addItems(toAdd);
    }

    function selectAllIngredients() {
      angular.forEach($scope.vm.recipe.Ingredients, function (item) {
        item.selected = true;
      });
    }
    //#endregion
  }

})(angular);
