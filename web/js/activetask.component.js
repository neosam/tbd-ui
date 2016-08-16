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
                mv.offlineFinishTask = offlineFinishTask;
                mv.offlineSince = null;
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

                function offlineFinishTask(aTask) {
                    var savedDataString = localStorage.getItem("finished_tasks");
                    if (savedDataString === null) {
                        var saveData = [];
                    } else {
                        var saveData = JSON.parse(savedDataString);
                    }
                    saveData.push(aTask);
                    console.log(saveData);
                    localStorage.setItem("finished_tasks", JSON.stringify(saveData));
                    removeCachedTask(aTask);
                    loadTasks();
                }

                function removeCachedTask(aTask) {
                    var cachedTasks = mv.entries;
                    var newTasks = cachedTasks.filter(function (x) { return x.title !== aTask.title });
                    localStorage.setItem("actives", JSON.stringify(newTasks));
                }

                function applySavedData() {
                    var savedDataString = localStorage.getItem("finished_tasks");
                    if (savedDataString === null) {
                        return;
                    }
                    var saveData = JSON.parse(savedDataString);
                    var counter = 0;
                    console.log("applySavedData");

                    nextTask();

                    function nextTask() {
                        if (saveData.length === 0) {
                            localStorage.removeItem("finished_tasks");
                            if (counter > 0) {
                                console.log("Refresh active tasks");
                                loadTasks();
                            }
                            return
                        }
                        counter += 1;
                        var aTask = saveData.pop();
                        doSave(aTask);
                    }

                    function doSave(aTask) {
                    console.log(aTask);
                        dataservice.finishTask(aTask.title)
                            .then(function () {
                                nextTask();
                            });
                    }
                }

                function handleActiveTasks(data, saveData) {
                    if (saveData !== true && saveData !== false) {
                        saveData = true;
                    }
                    if (saveData) {
                        console.log("Cache active tasks");
                        localStorage.setItem("actives", JSON.stringify(data.data));
                        localStorage.setItem("last_timestamp", new Date().getTime());
                        applySavedData();
                        mv.offlineSince = null;
                    } else {
                        mv.offlineSince = new Date(parseInt(localStorage.getItem("last_timestamp")));
                    }

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
                        }, false);
                    }
                }
            }
        }
    }

 })();
//});