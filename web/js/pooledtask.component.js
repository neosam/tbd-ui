//define([], function() {
(function() {
    angular.module('tbd')
        .directive('pooled', function() {
            return {
                restrict: "E",
                scope: {},
                templateUrl: 'html/pooledtask.html',
                controllerAs: 'mv',
                controller: function () {
                    var mv = this;
                    mv.entries = [
                        {title: "Klo putzen", daysToComplete: 3, propability: 0.7, coolDown: 4},
                        {title: "Boden wischen", daysToComplete: 14, propability: 0.4, coolDown: 14},
                        {title: "Game of Thrones schauen", daysToComplete: 1, propability: 1, coolDown: 0},
                    ];
                }
            }
        });
 })();
//});