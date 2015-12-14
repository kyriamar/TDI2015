app.controller('DevicesCtrl',function($scope, $state, $rootScope){
	// constants
	var mqttBrokerURI      = "wss://m11.cloudmqtt.com:37451/";
	var mqttClientName     = "browser-" + (new Date().getTime());
	var mqttUsername       = "irxannry";
	var mqttPassword       = "LpAOhyNwQktz";
	var mqttTopic          = "/tdi/home/config";
	var handshake          = false;
	$rootScope.devices = [];
	client = new Paho.MQTT.Client(mqttBrokerURI, mqttClientName);

	// set callback handlers
	client.onMessageArrived = onMessageArrived;

	// connect the client
	client.connect({
		userName: mqttUsername,
		password: mqttPassword,
		onSuccess: onConnect
	});

	// called when the client connects
	function onConnect() {
		client.send(mqttTopic, "handshake");
		client.subscribe(mqttTopic);
		
		
	}

	function onMessageArrived(message) {
		alert(message.payloadString);
		$rootScope.devices.push(message.payloadString);
	}

	$scope.gotoInicio = function() {
		client.disconnect();
		$state.go('inicio');

	}

});