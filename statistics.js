(function() {
    'use strict';
    
    angular.module('app').controller('StatsController', StatsController);
    
    StatsController.$inject = ['DataService','$log'];

    function StatsController(DataService,$log){
        var vm = this;
        
        vm.stats = null;
        vm.numberRecipes = null;
       
        vm.loading = false;

        _loadData();

        function _loadData() {

            vm.loading = true;
            DataService.getStats()
                .then(function(stats) {
                    vm.stats = stats;
                    vm.numberRecipes = stats['recipe_number'];
                    showRecipes("#recipeStatPanel");
                })
                .catch(function(error){
                    $log.error('Could not load recipe list');
                })
                .finally(function(){
                    vm.loading = false;
                });
        }

        function showRecipes(elementPath){

            var data = vm.stats.recipes;

            var width = 250,
                height = 250,
                radius = Math.min(width, height) / 2;
            
            var color = d3.scaleOrdinal()
                .range(['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0','#f0027f','#bf5b17','#666666']);

            var arc = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(radius - 70);

            var pie = d3.pie()
                .value(function(d) { return d.recipes; });

            var svg = d3.select(elementPath).append("svg")
                .attr("width", width)
                .attr("height", height)
              .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                
            var g = svg.selectAll(".arc")
              .data(pie(data))
            .enter().append("g")
              .attr("class", "arc");

              g.append("path")
                  .attr("d", arc)
                  .style("fill", function(d) { return color(d.data.category); });

              g.append("text")
                  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                  .attr("dy", ".35em")
                  .attr("font-family", "sans-serif")
                  .style("font-size", "20px")
                  .text(function(d) { return d.data.category; });
 
              g.append("text")
                  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                  .attr("dy", "1.75em")
                  .text(function(d) { return "(" + d.data.recipes + ")"; });
        }
        
    };
})();