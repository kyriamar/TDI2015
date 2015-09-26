angular.module('starter', ['ionic', 'uiGmapgoogle-maps', 'ngCordova'])
.controller('appController', ['$scope', 'uiGmapGoogleMapApi', '$cordovaGeolocation', 
	function($scope, uiGmapGoogleMapApi, $cordovaGeolocation) {
	
	$scope.map = { 
		control: {},
		center: { 
			latitude: -34.9040561, 
			longitude: -56.1710437 
		}, 
		zoom: 13, 
	};

	var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
    	.getCurrentPosition(posOptions).then(function (position) {
          $scope.map.center.latitude = position.coords.latitude;
          $scope.map.center.longitude = position.coords.longitude;

          $scope.marker = {
          	'coords': angular.copy($scope.map.center),
          	'id': 1
          };
      }, function(err) {
         alert("You must set geolocation persmissions");
    });

    var watchOptions = {timeout : 3000, enableHighAccuracy: false};

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
	watch.then(null, 
	  function(err) {
	    // error
	  },
	  function(position) {
	  	console.log('Your position changed');
	    $scope.map.center.latitude = position.coords.latitude;
        $scope.map.center.longitude = position.coords.longitude;

        $scope.marker = {
          'coords': angular.copy($scope.map.center),
          'id': 1
        };
	});
  	

	uiGmapGoogleMapApi.then(function(maps) {
		// instantiate google map objects for directions
		var directionsDisplay = new maps.DirectionsRenderer();
		var directionsService = new maps.DirectionsService();

			// directions object -- with defaults
		$scope.directions = {
		   origin: "",
		   destination: "",
		   showList: false
		}

		// get directions using google maps api
		$scope.getDirections = function () {
			var request = {
				origin: $scope.directions.origin,
				destination: $scope.directions.destination,
				travelMode: google.maps.DirectionsTravelMode.DRIVING
			};
			directionsService.route(request, function (response, status) {
				if (status === google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
					directionsDisplay.setMap($scope.map.control.getGMap());
					directionsDisplay.setPanel(document.getElementById('directionsList'));
					$scope.directions.showList = true;
					} else {
						alert('Google route unsuccesfull!');
					}
			});
		}
	});
}]);
