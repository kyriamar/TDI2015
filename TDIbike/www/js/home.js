mainapp.controller("HomeController", function($scope, uiGmapGoogleMapApi, $cordovaGeolocation, $cordovaDeviceMotion, $rootScope, $ionicSideMenuDelegate) {
 	$rootScope.directions = {};
 	$scope.showFindButton = true;

	$scope.marker = {
		'coords': '0,0',
		'id': 1
	};

	$scope.map = { 
		control: {},
		center: { 
			latitude: -34.9040561, 
			longitude: -56.1710437 
		}, 
		zoom: 16, 
	};
    
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
					alert('No se pudo calcular una ruta, revisar direccion!');
				}
			});
		};

		var rutaGoogle = {
			markersMapa: [],
			puntos: [],
			instrucciones: [],
		};

		function getDistance(position){
			var posAct = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			if (rutaGoogle.puntos.length > 0){
				var dist = maps.geometry.spherical.computeDistanceBetween(posAct,rutaGoogle.puntos[0]);
				if (dist<40){					
					app.sendMessage(rutaGoogle.instrucciones[0]);
					rutaGoogle.puntos.shift();	
					rutaGoogle.instrucciones.shift();				
				}			
			}
		};

		//inicia los puntos que contienen instrucciones de maniobra
		function iniciarPuntosdeGiro(directionResult) {
			borrarMarcadores();
			rutaGoogle.puntos = [];
			rutaGoogle.intrucciones = [];
			var myRoute = directionResult.routes[0].legs[0];
			for (var i = 0; i < myRoute.steps.length; i++) {
				var marker = new google.maps.Marker({
					position: myRoute.steps[i].end_point,
					map: $scope.map.control.getGMap()
				});
				rutaGoogle.markersMapa.push(marker);
				rutaGoogle.puntos[i] = myRoute.steps[i].end_point;
				rutaGoogle.instrucciones[i] = myRoute.steps[i].maneuver;
			}
			//la primera no tiene instrucciones
			rutaGoogle.instrucciones.shift();
			rutaGoogle.instrucciones.push("llegaste");
		}

		//borra los marcadores cada vez que se busca una ruta
		function borrarMarcadores() {
		  for (var i = 0; i < rutaGoogle.markersMapa.length; i++ ) {
		    rutaGoogle.markersMapa[i].setMap(null);
		  }
		  rutaGoogle.markersMapa.length = 0;
		}

		var time1 = 0;
		var velini = 0;
		var estado = 1;

		function checkfreno(position){
			var diff = Math.abs(time1 - new Date(position.timestamp));
		  	if (diff>1){ //un segundo desde la lectura anterior
		  		var mps = 3.6;
		  		var kmh = position.coords.speed * mps;
		  		var deltavel = velini - kmh;
		  		if (estado == 1){
		  			if (deltavel > 10){ //la velocidad disminuyo
			  			estado = 2;
			  			app.sendMessage("brake-on");
			  		}  			
		  		}else{
		  			if ( deltavel>1 && deltavel < 4){ //la velocidad se mantuvo en estado frenando
		  				app.sendMessage("brake-off");
		   				estado =1;
		  			}
		  		}	  			
		  		velini = kmh;
		  		time1 = new Date(position.timestamp);
		  	}
		}

		
		var watchOptions = {timeout : 3000, enableHighAccuracy: true};

    	var watch = $cordovaGeolocation.watchPosition(watchOptions);

		watch.then(null, 
		  function(err) {
		    // error
		  },
		  function(position) {
		  	checkfreno(position);
		    $scope.map.center.latitude = position.coords.latitude;
	        $scope.map.center.longitude = position.coords.longitude;
	        getDistance(position);
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