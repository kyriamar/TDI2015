// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var mainapp = angular.module('starter', ['ionic', 'uiGmapgoogle-maps', 'ngCordova']);

mainapp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


mainapp.config(function(uiGmapGoogleMapApiProvider, $stateProvider, $urlRouterProvider) {

    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDh8jZ6jbQ7IUe0VaNRXbbYmtAOyyhE490',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'geometry',    
    });

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html'
        })
        .state('bluetooth', {
            url: '/bluetooth',
            templateUrl: 'templates/bluetooth.html',
            controller: 'BluetoothController'
        })
        .state('home', {
            url: "/home",
            templateUrl: "templates/home.html",
            controller: "HomeController"
        });
    $urlRouterProvider.otherwise('/login');
});