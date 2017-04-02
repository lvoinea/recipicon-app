(function() {
    'use strict';

    angular.module('app').controller('ModalEntryController', ModalEntryController);
    
    ModalEntryController.$inject = ['$scope', '$element', 'title', 'oldEntry', 'close'];
    
    function ModalEntryController($scope, $element, title, oldEntry, close) {

        var vm = this;
    
        vm.entry = null;     
        vm.title = title;
        vm.entryClose = entryClose
        
        function entryClose(result) {
            
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