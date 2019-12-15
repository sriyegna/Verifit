'use strict'

// C library API
const ffi = require('ffi-napi');


// Express App (Routes)
const express = require("express");
const app     = express();
const path    = require("path");
const fileUpload = require('express-fileupload');

app.use(fileUpload());

// Minimization
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Important, pass in port as in `npm run dev 1234`, do not change
const portNum = process.argv[2];

// Send HTML at root, do not change
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

// Send Style, do not change
app.get('/style.css',function(req,res){
  //Feel free to change the contents of style.css to prettify your Web app
  res.sendFile(path.join(__dirname+'/public/style.css'));
});

// Send obfuscated JS, do not change
app.get('/index.js',function(req,res){
  fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
    res.contentType('application/javascript');
    res.send(minimizedContents._obfuscatedCode);
  });
});

//Respond to POST requests that upload files to uploads/ directory
app.post('/upload', function(req, res) {

  if(!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  let file = req.files.file[0];
  let retStr = fs.readdirSync('./uploads');
  if (retStr.includes(file.name)) {
    return res.status(500).send('File already exists.');
  }

  // Use the mv() method to place the file somewhere on your server
  file.mv('uploads/' + file.name, function(err) {
    if(err) {
      return res.status(500).send(err);
    }
    var isValid = sharedLib.isAValidGPX('uploads/' + file.name);
    if (isValid == "true") {
        return res.status(200).send();
    }
    else {
      fs.unlinkSync('uploads/' + file.name);
      return res.status(500).send("File is not valid");
    }
  });
});

//Respond to GET requests for files in the uploads/ directory
app.get('/uploads/:name', function(req , res){
  fs.stat('uploads/' + req.params.name, function(err, stat) {
    if(err == null) {
      res.sendFile(path.join(__dirname+'/uploads/' + req.params.name));
    } else {
      console.log('Error in file downloading route: '+err);
      res.send('');
    }
  });
});

//******************** Your code goes here ********************


let sharedLib = ffi.Library('./libgpxparse', {
  'GPXFiletoJSON': [ 'string', ['string'] ],
  'GPXFiletoTrackList': [ 'string', ['string']],
  'GPXFiletoRouteList': [ 'string', ['string']],
  'attrListToJSON': [ 'string', ['string', 'string', 'string']],
  'renameGPXComponent': [ 'void', ['string', 'string', 'string', 'string']],
  'CreateGPXFile': [ 'string', ['string', 'string']],
  'webAddRoute': ['string', ['string', 'string']],
  'webFindRouteBetween': [ 'string', ['string', 'string', 'string', 'string', 'string', 'string']],
  'webFindTrackBetween': [ 'string', ['string', 'string', 'string', 'string', 'string', 'string']],
  'webAddWaypoint': [ 'void', ['string', 'string', 'string', 'string']],
  'isAValidGPX': ['string', ['string']]

  //'GPXtoJSON': [ 'string', ['GPXdoc'] ]		//return type first, argument list second
									//for void input type, leave argument list empty
  //'addTwo': [ 'int', [ 'int' ] ],	//int return, int argument
  //'getDesc' : [ 'string', [] ],
  //'putDesc' : [ 'void', [ 'string' ] ],
});



app.get('/renameComponent', function(req, res) {
  var obj = JSON.parse(sharedLib.renameGPXComponent("./uploads/" + req.query.filename, req.query.componentType, req.query.name, req.query.newName));
  res.send({
    foo: obj
  });
});

app.get('/checkValidGPX', function(req, res) {
  var obj = JSON.parse(sharedLib.isValidDoc("./uploads/" + req.query.filename));
  obj['filename'] = req.query.filename;
  res.send({
    foo: obj
  });
});

app.get('/getAttrList', function(req, res) {
  //console.log((sharedLib.attrListToJSON("./uploads/" + req.query.filename, req.query.componentType, req.query.name).replace(/\s+/g,' ')).replace(/(\r\n|\n|\r)/gm,""));
  var obj = JSON.parse((sharedLib.attrListToJSON("./uploads/" + req.query.filename, req.query.componentType, req.query.name).replace(/\s+/g,' ')).replace(/(\r\n|\n|\r)/gm,""));
  res.send({
    foo: obj
  });
});


app.get('/getRouteList', function(req, res){
  var obj = JSON.parse(sharedLib.GPXFiletoRouteList("./uploads/" + req.query.filename));;
  res.send({
    foo: obj
  });
});

app.get('/getTrackList', function(req, res){
  var obj = JSON.parse(sharedLib.GPXFiletoTrackList("./uploads/" + req.query.filename));;
  res.send({
    foo: obj
  });
});

app.get('/getFileList', function(req , res){
  let retStr = fs.readdirSync('./uploads');
  res.send({
    foo: retStr
  });
});

app.get('/getGPXFileData', function(req , res){
  var validGPX = sharedLib.isAValidGPX("./uploads/" + req.query.filename);
  if (validGPX == "false") {
    res.send({
      foo: null
    });
    return;
  }
  var obj = JSON.parse(sharedLib.GPXFiletoJSON("./uploads/" + req.query.filename));
  obj['filename'] = req.query.filename;
  res.send({
    foo: obj
    });
});

//Sample endpoint
app.get('/someendpoint', function(req , res){
  let retStr = req.query.name1 + " " + req.query.name2;
  res.send({
    foo: retStr
  });
});

app.get('/createGPXFile', function(req, res) {

  var actualFile = false;

  if (req.files != undefined) {
    let file = req.files.file[0];
    actualFile = true;
  }
  let retStr = fs.readdirSync('./uploads');
  var obj = "";
  if (actualFile) {
    if (!(retStr.includes(file.name))) {
      var json = {version: parseFloat(req.query.version), creator: req.query.creator};
      obj = sharedLib.CreateGPXFile("uploads/" + file.name, JSON.stringify(json));
    }
    else {
      obj = "File already exists."
    }
  }
  else {
    if (!(retStr.includes(req.query.filename))) {
      var json = {version: parseFloat(req.query.version), creator: req.query.creator};
      obj = sharedLib.CreateGPXFile("uploads/" + req.query.filename, JSON.stringify(json));
    }
    else {
      obj = "File already exists."
    }
  }
  res.send({
    foo: obj
  });
});

app.get('/addARoute', function(req, res) {
  //console.log((sharedLib.attrListToJSON("./uploads/" + req.query.filename, req.query.componentType, req.query.name).replace(/\s+/g,' ')).replace(/(\r\n|\n|\r)/gm,""));
  var json = {name: req.query.name};
  var obj = sharedLib.webAddRoute("uploads/" + req.query.filename, JSON.stringify(json));
  if (req.query.waypoints != undefined) {
    for (var i = 0; i < req.query.waypoints.length; i++) {
      sharedLib.webAddWaypoint("uploads/" + req.query.filename, req.query.name, req.query.waypoints[i].lat, req.query.waypoints[i].lon);
    }
  }
  res.send({
    foo: obj
  });
});

app.get('/findBetween', function(req, res) {
  let fileList = fs.readdirSync('./uploads');
  var jsonList = [];
  for (var i = 0; i < fileList.length; i++) {
    if (fileList[i].includes(".gpx")) {
      var obj = sharedLib.webFindRouteBetween("uploads/" + fileList[i], req.query.startLat, req.query.startLong, req.query.endLat, req.query.endLong, req.query.tolerance);
      var jsonObj = JSON.parse(obj);
      if (jsonObj != null) {
        if (jsonObj.length > 0) {
          for (var j = 0; j < jsonObj.length; j++) {
            jsonObj[j].compType = "Route";
          }
          jsonList.push(JSON.stringify(jsonObj));
        }
      }
      obj = sharedLib.webFindTrackBetween("uploads/" + fileList[i], req.query.startLat, req.query.startLong, req.query.endLat, req.query.endLong, req.query.tolerance);
      jsonObj = JSON.parse(obj);
      if (jsonObj != null) {
        if (jsonObj.length > 0) {
          for (var j = 0; j < jsonObj.length; j++) {
            jsonObj[j].compType = "Track";
          }
          jsonList.push(JSON.stringify(jsonObj));
        }
      }
    }
  }
  res.send({
    foo: jsonList
  });
});

app.listen(portNum);
console.log('Running app at localhost: ' + portNum);
