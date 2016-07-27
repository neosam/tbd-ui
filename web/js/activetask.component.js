//define([], function() {
(function() {
    angular.module('tbd')
        .directive('active', function() {
            return {
                restrict: "E",
                scope: {},
                templateUrl: 'html/activetask.html',
                controllerAs: 'mv',
                controller: function () {
                    var mv = this;
                    mv.entries = [
                        {title: "Klo putzen", deadline: "2016-12-12"},
                        {title: "Boden wischen", deadline: "2016-12-11"},
                        {title: "Game of Thrones schauen", deadline: "2016-11-30"},
                    ];
                }
            }
        });
 })();
//});