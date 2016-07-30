(function() {
    angular.module("tbd")
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http'];

    function dataservice($http) {
        return {
            getActiveTasks: getActiveTasks,
            addActiveTask: addActiveTask,

            getPooledTasks: getPooledTasks,
            addPooledTask: addPooledTask
        };

        function getActiveTasks() {
            return $http.get('/active_tasks');
        }

        function addActiveTask(aTask) {
            return $http.post('/add_active_task', aTask);
        }


        function getPooledTasks() {
            return $http.get('/pooled_tasks');
        }
        function addPooledTask(pTask) {
            return $http.post('/add_pooled_task', pTask);
        }
    }

})()