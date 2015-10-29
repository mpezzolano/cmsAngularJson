angular.module("app", ["ui.router", "ngMessages", "ngStorage"])

.config(function($stateProvider, $urlRouterProvider)
{
    $stateProvider
        .state("app", {
            abstract: true,
            templateUrl: "templates/navigation.html",
            controller: "navigationCtrl"
        })
        .state("app.dashboard", {
            url: "/dashboard",
            templateUrl: "templates/dashboard.html",
            controller: "dashboardCtrl",
            authenticate: true
        })
        .state("app.users", {
            url: "/users",
            templateUrl: "templates/user.html",
            controller: "usersCtrl",
            authenticate: true
        })
        .state("app.login", {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: "loginCtrl",
            authenticate: false
        })
        .state("app.countries",{
            url:"/countries",
            templateUrl:"templates/countries.html",
            controller:"countriesCtrl",
            authenticate: true
        })
    $urlRouterProvider.otherwise("/login");
})

.controller("navigationCtrl", function($scope, $state, Auth)
{
    $scope.$storage = Auth.getUser();

    $scope.logout = function()
    {
        Auth.logout();
        $state.go("app.login", {}, { reload:true});
    }
})

.controller("dashboardCtrl", function($scope, $state)
{

})

.controller("usersCtrl", function($scope, $state)
{

})

.controller("countriesCtrl", function($scope, $state, CountriesFactory)
{
    CountriesFactory.get().then(
        function(countries){
            $scope.countries = countries.data;
        },
        function(err){
            $scope.error = err.statusText;
        }
    )

})
.factory("CountriesFactory", function ($http){
        return {
            get: function () {
                return $http({
                    url: "countries.json",
                    method: "GET"
                });
            }
        }
})


.controller("loginCtrl", function($scope, $state, Auth)
{
    $scope.login = function(user)
    {
        Auth.setUser(user);
        $state.go("app.dashboard", {}, { reload: true });
    }
})

.service("Auth", function($localStorage)
{
    this.setUser = function(user)
    {
        $localStorage.user = angular.toJson(user);
    }
    this.getUser = function()
    {
        return angular.fromJson($localStorage.user);
    }
    this.isLoggedIn = function()
    {
        return $localStorage.user ? true : false;
    }
    this.logout = function()
    {
        delete $localStorage.user;
    }
})

.run(function($rootScope, $state, Auth)
{
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams)
    {
        if(Auth.isLoggedIn() && toState.name == "app.login")
        {
            event.preventDefault();
            $state.go(fromState.name);
        }

        if(toState.authenticate && !Auth.isLoggedIn())
        {
            event.preventDefault();
            $state.go("app.login");
        }
    })
})
