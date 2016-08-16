//define([], function() {
(function() {
    angular.module('tbd')
        .directive('log', Log);

    Log.$inject = ['dataservice']

    function Log(dataservice) {
        return {
            restrict: "E",
            scope: {},
            templateUrl: 'html/log.html',
            controllerAs: 'mv',
            controller: function () {
                var mv = this;
                mv.entries = [];
                mv.revert = revert;

                loadLog();
                var interval = setInterval(loadLog, 60000);


                function loadLog() {
                    dataservice.getLog()
                        .then(handleLogLoad)
                        .catch(handleLogLoadFailed);
                }

                function handleLogLoad(data, saveData) {
                    if (saveData !== true && saveData !== false) {
                        saveData = true;
                    }
                    if (saveData) {
                        console.log("Cache history log");
                        localStorage.setItem("histlog", JSON.stringify(data.data));
                        mv.offlineSince = null;
                    } else {
                        mv.offlineSince = new Date(parseInt(localStorage.getItem("last_timestamp")));
                    }

                    mv.entries = $.each(data.data, function (i, item) {
                        var date = new Date(item.timestamp * 1000);
                        var str =
                            (date.getYear() + 1900) + "-" +
                            (date.getMonth() + 1) + "-" +
                            (date.getDate()) + " " +
                            date.getHours() + ":" +
                            date.getMinutes() + ":" +
                            date.getSeconds();
                        item.printTimestamp = str;
                        return item;
                    });
                }
                function handleLogLoadFailed() {
                    console.log("Error when loading history log tasks, try offline");
                    var cachedLog = localStorage.getItem("histlog");
                    if (cachedLog !== null) {
                        handleLogLoad({
                            data: JSON.parse(cachedLog)
                        }, false);
                    }
                }

            function revert(entry) {
                dataservice.revert(entry.hash)
                    .then(revertSuccess)
                    .catch(revertFail);

                function revertSuccess() {
                    console.log("success");
                    location.reload();
                }
                function revertFail() {
                    console.log("fail");
                }
            }
        }

        }
    }

 })();
//});