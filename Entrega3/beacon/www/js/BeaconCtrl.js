var infoBeacons= {
	'cocina': JSON.parse(window.localStorage.getItem('cocina')),
	'cuarto': JSON.parse(window.localStorage.getItem('cuarto')),
	'bano': JSON.parse(window.localStorage.getItem('bano'))
}

app.controller('BeaconCtrl',function($rootScope, $scope, $state, $interval){ 
	// constants
	var mqttBrokerURI      = "wss://m11.cloudmqtt.com:37451/";
	var mqttClientName     = "browser-" + (new Date().getTime());
	var mqttUsername       = "irxannry";
	var mqttPassword       = "LpAOhyNwQktz";
	var mqttTopic          = "/tdi/home/messages";
	var handshake          = false;

	$rootScope.messageClient = new Paho.MQTT.Client(mqttBrokerURI, mqttClientName);

	// connect the client
	$rootScope.messageClient.connect({
		userName: mqttUsername,
		password: mqttPassword,
		onSuccess: onConnect
	});

	// called when the client connects
	function onConnect() {
		console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@connect");
	}

	$scope.gotoInicio = function() {
		$state.go('inicio');

	}

	var nb = new NaiveBayes();
	var obj, key, prediction;
	var nbstop = $interval(function(){
		if ($rootScope.predecir){
			nb.data = [];
			datosCocina = infoBeacons['cocina'];
			datosCuarto = infoBeacons['cuarto'];
			datosBano = infoBeacons['bano'];
			
			datosCocina.forEach(function(d){
				nb.train(d, 'cocina');
			});

			datosCuarto.forEach(function(d){
				nb.train(d, 'cuarto');
			});

			datosBano.forEach(function(d){
				nb.train(d, 'bano');
			});

			beaconList = Object.keys($rootScope.beacons);
			obj = {};


			beaconList.forEach(function(b){
				key = "beacon_"+$rootScope.beacons[b].minor; 
				obj[key] = $rootScope.beacons[b].rssi;
			});

			prediction = nb.classify(obj).className;

		
			switch(prediction) {
				case 'bano': $state.go('casa.bano'); break;
				case 'cuarto': $state.go('casa.cuarto'); break;
				case 'cocina': $state.go('casa.cocina'); break;
			}
		}
	},2000);

});