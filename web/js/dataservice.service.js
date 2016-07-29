(function() {
    angular.module("tbd")
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http'];

    function dataservice($http) {
        return {
            getActiveTasks: getActiveTasks
        };

        function getActiveTasks() {
            return $http.get('/active_tasks');
        }
    }

})()