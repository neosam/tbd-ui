//define([], function() {
(function() {
    angular.module('tbd')
        .directive('pooled', PooledTask);

    PooledTask.$inject = ['dataservice'];
    console.log("waa");

    function PooledTask(dataservice) {
        console.log("boo");
        return {
            restrict: "E",
            scope: {},
            templateUrl: 'html/pooledtask.html',
            controllerAs: 'mv',
            controller: function () {
                var mv = this;
                mv.entries = [];
                mv.add_task = {
                    title: '',
                    description: '',
                    factor: 1.0,
                    propability: 0.5,
                    cool_down: 3,
                    due_days: 3
                };
                mv.addPooledTask = addPooledTask;

                dataservice.getPooledTasks()
                    .then(handlePooledTasks)
                    .catch(handlePooledTasksFailed);


                function handlePooledTasks(data) {
                    mv.entries = data.data;
                }
                function handlePooledTasksFailed() {
                    console.log("Error loading pooled tasks");
                }

                function addPooledTask() {
                    dataservice.addPooledTask(mv.add_task)
                        .then(handleAddPooledTaskSuccess)
                        .catch(handleAddPooledTaskFail);

                    function handleAddPooledTaskSuccess() {
                        console.log("success");
                    }
                    function handleAddPooledTaskFail() {
                        console.log("failed");
                    }
                }
            }
        }
    };
 })();
//});