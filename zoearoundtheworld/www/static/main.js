/**
 * Created by OskarBunyan on 16/12/14.
 */
require.config({
    urlArgs: "v=" + (new Date()).getTime(),
    baseUrl: "static",
    paths: {
        "jquery":           "bower_components/jquery/dist/jquery",
        "knockout":         "bower_components/knockout/dist/knockout.debug",
        "text":             "bower_components/requirejs-text/text",
        "classie":          "bower_components/classie/classie",
        "d3":               "bower_components/d3/d3",
        "topojson":         "bower_components/topojson/topojson",
        "signals":          "bower_components/js-signals/dist/signals",
        "moment":           "bower_components/moment/moment"
    }

});

require([
        "jquery",
        "knockout",
        "./appl",
        "signals"
    ],
    function($, ko, Appl, signals){

        ko.components.register("globe", {
            viewModel: { require: "modules/globe/main" },
            template: { require: "text!modules/globe/main-tmpl.html"}
        });

        ko.components.register("svgglobe", {
            viewModel: { require: "modules/svgglobe/main" },
            template: { require: "text!modules/svgglobe/main-tmpl.html"}
        });

        ko.components.register("visits", {
            viewModel: { require: "modules/visits/main" },
            template: { require: "text!modules/visits/main-tmpl.html"}
        });

        ko.components.register("entryform", {
            viewModel: { require: "modules/entryform/main" },
            template: { require: "text!modules/entryform/main-tmpl.html"}
        });

        var appl = window.appl = new Appl();

        appl.componentsignals = {
            mapView : new signals.Signal(),
            country : new signals.Signal(),
            visited : new signals.Signal()
        };

        $(function(){
            ko.applyBindings(appl);
            appl.toggle_connection();
        });
    }
);