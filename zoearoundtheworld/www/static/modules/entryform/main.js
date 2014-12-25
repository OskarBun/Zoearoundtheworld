/**
 * Created by OskarBunyan on 08/12/14.
 */
define([
    "knockout", "moment"
    ],
    function(ko, moment) {
        function Panel(params) {
            this.appl = params.appl;
            this.country = params.country;
            this.title = ko.observable();
            this.day = ko.observable();
            this.month = ko.observable();
            this.year = ko.observable();
            this.text = ko.observable();
            this.success = ko.observable();
            this.error = ko.observable();
            this.dayopt = ko.pureComputed(function(){
                if(this.month() && this.year()){
                    var days = [];
                    var i, items = moment().month(this.month()).year(this.year()).daysInMonth();
                    for(i=1; i<=items; i++){
                        days.push(i);
                    }
                    return days;
                }
            }, this);
            this.monthopt = ["January","February","March","April","May","June","July","August","September","October","November","December"]

            var years = [];
            var i, end = 2015;
            for(i=1990;i<=end;i++){
                years.push(i);
            }
            this.yearopt = years;
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