'use strict'

// C library API
const ffi = require('ffi-napi');


// Express App (Routes)
const express = require("express");
const app     = express();
const path    = require("path");
const fileUpload = require('express-fileupload');

//mysql2
const mysql = require('mysql2/promise');
let dbConf = {
	host     : 'dursley.socs.uoguelph.ca',
	user     : 'srinath',
	password : '1117670',
	database : 'srinath'
};

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
  'isAValidGPX': ['string', ['string']],
  'routeWPTToJSON': ['string', ['string', 'string']]

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
  var obj = JSON.parse(sharedLib.GPXFiletoRouteList("./uploads/" + req.query.filename));
  res.send({
    foo: obj
  });
});

app.get('/getTrackList', function(req, res){
  var obj = JSON.parse(sharedLib.GPXFiletoTrackList("./uploads/" + req.query.filename));
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

// A4


app.get('/loginDB', async function(req, res, next){
  dbConf.user = req.query.sqlUsername;
  dbConf.password = req.query.sqlPassword;
  dbConf.database = req.query.sqlDbName
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf);
   try {
     var instruction = "CREATE TABLE FILE (gpx_id INT AUTO_INCREMENT, file_name VARCHAR(60) NOT NULL, ver DECIMAL(2,1) NOT NULL, creator VARCHAR(256) NOT NULL, PRIMARY KEY (gpx_id))";
     await connection.execute(instruction)
   }
   catch(e) {
		 retStr = retStr + "Create File Table Error: " + e + ".\n";
   }
   try {
     var instruction = "CREATE TABLE ROUTE (route_id INT AUTO_INCREMENT, route_name VARCHAR(256), route_len FLOAT(15,7) NOT NULL, gpx_id INT NOT NULL, PRIMARY KEY (route_id), FOREIGN KEY(gpx_id) REFERENCES FILE(gpx_id) ON DELETE CASCADE)";
     await connection.execute(instruction)
   }
   catch(e) {
     retStr = retStr + "Create Route Table Error: " + e + ".\n";
   }
   try {
     var instruction = "CREATE TABLE POINT (point_id INT AUTO_INCREMENT, point_index INT NOT NULL, latitude DECIMAL(11,7) NOT NULL, longitude DECIMAL(11,7) NOT NULL, point_name VARCHAR(256), route_id INT NOT NULL, PRIMARY KEY (point_id), FOREIGN KEY(route_id) REFERENCES ROUTE(route_id) ON DELETE CASCADE)";
     await connection.execute(instruction)
   }
   catch(e) {
     retStr = retStr + "Create Point Table Error: " + e + ".\n";
   }
  //...
  }catch(e){
		retStr = retStr + "Query Error: " + e + ".\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "Login succesfull and tables created.";
		}
		res.send({
			retStr
		});
  }

});

