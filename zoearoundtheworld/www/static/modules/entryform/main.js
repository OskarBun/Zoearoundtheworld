/**
 * Created by OskarBunyan on 08/12/14.
 */
define([
    "knockout", "moment"
    ],
    function(ko, moment) {
        function Panel(params) {
            window.new_entry_panel = this;

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
            this.monthopt = ["January","February","March","April","May","June","July","August","September","October","November","December"];

            var years = [];
            var i;
            for(i=2015;i>=1990;i--){
                years.push(i);
            }
            this.yearopt = years;
            this.entrydate = ko.computed({
                read:function(){
                    debugger;
                    var m = moment({
                        year:this.year(),
                        month:this.monthopt.indexOf(this.month()),
                        day:this.day()
                    });
                    console.log("read",m.format());
                    return m;
                },
                write: function(value){
                    var m = moment(value);
                    this.year(m.year());
                    this.month(this.monthopt[m.month()]);
                    this.day(m.date());
                    console.log("write",this.entrydate().format());
                },
                owner: this,
                deferEvaluation: true
            });
            this.entrydate(moment());
        }

        Panel.prototype.save = function(){
            this.appl.send("new_entry",
                {
                    "title": this.title(),
                    "date": this.entrydate().format("YYYY-MM-DD"),
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