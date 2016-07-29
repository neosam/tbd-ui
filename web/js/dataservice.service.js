(function() {
    angular.module("tbd")
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http'];

    function dataservice($http) {
        return {
            getActiveTasks: getActiveTasks,
            addActiveTask: addActiveTask
        };

        function getActiveTasks() {
            return $http.get('/active_tasks');
        }

        function addActiveTask(aTask) {
            return $http.post('/add_active_task', aTask);
        }
    }

})()