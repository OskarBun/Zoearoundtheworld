/**
 * Created by OskarBunyan on 16/12/14.
 */
define([
        "d3", "topojson", "knockout", "classie"
    ],
    function (d3, topojson, ko, classie) {
        function Panel(params){
            this.appl = params.appl;
            window.globe_panel = this;
            this.animate = null;
            this.visited = [];
        }

        Panel.prototype.init = function() {
            this.get_visited();
        };

        Panel.prototype.get_visited = function() {
            this.appl.send("visited",
                {

                },
                function(response){
                    if(response.error){
                        this.appl.error(response.error);
                        return;
                    }
                    this.visited = response.result;
                    this.appl.componentsignals.visited.dispatch(response.result);
                    this.load_globe();
                    document.addEventListener("click", this.animate)
                }.bind(this)
            );
        };

        Panel.prototype.load_globe = function() {
            var margin = {top: 10, left: 10, bottom: 10, right: 10},
                width = parseInt(d3.select('.globe').style('width')),
                width = width - margin.left - margin.right,
                mapRatio = .5,
                height = width * mapRatio;

            var inital = [-11.5, 0, 0],
                rotate = inital.slice(),
                velocity = 0.005,
                pause = false,
                t0 = Date.now();

            var projection = interpolatedProjection(
                d3.geo.orthographic()
                    .rotate([10, -10])
                    .center([-10, 10])
                    .scale(width/3.9)
                    .translate([width / 2, height / 2]),
                d3.geo.equirectangular()
                    .scale(width/6.5)
                    .translate([width / 2, height / 2]));

            var land,
                boundaries,
                visit;

            var canvas = d3.select(".globe").append("canvas")
                .attr("width", width)
                .attr("height", height);

            var context = canvas.node().getContext("2d");

            var path = d3.geo.path()
                .projection(projection)
                .context(context);

            d3.timer(function () {
                if (pause) return;
                var t = Date.now() - t0;
                rotate[0] = (velocity * t)+inital[0];
                projection.rotate(rotate).clipAngle(90);
                redraw(path);
            });

            function redraw(path) {
                context.clearRect(0, 0, width, height);
                context.lineWidth = 0.8;
                if (land) {
                    context.strokeStyle = "#fff", context.fillStyle = "#31a354";
                    context.beginPath(), path(land), context.fill(), context.stroke();
                    context.fillStyle = "#e7ba52";
                    context.beginPath(), path(visit), context.fill();
                    context.beginPath(), path(boundaries), context.stroke();
                }

            }

            d3.json("static/countries2.topo.json", function (error, world) {
                land = topojson.feature(world, world.objects.countries);
                visit = {"type" : "FeatureCollection",
                    "features": land.features.filter(function(d){
                        return this.visited.indexOf(d.properties.name)!=-1;
                    }.bind(this))};
                boundaries = topojson.mesh(world, world.objects.countries, function (a, b) {
                    return a !== b;
                });
            }.bind(this));

            function animate() {
                if(pause){
                    document.querySelector(".enter").style.visibility = "visible";
                    canvas
                        .transition()
                        .duration(7000)
                        .tween("projection", function () {
                            return function(_) {
                                projection.alpha(1-_);
                                projection.clipAngle(_!=0?180-(_*90):null);
                                redraw(path);
                            }
                        })
                        .each("end", function(){
                            t0= Date.now();
                            pause = false;
                        });
                } else {
                    document.removeEventListener("click", this.animate);
                    pause = true;
                    canvas
                        .transition()
                            .duration(1000)
                            .tween("projection", function () {
                                return function (_) {
                                    r = (1 - _) * (rotate[0] % 360)-(_ * 11.5) ;
                                    a = (1 - _) * (rotate[1] % 360);
                                    projection.rotate([r, a, 0]);
                                    redraw(path);
                                }
                            })
                        .transition()
                            .duration(7500)
                            .tween("projection", function () {
                                return function (_) {
                                    projection.alpha(_);
                                    projection.clipAngle(_!=1?(_*90)+90:null);
                                    redraw(path);
                                };
                            })
                            .each("end", function() {
                                this.enter();
                            }.bind(this));
                    }
            }

            function interpolatedProjection(a, b) {
                var projection = d3.geo.projection(raw).scale(1),
                    center = projection.center,
                    translate = projection.translate,
                    α;

                function raw(λ, φ) {
                    var pa = a([λ *= 180 / Math.PI, φ *= 180 / Math.PI]), pb = b([λ, φ]);
                    return [(1 - α) * pa[0] + α * pb[0], (α - 1) * pa[1] - α * pb[1]];
                }

                projection.alpha = function (_) {
                    if (!arguments.length) return α;
                    α = +_;
                    var ca = a.center(), cb = b.center(),
                        ta = a.translate(), tb = b.translate();
                    center([(1 - α) * ca[0] + α * cb[0], (1 - α) * ca[1] + α * cb[1]]);
                    translate([(1 - α) * ta[0] + α * tb[0], (1 - α) * ta[1] + α * tb[1]]);
                    return projection;
                };

                delete projection.scale;
                delete projection.translate;
                delete projection.center;
                return projection.alpha(0);
            }

            this.animate = animate.bind(this);
        };

        Panel.prototype.enter = function(){
            var cont = document.querySelector(".container");
            classie.add(cont, "entered")
        };

        return Panel;
    }
);

