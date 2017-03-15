(function() {
    'use strict';

    angular.module('app').controller('AddLocationController', AddLocationController);
    
    AddLocationController.$inject = ['$scope', '$element', 'close'];
    
    function AddLocationController($scope, $element, close) {

        $scope.shopLocation = null;        
        
        $scope.close = function(result) {
            
            if (result == 'Cancel'){
                result = null;
            }

            //  Manually hide the modal using bootstrap.
            $element.modal('hide');

            //  Now close as normal, but give 500ms for bootstrap to animate
            close(result, 200);
        };
    };

})();