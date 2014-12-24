define([
        "knockout", "./connection"
    ],
    function (ko, Connect) {

        function Appl() {
            this.connection = new Connect();
            this.error = ko.observable();
            this.broadcast = this.connection.broadcast;
            this.broadcast.subscribe(function (obj) {

            }, this);
        }

        Appl.prototype.send = function (action, args, callback) {
            this.connection.send(action, args, callback);
        };


        Appl.prototype.toggle_connection = function () {
            this.connection.toggle_connection();
        };

        return Appl;
    });

