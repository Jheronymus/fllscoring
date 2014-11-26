define('views/scores',[
    'services/log',
    'services/ng-scores',
    'directives/really',
    'angular'
],function(log) {
    var moduleName = 'scores';
    return angular.module(moduleName,[]).controller(moduleName+'Ctrl',[
        '$scope', '$scores','$teams',
        function($scope,$scores,$teams) {
            log('init scores ctrl');

            $scope.sort = 'index';
            $scope.rev = true;

            $scope.scores = $scores.scores;

            $scope.doSort = function(col, defaultSort) {
                $scope.rev = (String($scope.sort) === String(col)) ? !$scope.rev : defaultSort;
                $scope.sort = col;
            };
            $scope.removeScore = function(index) {
                $scores.remove(index);
                return $scores.save();
            };
            $scope.editScore = function(index) {
                var score = $scores.scores[index];
                score.$editing = true;
            };

            $scope.finishEditScore = function(index) {
                // The score entry is edited 'inline', then used to
                // replace the entry in the scores list and its storage.
                // Because scores are always 'sanitized' before storing,
                // the $editing flag is automatically discarded.
                var score = $scores.scores[index];
                try {
                    $scores.update(score.index, score);
                    $scores.save();
                } catch(e) {
                    alert("Error updating score: " + e);
                }
            };

            $scope.cancelEditScore = function() {
                $scores._update();
            };

            $scope.pollSheets = function() {
                return $scores.pollSheets().catch(function(err) {
                    console.log("pollSheets() failed", err);
                    alert("failed to poll sheets: " + err);
                });
            };

            $scope.refresh = function() {
                $scores.load();
            };
        }
    ]);
});
