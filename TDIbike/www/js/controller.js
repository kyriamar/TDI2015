angular.module('starter', ['ionic', 'uiGmapgoogle-maps', 'ngCordova'])
.controller('appController', ['$scope', 'uiGmapGoogleMapApi', '$cordovaGeolocation', 
	function($scope, uiGmapGoogleMapApi, $cordovaGeolocation) {
	
	$scope.map = { 
		control: {},
		center: { 
			latitude: -34.9040561, 
			longitude: -56.1710437 
		}, 
		zoom: 16, 
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
				origin: $scope.map.center.latitude + ',' + $scope.map.center.longitude,
				destination: $scope.directions.destination,
				travelMode: google.maps.DirectionsTravelMode.DRIVING,
			};
			directionsService.route(request, function (response, status) {
				if (status === google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
					directionsDisplay.setMap($scope.map.control.getGMap());
					directionsDisplay.setPanel(document.getElementById('directionsList'));
					$scope.directions.showList = true;
					iniciarPuntosdeGiro(response);
				} else {
					alert('Google route unsuccesfull!');
				}
			});
		};

		var markerArray = [];
		var instrucciones = [];

		var getDistance = function (position){
			var desde = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			if (markerArray.length > 0){
				var dist = maps.geometry.spherical.computeDistanceBetween (desde,markerArray[0]);
				if (dist<40){
					markerArray.shift();
					alert(instrucciones[0]);
					instrucciones.shift();
				}
				return dist;
			}else{
				return -1
			}
		};

		function iniciarPuntosdeGiro(directionResult) {

		  var myRoute = directionResult.routes[0].legs[0];
		  console.log("distancia total " + myRoute.distance.text);
		  for (var i = 0; i < myRoute.steps.length; i++) {
		      var marker = new google.maps.Marker({
		        position: myRoute.steps[i].end_point,
		        map: $scope.map.control.getGMap()
		      });
		      markerArray[i] = myRoute.steps[i].end_point;
		      instrucciones[i] = myRoute.steps[i].maneuver;
		      console.log(myRoute.steps[i].end_point);
		      console.log(myRoute.steps[i].path);
		      console.log(myRoute.steps[i].maneuver);
		  }
		}

		var watchOptions = {timeout : 3000, enableHighAccuracy: true};

    	var watch = $cordovaGeolocation.watchPosition(watchOptions);

		watch.then(null, 
		  function(err) {
		    // error
		  },
		  function(position) {
		  	console.log('Your position changed');
		    $scope.map.center.latitude = position.coords.latitude;
	        $scope.map.center.longitude = position.coords.longitude;
	        var d = getDistance(position);
	        console.log("estas a " + d + " metros");

	        $scope.marker = {
	          'coords': angular.copy($scope.map.center),
	          'id': 1
	        };
		});

	});
}]);
