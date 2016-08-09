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
                mv.pickActives = pickActives;
                mv.finishTask = finishTask;
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
                function pickActives() {
                    dataservice.pickActives()
                        .then(handlePickActivesSuccess)
                        .catch(handlePickActivesFail);

                    function handlePickActivesSuccess() {
                        loadTasks();
                    }
                    function handlePickActivesFail() {
                        console.log("failed");
                    }
                }

                function finishTask(aTask) {
                    dataservice.finishTask(aTask.title)
                        .then(handleFinishTaskSuccess)
                        .catch(handleFinishTaskFail);

                    function handleFinishTaskSuccess() {
                        loadTasks();
                    }
                    function handleFinishTaskFail() {
                        console.log("failed");
                    }
                }

                function handleActiveTasks(data) {
                    console.log("Cache active tasks");
                    localStorage.setItem("actives", JSON.stringify(data.data));

                    mv.entries = $.each(data.data, function(i, item) {
                        if (item.due_date < 0) {
                            item.rowclass = "danger";
                        } else if (item.due_date < 3) {
                            item.rowclass = "warning";
                        } else if (item.due_date < 8) {
                            item.rowclass = "info";
                        } else {
                            item.rowclass = "";
                        }
                        return item;
                    })
                }
                function activeTaskLoadFailed() {
                    console.log("Error when loading active tasks, try offline");
                    var cachedTasks = localStorage.getItem("actives");
                    if (cachedTasks !== null) {
                        handleActiveTasks({
                            data: JSON.parse(cachedTasks)
                        });
                    }
                }
            }
        }
    }

 })();
//});