app.get('/storeFiles', async function(req, res, next){

  let files = req.query.files;
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    for(var i = 0; i < files.length; i++) {
      //Get GPX File database
      var fileID;
      var routeID;
      try {
        var obj = JSON.parse(sharedLib.GPXFiletoJSON("./uploads/" + files[i]));
				//var instruction = "INSERT INTO FILE (file_name, creator, ver) SELECT '" + files[i] + "', '" + obj['creator'] + "', " + obj['version'] + " FROM dual WHERE NOT EXISTS (SELECT 1 FROM FILE WHERE file_name='" + files[i] + "')";
				//var instruction = "IF NOT EXISTS (SELECT 1 FROM FILE WHERE file_name='" + files[i] + "') INSERT INTO FILE (file_name, creator, ver) VALUES ('" + files[i] + "','" + obj['creator'] + "'," + obj['version'] + ")";
				var instruction = "SELECT * FROM FILE WHERE file_name='" + files[i] + "'";
				var result = await connection.execute(instruction);
				if (result[0].length > 0) {
					retStr = retStr + "Error: File " + files[i] + " already exists.\n";
				}
				else {
					instruction = "INSERT INTO FILE (file_name, creator, ver) VALUES ('" + files[i] + "','" + obj['creator'] + "'," + obj['version'] + ")";
	        //console.log(instruction);
	        fileID = (await connection.execute(instruction))[0].insertId;
	        //console.log("success insert FILE");
					var obj = JSON.parse(sharedLib.GPXFiletoRouteList("./uploads/" + files[i]));
		      for (var j = 0; j < obj.length; j++) {
						var instruction = "SELECT * FROM ROUTE WHERE route_name='" + obj[j]['name'] + "' AND gpx_id=" + fileID;
						var result = await connection.execute(instruction);
						if (result[0].length > 0) {
							retStr = retStr + "Error: Route " + obj[j]['name'] + " already exists.\n";
						}
						else {
			        var instruction = "INSERT INTO ROUTE (route_name, route_len, gpx_id) VALUES ('" + obj[j]['name'] + "','" + obj[j]['len'] + "'," + fileID + ")";
			        routeID = (await connection.execute(instruction))[0].insertId;
			        var resultLib = sharedLib.routeWPTToJSON("./uploads/" + files[i], obj[j]['name']);
			        var resultWPTs = JSON.parse(resultLib);
			        for (var k = 0; k < resultWPTs.length; k++) {
			          var instruction = "SELECT * FROM POINT WHERE route_id=" + routeID + " AND latitude=" + resultWPTs[k].latitude + " AND longitude=" + resultWPTs[k].longitude + " AND point_index=" + k;
								var result = await connection.execute(instruction);
								if (result[0].length > 0) {
									retStr = retStr + "Error: Point " + resultWPTs[k]['name'] + " already exists.\n";
								}
								else {
				          if (resultWPTs[k].name == "") {
				            instruction = "INSERT INTO POINT (point_index, latitude, longitude, route_id) VALUES (" + k + "," + resultWPTs[k].latitude + "," + resultWPTs[k].longitude + "," + routeID + ")";
				          }
				          else {
				            instruction = "INSERT INTO POINT (point_index, latitude, longitude, point_name, route_id) VALUES (" + k + "," + resultWPTs[k].latitude + "," + resultWPTs[k].longitude + ",'" + resultWPTs[k].name + "'," + routeID + ")";
				          }
				          await connection.execute(instruction);
								}
			        }

						}
		      }
				}
      }
      catch(e) {
        retStr = retStr + "Insert File Error " + files[i] + " " + e + ".\n";
      }
      //Get GPX Route Database

    }
  //...
  }catch(e){
   retStr = retStr + "Error: Query error: "+e  + ".\n";
  }finally {
    if (connection && connection.end) connection.end();
		res.send({
			retStr
		});
  }
});

app.get('/clearData', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
   try {
     var instruction = "DELETE FROM POINT";
     await connection.execute(instruction)
   }
   catch(e) {
     retStr = retStr + "Delete Point Error: " + e + ".\n";
   }
   try {
     var instruction = "DELETE FROM ROUTE";
     await connection.execute(instruction)
   }
   catch(e) {
     retStr = retStr + "Delete Route Error: " + e + ".\n";
   }
   try {
     var instruction = "DELETE FROM FILE";
     await connection.execute(instruction)
   }
   catch(e) {
     retStr = retStr + "Delete File Error: " + e + ".\n";
   }

  }catch(e){
   retStr = retStr + "Query error: "+e;
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "Succesfully Cleared";
		}
		res.send({
			retStr
		});
  }
});


app.get('/dbStatus', async function(req, res, next){
  let connection;
  var fileCount;
  var routeCount;
  var pointCount;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
   try {
     var instruction = "SELECT * FROM FILE";
     fileCount = (await connection.execute(instruction))[0].length;
   }
   catch(e) {
     retStr = retStr + "Failed to get number of files. Error: " + e + "\n";
   }
   try {
     var instruction = "SELECT * FROM ROUTE";
     routeCount = (await connection.execute(instruction))[0].length;
   }
   catch(e) {
     retStr = retStr + "Failed to get number of routes. Error: " + e + "\n";
   }
   try {
     var instruction = "SELECT * FROM POINT";
     pointCount = (await connection.execute(instruction))[0].length;
   }
   catch(e) {
     retStr = retStr + "Failed to get number of points. Error: " + e + "\n";
   }
  }catch(e){
   	retStr = retStr + "Query error: "+e;
  }finally {
    if (connection && connection.end) connection.end();

		if (retStr == "") {
			retStr = "Succesfully obtained DB Status";
		}
    res.send({
      fileCount: fileCount,
      routeCount: routeCount,
      pointCount: pointCount,
			retStr: retStr
    });
  }
});

app.get('/dispAllRoutes', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT * FROM ROUTE";
    var allRoutes = await connection.execute(instruction);
  }catch(e){
   retStr = retStr + "Failed to get all routes. Error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "All routes found";
		}
    res.send({
      allRoutes: allRoutes[0],
			retStr: retStr
    });
  }
});

