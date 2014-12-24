/**
 * Created by OskarBunyan on 08/12/14.
 */
define([
    "knockout"
    ],
    function(ko) {
        function Panel(params) {
            this.appl = params.appl;
            this.country = params.country;
            this.title = ko.observable();
            this.date = ko.observable();
            this.text = ko.observable();
            this.success = ko.observable();
            this.error = ko.observable();
        }

        Panel.prototype.save = function(){
            this.appl.send("new_entry",
                {
                    "title": this.title(),
                    "date": this.date(),
                    "country": this.country(),
                    "text": this.text()
                },
                function(response){
                    if(response.error){
                        this.error(response.error);
                        return;
                    }
                    this.success("Entry added");
                    this.title('');
                    this.text('');
                }.bind(this)
            );

        };



        return Panel
    }
);