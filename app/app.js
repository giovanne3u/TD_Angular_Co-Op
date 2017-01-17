var app = angular.module("coop", ["ngResource", 'ngRoute']);
app.constant('api', {'key': '4cfd432d26a045708e852568197c7956', 'url': 'http://coop.api.netlor.fr/api'});

app.config(['$httpProvider', "api", 'TokenServiceProvider',  function ($httpProvider, api, TokenServiceProvider) {
    $httpProvider.defaults.headers.common.Authorization = 'Token token=' + api.key;

    $httpProvider.interceptors.push(['TokenService', function(TokenService) {
        return {
            request: function(config){
                var token = TokenService.getToken();
                if (token != "" )
                    config.url += ((config.url.indexOf('?') >=0) ? '&' : '?') + 'token=' + token;
                return config;
            }
        }
    }])
}]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'templates/login.html',
        controller: 'StartController'
    });

    $routeProvider.when('/channel/:id', {
        templateUrl: 'templates/channel.html',
        controller: 'channelController'
    });

    $routeProvider.when('/channels', {
        templateUrl: 'templates/channels.html',
        controller: 'channelsController'
    });

    $routeProvider.when('/register', {
        templateUrl: 'templates/register.html',
        controller: 'registerController'
    });
}]);

app.factory('Member', ['$resource', 'api', function ($resource, api) {
    return $resource(api.url + "/members/:id", {id: '@_id'},
        {
            update: {method: "PUT"},
            signin: {method: "POST", url: api.url + "/members/signin"}
        });
}]);

app.factory('Channels', ['$resource', 'api', function($resource, api){
  return $resource(api.url + "/channels/:id", {id: "@_id"},
      {
        delete : {method : "DELETE", url : api.url + "/channels/:id"}
      });
}]);

app.service('TokenService', [function() {
    this.token = "";
    this.setToken = function(t) {
        this.token = t;
    }
    this.getToken = function() {
        return this.token;
    }
}]);


app.controller("StartController", ['$resource', "$scope", "$location", 'Member', 'TokenService', function ($resource, $scope, $location, Member, TokenService) {

    $scope.members = Member.query(function (m) {
            console.log(m);
        },
        function (error) {
            console.log(error);
        }
    );

    $scope.redirectRegister = function(){
      $location.path('/register');
      $location.replace();
    }

    // $scope.ajoutMembre = function(){
    //   $scope.newMember = new Member({
    //       fullname: $scope.member.fullname,
    //       email:  $scope.member.email,
    //       password: $scope.member.pass,
    //   });
    //   $scope.newMember.$save(function(success){
    //     console.log(success);
    //    },
    //      function(error){
    //      console.log(error);
    //    }
    //   );
    // }

    $scope.loginMembre = function(){
      $scope.member = Member.signin({
        email : $scope.member.email,
        password : $scope.member.pass,
      },
      function (m) {
          $scope.member = m;
          console.log($scope.member);
          TokenService.setToken($scope.member.token);
          localStorage.setItem("token", TokenService.getToken());
          localStorage.setItem("id", $scope.member._id);
          $scope.member = Member.query(function(member) {});
          $location.path('/channels');
          $location.replace();
      },
      function (e) {
          console.log(e);
      }
  )}

}]);

app.controller('registerController', ['$resource', '$scope', 'Member', function($resource, $scope, Member){

  $scope.ajoutMembre = function(){
    $scope.newMember = new Member({
        fullname: $scope.member.fullname,
        email:  $scope.member.email,
        password: $scope.member.pass,
    });
    $scope.newMember.$save(function(success){
      console.log(success);
     },
       function(error){
       console.log(error);
     }
    );
  }

}]);

app.controller('channelsController', ['$resource', '$scope', 'Channels', function($resource, $scope, Channels){
  $scope.channels = Channels.query(
    function(success){

    },
    function(error){
      console.log(error);
    });

    $scope.createChannel = function(){
      $scope.newChannel = new Channels({
        label: $scope.channel.label,
        topic: $scope.channel.topic,
      });
      $scope.newChannel.$save(function(success){

      },
      function(error){
        console.log(error);
      });
    }
}]);
