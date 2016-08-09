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
                loadPooledTasks();


                function loadPooledTasks() {
                    dataservice.getPooledTasks()
                        .then(handlePooledTasks)
                        .catch(handlePooledTasksFailed);
                }


                function handlePooledTasks(data) {
                    console.log("Cache pooled tasks");
                    localStorage.setItem("pooled", JSON.stringify(data.data));

                    mv.entries = data.data;
                }
                function handlePooledTasksFailed() {
                    console.log("Error when loading pooled tasks, try offline");
                    var cachedTasks = localStorage.getItem("pooled");
                    if (cachedTasks !== null) {
                        handlePooledTasks({
                            data: JSON.parse(cachedTasks)
                        });
                    }
                }

                function addPooledTask() {
                    dataservice.addPooledTask(mv.add_task)
                        .then(handleAddPooledTaskSuccess)
                        .catch(handleAddPooledTaskFail);

                    function handleAddPooledTaskSuccess() {
                        console.log("success");
                        loadPooledTasks();
                        $('#myModal').modal('hide');
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