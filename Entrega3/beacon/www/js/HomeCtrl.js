app.controller('HomeCtrl',function($rootScope, $scope, $state, $interval, $ionicModal, $stateParams,$ionicPlatform,$storageService){

	//bring the rooms from Storage
	  $ionicPlatform.ready(function() {
	    $scope.roomsList = $storageService.getObject('roomsList');
	    if (!$scope.roomsList.length){
	       $scope.roomsList = [];
	    }
	    
	  });


	var template = "modal" + $stateParams.room + ".html"
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

	    for (var key in $rootScope.beacons) {
		  if ($rootScope.beacons.hasOwnProperty(key)) {
		  	var objkey = "beacon_" + $rootScope.beacons[key].minor;
		  	var obj = {
		  		objkey : $rootScope.beacons[key].rssi
		  	}

		    $scope.res.push(obj);
		  }
		}

	}, 1000);


	$scope.salir = function(){
		$scope.modal.hide();
		$interval.cancel(stop);
		window.localStorage.setItem($stateParams.room, $scope.res);

		var toShow = window.localStorage.getItem($stateParams.room);

		alert(JSON.stringify(toShow));
	}

});