app.get('/dispAllRoutesSortName', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT * FROM ROUTE ORDER BY route_name";
    var allRoutes = await connection.execute(instruction);
  }catch(e){
   retStr = retStr + "Failed to get all routes. Error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "All routes found";
		}
    res.send({
      allRoutes: allRoutes[0],
			retStr: retStr
    });
  }
});

app.get('/dispAllRoutesSortLength', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT * FROM ROUTE ORDER BY route_len";
    var allRoutes = await connection.execute(instruction);
  }catch(e){
		retStr = retStr + "Failed to get all routes. Error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "All routes found";
		}
    res.send({
      allRoutes: allRoutes[0],
			retStr: retStr
    });
  }
});

//SELECT FILE.file_name, ROUTE.route_name, ROUTE.route_len FROM ROUTE INNER JOIN FILE ON ROUTE.gpx_id=FILE.gpx_id
app.get('/dispRouteFile', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT FILE.file_name, ROUTE.route_name, ROUTE.route_len FROM ROUTE INNER JOIN FILE ON ROUTE.gpx_id=FILE.gpx_id";
    var allRoutes = await connection.execute(instruction);
  }catch(e){
		retStr = retStr + "Failed to get all routes. Error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "All routes found";
		}
    res.send({
      allRoutes: allRoutes[0],
			retStr: retStr
    });
  }
});

app.get('/dispRouteFileFile', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT FILE.file_name, ROUTE.route_name, ROUTE.route_len FROM ROUTE INNER JOIN FILE ON ROUTE.gpx_id=FILE.gpx_id ORDER BY FILE.file_name";
    var allRoutes = await connection.execute(instruction);
  }catch(e){
   retStr = retStr + "Failed to get all routes. Error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "All routes found";
		}
    res.send({
      allRoutes: allRoutes[0],
			retStr: retStr
    });
  }
});

app.get('/dispRouteFileName', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT FILE.file_name, ROUTE.route_name, ROUTE.route_len FROM ROUTE INNER JOIN FILE ON ROUTE.gpx_id=FILE.gpx_id ORDER BY ROUTE.route_name";
    var allRoutes = await connection.execute(instruction);
  }catch(e){
   retStr = retStr + "Failed to get all routes. Error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "All routes found";
		}
    res.send({
      allRoutes: allRoutes[0],
			retStr: retStr
    });
  }
});

app.get('/dispRouteFileLength', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT FILE.file_name, ROUTE.route_name, ROUTE.route_len FROM ROUTE INNER JOIN FILE ON ROUTE.gpx_id=FILE.gpx_id ORDER BY ROUTE.route_len";
    var allRoutes = await connection.execute(instruction);
  }catch(e){
   retStr = retStr + "Failed to get all routes. Error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "All routes found";
		}
    res.send({
      allRoutes: allRoutes[0],
			retStr: retStr
    });
  }
});

app.get('/dispPointRouteSelect', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT point_index, point_name, latitude, longitude FROM POINT WHERE route_id=" + req.query.route_id + " ORDER BY point_index";
    var allPoints = await connection.execute(instruction);
  }catch(e){
   retStr = retStr + "Failed to get all points. Error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "All points found";
		}
    res.send({
      allPoints: allPoints[0],
			retStr: retStr
    });
  }
});

app.get('/dispAllFiles', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT * FROM FILE";
    var allFiles = await connection.execute(instruction);
  }catch(e){
   retStr = retStr + "Failed to get all files. error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "Succesfully obtained all files";
		}
    res.send({
      allFiles: allFiles[0],
			retStr: retStr
    });
  }
});

app.get('/dispPointFileSelect', async function(req, res, next){
  let connection;
	var retStr = "";
  try{
    connection = await mysql.createConnection(dbConf)
    var instruction = "SELECT ROUTE.route_name, POINT.point_index, POINT.point_name, POINT.latitude, POINT.longitude FROM POINT INNER JOIN ROUTE ON ROUTE.route_id=POINT.route_id WHERE ROUTE.gpx_id=" + req.query.gpx_id + " ORDER BY ROUTE.route_name, POINT.point_index";
    var allRoutes = await connection.execute(instruction);
  }catch(e){
   retStr = retStr + "Failed to get all routes. error: "+e + "\n";
  }finally {
    if (connection && connection.end) connection.end();
		if (retStr == "") {
			retStr = "All routes succesfully obtained";
		}
    res.send({
      allRoutes: allRoutes[0],
			retStr: retStr
    });
  }
});


app.listen(portNum);
console.log('Running app at localhost: ' + portNum);
