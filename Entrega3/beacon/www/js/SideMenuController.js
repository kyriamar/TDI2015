app.controller('SideMenuController',function($scope, $ionicSideMenuDelegate, $state){
	
	$scope.goToCuarto = function() {
		 $state.go('casa.cuarto');
	};

	$scope.goToBano = function() {
		 $state.go('casa.bano');
	};

	$scope.goToCocina = function() {
		 $state.go('casa.cocina');
	};

	$scope.goToBeacons = function() {
		 $state.go('casa.beacons');
	};

});