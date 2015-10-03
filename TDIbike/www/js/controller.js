angular.module('starter', ['ionic', 'uiGmapgoogle-maps', 'ngCordova'])
.controller('appController', ['$scope', 'uiGmapGoogleMapApi', '$cordovaGeolocation', '$cordovaDeviceMotion', 
	function($scope, uiGmapGoogleMapApi, $cordovaGeolocation, $cordovaDeviceMotion) {
	
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
					rutaGoogle.instrucciones.shift();				
					rutaGoogle.intermedios.shift();
					app.sendMessage(rutaGoogle.instrucciones[0]);
					//borrarMarcadoresInterm();
					
					// for (var j = 0; j < rutaGoogle.intermedios[0].length; j++){
					// 	var marker = new google.maps.Marker({
					// 		position: rutaGoogle.intermedios[0][j] ,
					// 		map: $scope.map.control.getGMap()
					// 	});
					// 	rutaGoogle.markersInterm.push(marker);
					// }	
				}else{
					//me quedan al menos dos puntos intermedios
					if (rutaGoogle.intermedios[0].length > 1){

						// var rectangle = new google.maps.Rectangle();	
						// // Get the current bounds, which reflect the bounds before the zoom.
					 //    rectangle.setOptions({
					 //      strokeColor: '#FF0000',
					 //      strokeOpacity: 0.8,
					 //      strokeWeight: 2,
					 //      fillColor: '#FF0000',
					 //      fillOpacity: 0.35,
					 //      map: $scope.map.control.getGMap(),
					 //      bounds: $scope.map.control.getGMap().getBounds()
					 //    });

					 //    var dentro = maps.geometry.poly.contaisLocation(posAct, rectangle);
						// console.log(dentro);


						// var poligono = new google.maps.Polyline({
						//     path: [
						//       rutaGoogle.intermedios[0][0],
						//       rutaGoogle.intermedios[0][1]
						//     ]
						//  });
						// poligono.setMap($scope.map.control.getGMap());
						// var dentro = maps.geometry.poly.isLocationOnEdge(posAct, poligono, 0.01);
						// console.log(dentro);
						// var distInt = maps.geometry.spherical.computeDistanceBetween(posAct,rutaGoogle.intermedios[0][1]);
						// if (distInt < 40) {
						// 	console.log("saque uno")
						// 	rutaGoogle.intermedios[0].shift();
						// 	rutaGoogle.markersInterm[0].setMap(null);
						// 	rutaGoogle.markersInterm.shift();
						// }else{
						// 	var distProx = maps.geometry.spherical.computeDistanceBetween(rutaGoogle.intermedios[0][0],rutaGoogle.intermedios[0][1]);
						// 	if (distInt>distProx && distProx>40){
						// 		//alert("te salite ruta")
						// 	}
					  }
					}
				//}					
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
				for (var j = 0; j < myRoute.steps[i].path.length; j++){
					rutaGoogle.intermedios[i][j] = myRoute.steps[i].path[j];
					if (i == 0){
						// var marker = new google.maps.Marker({
						// 	position: rutaGoogle.intermedios[i][j],
						// 	map: $scope.map.control.getGMap()
						// });
						// rutaGoogle.markersInterm.push(marker);
					}
				}	
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
}]);
