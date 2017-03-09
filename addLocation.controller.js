(function() {
    'use strict';

    angular.module('app').controller('AddLocationController', AddLocationController);
    
    AddLocationController.$inject = ['$scope', '$element', 'close'];
    
    function AddLocationController($scope, $element, close) {

        $scope.close = function(result) {

            //  Manually hide the modal using bootstrap.
            $element.modal('hide');

            //  Now close as normal, but give 500ms for bootstrap to animate
            close(result, 500);
        };
    };

})();