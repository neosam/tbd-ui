//define([], function() {
(function() {
    angular.module('tbd')
        .directive('log', Log);

    Loo.$inject = ['dataservice']

    function Log(dataservice) {
        return {
            restrict: "E",
            scope: {},
            templateUrl: 'html/log.html',
            controllerAs: 'mv',
            controller: function () {
                var mv = this;
                mv.entries = [];

                loadLog();


                function loadLog() {
                    dataservice.getLog()
                        .then(handleLogLoad)
                        .catch(handleLogLoadFailed);
                }



                function handleLogLoad(data) {
                    mv.entries = data.data;
                }
                function handleLogLoadFailed() {
                    console.log("Error when loading log");
                }
            }
        }
    }

 })();
//});