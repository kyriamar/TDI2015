app.controller('DebugCtrl', function($scope, $ionicHistory){

	$scope.clear = function(){
	alert("hola");
	window.localStorage.clear();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    
	 };

	 $scope.infob = infoBeacons;
});