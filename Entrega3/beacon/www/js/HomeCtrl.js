app.controller('HomeCtrl',function($rootScope, $scope, $state, $interval, $ionicModal, $stateParams){
	$scope.toggle = false;

	var template = "modal" + ($stateParams.room).replace(/(ñ)/gi,'n') + ".html";
	$ionicModal.fromTemplateUrl(template, function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });  

	$scope.res = [];
	
	stop = $interval(function() {
		var obj= {}
	    for (var key in $rootScope.beacons) {
		  if ($rootScope.beacons.hasOwnProperty(key)) {
		  	var objkey = "beacon_" + $rootScope.beacons[key].minor;
		  	obj[objkey] = $rootScope.beacons[key].rssi;
		  }
		}
		
		$scope.res.push(obj);

	}, 1000);

	$scope.toggleOffOn = function() {
		if ($scope.toggle) {
			$rootScope.messageClient.send("tdi/home/messages", "1");
		}else {
			$rootScope.messageClient.send("tdi/home/messages", "0");
		}
		$scope.toggle = !$scope.toggle;
	}

	$scope.salir = function(){
		$scope.modal.hide();
		$interval.cancel(stop);
		var nombre = $stateParams.room.toLowerCase().replace(/(ñ)/gi,'n');
		window.localStorage.setItem(nombre, JSON.stringify($scope.res));
		infoBeacons[nombre] = JSON.parse(window.localStorage.getItem(nombre));
	}

});