//define([], function() {
(function() {
    angular.module('tbd')
        .directive('active', ActiveTasks);

    ActiveTasks.$inject = ['dataservice']

    function ActiveTasks(dataservice) {
        return {
            restrict: "E",
            scope: {},
            templateUrl: 'html/activetask.html',
            controllerAs: 'mv',
            controller: function () {
                var mv = this;
                mv.entries = [];
                mv.addActiveTask = addActiveTask;
                mv.addTask = {
                    title: '',
                    description: '',
                    factor: 1,
                    due_until: 3
                };
                loadTasks();


                function loadTasks() {
                    dataservice.getActiveTasks()
                        .then(handleActiveTasks)
                        .catch(activeTaskLoadFailed);
                }

                function addActiveTask() {
                    dataservice.addActiveTask(mv.addTask)
                            .then(handleAddActiveTaskSuccess)
                            .catch(handleAddActiveTaskFail);

                    function handleAddActiveTaskSuccess(data) {
                        console.log('success');
                        loadTasks();
                        $('#myPoolModal').modal('hide');
                    }
                    function handleAddActiveTaskFail() {
                        console.log('failed');
                    }
                }

                function handleActiveTasks(data) {
                    mv.entries = data.data;
                }
                function activeTaskLoadFailed() {
                    console.log("Error when loading active tasks");
                }
            }
        }
    }

 })();
//});