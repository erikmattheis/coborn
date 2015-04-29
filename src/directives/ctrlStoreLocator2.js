var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope) {
  //array of things to load
  $scope.lazyThings = [
    {directive:'my-foo-directive', file:'foo.js'}  
  ];
  $scope.loaded = [];
  $scope.load = function() {
    var loadIndex = $scope.loaded.length;
    if ($scope.lazyThings[loadIndex]) {
      $scope.loaded.push($scope.lazyThings[loadIndex]);
    }
  }
});

app.factory('myService', function($http) {
  return {
    getJs: function(path) {

      return $http.get(path).then(function(response) {
        deferred.resolve(response.data);
      });

    }
  }
});

//this adds an attribute to kick off the directive 
//for whatever script was lazy loaded
app.directive('lazy', function($compile, $q, myService) {
  var directiveReturn = {
    restrict: 'A',
    scope: {
      lazy: '='
    },
    link: function(scope, element) {
      myService.getJs(scope.lazy.file).then(function(data) {
        return addScript(scope.lazy.file, data, scope);
      }).then(function() {
        var $span = angular.element('<span></span>').attr(scope.lazy.directive, '');
        $compile($span)(scope);
        element.append($span);
      });
    }
  }

  var scriptPromises = {};
  function addScript(file, js, scope) {
    if (!scriptPromises[file]) { //if this controller hasn't already been loaded
      var deferred = $q.defer();
      //cache promise)
      scriptPromises[file] = deferred.promise;

      //inject js into a script tag
      var script = document.createElement('script');
      script.src = 'data:text/javascript,' + encodeURI(js);
      script.onload = function() {
        //now the script is ready for use, resolve promise to add the script's directive element
        scope.$apply(deferred.resolve());
      };
      document.body.appendChild(script);
      return deferred.promise;
    }
    else { //this script has been loaded before
      return scriptPromises[loadFile]; //return the resolved promise from cache
    }
  }

  return directiveReturn;
});

app.directive('myFooDirective', function() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      //put the logic from your lazy loaded "foo.js" script here
      element.text(foo.someFunction());
    }
  }
});