var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/testdb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

db.once('open', function() {
var app = express();

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

/*app.get('/init', function(req, res){
    db.insert({ 
        text:"My test event A", 
        start_date: new Date(2013,8,1),
        end_date:   new Date(2013,8,5)
    });
    db.insert({ 
        text:"One more test event", 
        start_date: new Date(2013,8,3),
        end_date:   new Date(2013,8,8),
        color: "#DD8616"
    });


    res.send("Test events were added to the database")
});
*/

app.get('/data', function(req, res){
    db.find().toArray(function(err, data){
        //set id property for all records
        for (var i = 0; i < data.length; i++)
            data[i].id = data[i]._id;

        //output response
        res.send(data);
    });
});

app.post('/data', function(req, res){
    var data = req.body;

    //get operation type
    var mode = data["!nativeeditor_status"];
    //get id of record
    var sid = data.id;
    var tid = sid;

    //remove properties which we do not want to save in DB
    delete data.id;
    delete data.gr_id;
    delete data["!nativeeditor_status"];


    //output confirmation response
    function update_response(err, result){
        if (err)
            mode = "error";
        else if (mode == "inserted")
            tid = data._id;

        res.setHeader("Content-Type","text/xml");
        res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
    }

     if (mode == "updated")
        db.events.updateById( sid, data, update_response);
    else if (mode == "inserted")
        db.events.save(data, update_response);
    else if (mode == "deleted")
        db.events.removeById( sid, update_response);
    else
        res.send("Not supported operation");
});

app.listen(3000);
});