/**
 * Created by OskarBunyan on 23/12/14.
 */
define([
    "knockout", "classie", "moment", "signals"
    ], function(ko, classie, moment){
        function Panel(params){
            this.appl = params.appl;
            this.moment = moment;
            this.items = ko.observableArray();
            this.country = ko.observable();
            this.open = ko.observable(false);
            this.appl.componentsignals.country.add(this.country);
            this.country.subscribe(function(){
                this.load();
            }, this);
            this.broadcast_sub = this.appl.broadcast.subscribe(function(message){
                if(message.signal=="entried"){
                    if(message.message.country==this.country()){
                        this.load();
                    }
                }
            }, this)
        }

        Panel.prototype.init = function(){
            this.load();
        };

        Panel.prototype.toggleform = function(){
            this.open(!this.open());
        };

        Panel.prototype.load = function(){
            if(this.country()) {
                this.appl.send("filter_entries",
                    {
                        "country": this.country()
                    },
                    function (response) {
                        if (response.error) {
                            this.appl.error(response.error);
                            return;
                        }
                        this.items(response.result);
                    }.bind(this)
                );
            }
        };

        Panel.prototype.dispose = function(){
            this.appl.componentsignals.country.remove(this.country);
        };

        return Panel;
    }
);