/**
 * Created by OskarBunyan on 17/12/14.
 */
define([
        "d3", "topojson", "knockout", "signals"
    ],
    function (d3, topojson, ko) {
        function Panel(params) {
            this.appl = params.appl;
            this.projection = d3.geo.equirectangular()
                .rotate([-11.5, 0, 0]);
            this.graticule = d3.geo.graticule()();
            this.visited = ko.observableArray();
            this.path = d3.geo.path()
                .projection(this.projection);
            this.name = ko.observable("Zoe Around the World");
            this.active = ko.observable();
            this.broadcast_sub = this.appl.broadcast.subscribe(function(message){

            }, this);
            this.visited.subscribe(function(){
                this.load_map();
            }, this);
        }

        Panel.prototype.init = function(){
            this.appl.componentsignals.visited.add(this.visited);
        };



        Panel.prototype.load_map = function () {
            var margin = {top: 10, left: 10, bottom: 10, right: 10},
                mapRatio = .5;
            this.width = parseInt(d3.select('.map').style('width'));
            this.width = this.width - margin.left - margin.right;
            this.height = this.width * mapRatio;

            this.projection
                .scale(this.width/6.5)
                .translate([this.width / 2, this.height / 2]);


            this.svg = d3.select("#map").append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            d3.json("static/countries.topo.json", function (error, world) {
                var land = topojson.feature(world, world.objects.countries).features,
                    visit = land.filter(function (d) {
                        return this.visited().indexOf(d.properties.name) != -1;
                    }.bind(this)),
                    boundaries = topojson.mesh(world, world.objects.countries, function (a, b) {
                        return a !== b;
                    });

                this.svg.append("g")
                    .attr("class", "land")
                    .selectAll("path")
                    .data(land)
                    .enter().append("path")
                    .attr("d", this.path)
                    .on("mouseover", this.hover.bind(this))
                    .on("click", this.click.bind(this));

                this.svg.append("g")
                    .attr("class", "visited")
                    .selectAll("path")
                    .data(visit)
                    .enter().append("path")
                    .attr("d", this.path)
                    .on("mouseover", this.hover.bind(this))
                    .on("click", this.click.bind(this));

                this.svg.append("g")
                    .append("path")
                    .datum(boundaries)
                    .attr("class", "boundaries")
                    .attr("d", this.path);

                this.g = this.svg.selectAll("g");

            }.bind(this));

            this.zoom = d3.behavior.zoom()
                    .on("zoom", function () {
                        this.g.attr("transform", "translate(" + d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
                        this.g.selectAll("path")
                            .attr("d", this.path);
                    }.bind(this))
                    .scaleExtent([1, 70]);

            this.svg
                .call(this.zoom)

        };

        Panel.prototype.hover = function(d){
            this.name(d.properties.name);
        };

        Panel.prototype.reset = function(){
            this.g.selectAll("path")
                .classed("fade", false);

            this.g.filter(".land").selectAll("path")
                .on("mouseover", this.hover.bind(this));
            this.g.filter(".visited").selectAll("path")
                .on("mouseover", this.hover.bind(this));

            this.svg.call(this.zoom);

            this.active(null);

            this.appl.componentsignals.country.dispatch(null);

            this.svg.transition()
                .duration(750)
                .call(this.zoom.translate([0, 0]).scale(1).event);
        };

        Panel.prototype.click = function (d) {
            if (this.active() === d) return this.reset();

            var bounds = this.path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = .9 / Math.max(dx / this.width, dy / this.height),
                translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

            this.active(d);
            this.g.selectAll("path")
                        .classed("fade", function(d){return d != this.active()}.bind(this))
                        .on("mouseover", null);

            this.svg.transition()
                .duration(750)
                .call(this.zoom.translate(translate).scale(scale).event)
                .each("end", function(){
                    this.svg.call(d3.behavior.zoom().on("zoom", null));
                    this.appl.componentsignals.country.dispatch(d.properties.name)
                }.bind(this));


        };


        Panel.prototype.dispose = function () {
            this.appl.componentsignals.mapView.dispose(this.view);
            this.broadcast_sub.dispose();
        };

        return Panel;

    }
);