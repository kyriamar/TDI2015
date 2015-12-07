var app = angular.module('starter', ['ionic', 'ngCordovaBeacon']);
 
app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('config', {
    url: '/config',
    templateUrl: 'templates/config.html',
    controller: 'ConfigCtrl'
  })
  .state('detect', {
    url: '/detect',
    templateUrl: 'templates/configDetect.html',
  })
  .state('inicio', {
    url: '/inicio',
    templateUrl: 'templates/inicio.html',
  })
  .state('casa', {
    url: '/casa',
    templateUrl: 'templates/casa.html',
    abstract:true,
    controller: 'BeaconCtrl'
  })
  .state('casa.cocina', {
    url: '/cocina',
    templateUrl: 'templates/cocina.html',
    controller: 'HomeCtrl',
    params: {
        room: "Cocina"
      }
  })

  .state('casa.cuarto', {
      url: '/cuarto',
      templateUrl: 'templates/cuarto.html',
      params: {
        room: "Cuarto"
      },
      controller: 'HomeCtrl'
      
    })

  .state('casa.bano', {
      url: '/bano',
      templateUrl: 'templates/bano.html',
      params: {
        room: "Baño"
      },
      controller: 'HomeCtrl'
    })

  .state('casa.beacons', {
      url: '/beacons',
      templateUrl: 'templates/beacons.html',
      controller: 'DebugCtrl'
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/config');

});

app.run(function($rootScope, $ionicPlatform, $cordovaBeacon) {
    $rootScope.beacons = {};
    $rootScope.predecir = false;

    $ionicPlatform.ready(function() {
 
        $cordovaBeacon.requestWhenInUseAuthorization();
 
        $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, pluginResult) {
            var uniqueBeaconKey;
            for(var i = 0; i < pluginResult.beacons.length; i++) {
                uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;
                $rootScope.beacons[uniqueBeaconKey] = pluginResult.beacons[i];
            }
            $rootScope.$apply();
        });
 
        $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion("tdi", "2F234454-CF6D-4A0F-ADF2-F4911BA9FFA6"));
 
    });
});