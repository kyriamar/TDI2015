app.controller('ConfigCtrl',function($ionicPlatform,$cordovaBeacon){

	//bring the rooms from Storage
	  $ionicPlatform.ready(function() {
	  	$cordovaBeacon.isBluetoothEnabled().then(function(isEnabled) {
	        if(!isEnabled) {
	          alert("Por favor habilita tu bluetooth antes de continuar")
	          $cordovaBeacon.locationManager.enableBluetooth();
	        }
      	});
	  });
});