mainapp.controller("HomeController", function($scope, uiGmapGoogleMapApi, $cordovaGeolocation, $cordovaDeviceMotion, $rootScope, $ionicSideMenuDelegate) {
 	$rootScope.directions = {};
 	$scope.showFindButton = true;
    // watch Acceleration
	var options = { frequency: 5000 };

    
    document.addEventListener('deviceready', onDeviceReady, false);
	function onDeviceReady() {
	    var watch = $cordovaDeviceMotion.watchAcceleration(options);
	    watch.then(
	      null,
	      function(error) {
	      // An error occurred
	      },
	      function(result) {
	        var X = result.x;
	        var Y = result.y;
	        console.log('aceleracion '+ X +', '+ Y);
	        var timeStamp = result.timestamp;
	    });
	}


	$scope.map = { 
		control: {},
		center: { 
			latitude: -34.9040561, 
			longitude: -56.1710437 
		}, 
		zoom: 16, 
	};

	$scope.marker = {
		'coords': '0,0',
		'id': 1
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
		   destStreet: "",
		   destIntersect: "",
		   showList: false
		}

		// get directions using google maps api
		$scope.getDirections = function () {
			var request = {
				origin: $scope.map.center.latitude + ',' + $scope.map.center.longitude,
				destination: $scope.directions.destStreet + ' esquina ' + $scope.directions.destIntersect + ', Montevideo',
				travelMode: google.maps.DirectionsTravelMode.DRIVING,
			};
			directionsService.route(request, function (response, status) {
				if (status === google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
					directionsDisplay.setMap($scope.map.control.getGMap());
					directionsDisplay.setPanel(document.getElementById('directionsList'));
					$scope.directions.showList = true;
					$rootScope.directions.showList = true;
					$scope.showBeginButton = true;
					iniciarPuntosdeGiro(response);
				} else {
					alert('Google route unsuccesfull!');
				}
			});
		};

		var rutaGoogle = {
			markersMapa: [],
			markersInterm: [],
			puntos: [],
			instrucciones: [],
			intermedios: []
		};

		var getDistance = function (position){
			var posAct = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			if (rutaGoogle.puntos.length > 0){

				var dist = maps.geometry.spherical.computeDistanceBetween(posAct,rutaGoogle.puntos[0]);
				if (dist<40){
					rutaGoogle.puntos.shift();
					alert(rutaGoogle.instrucciones[0]);
					app.sendMessage(rutaGoogle.instrucciones[0]);	
					rutaGoogle.instrucciones.shift();				
					rutaGoogle.intermedios.shift();
				}			
				return dist;
			}else{
				return -1
			}
		};

		function iniciarPuntosdeGiro(directionResult) {
			borrarMarcadores();
			rutaGoogle.puntos = [];
			rutaGoogle.intrucciones = [];
			rutaGoogle.intermedios = [];
			var myRoute = directionResult.routes[0].legs[0];
			console.log("distancia total " + myRoute.distance.text);
			for (var i = 0; i < myRoute.steps.length; i++) {
				var marker = new google.maps.Marker({
					position: myRoute.steps[i].end_point,
					map: $scope.map.control.getGMap()
				});
				rutaGoogle.markersMapa.push(marker);
				rutaGoogle.puntos[i] = myRoute.steps[i].end_point;
				rutaGoogle.instrucciones[i] = myRoute.steps[i].maneuver;
				rutaGoogle.intermedios[i] = [];
				console.log(myRoute.steps[i].path);
			}
			//la primera no tiene instrucciones
			rutaGoogle.instrucciones.shift();
			rutaGoogle.instrucciones.push("llegaste");
		}

		function borrarMarcadores() {
		  for (var i = 0; i < rutaGoogle.markersMapa.length; i++ ) {
		    rutaGoogle.markersMapa[i].setMap(null);
		  }
		  rutaGoogle.markersMapa.length = 0;
		  borrarMarcadoresInterm()
		}

		function borrarMarcadoresInterm() {
		  for (var i = 0; i < rutaGoogle.markersInterm.length; i++ ) {
		    rutaGoogle.markersInterm[i].setMap(null);
		  }
		  rutaGoogle.markersInterm.length = 0;
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

	$scope.begin = function(){
		$scope.showBeginButton = false;
		$scope.showFindButton = false;
	};

	$scope.openDirections = function(){
		$ionicSideMenuDelegate.toggleRight();
	}
});