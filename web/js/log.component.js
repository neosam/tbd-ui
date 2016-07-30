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


                function loadLog() {
                    dataservice.getLog()
                        .then(handleLogLoad)
                        .catch(handleLogLoadFailed);
                }

                function handleLogLoad(data) {
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
                    console.log("Error when loading log");
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