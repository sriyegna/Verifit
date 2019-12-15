'use strict'


// Express App (Routes)
const express = require("express");
const app     = express();
const cors = require("cors");
const path    = require("path");
const moment = require('moment');
const { RestClient } = require('@signalwire/node')
const client = new RestClient('28361e6c-85b8-40f5-bde1-bfc8cf68a96c', 'PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be', { signalwireSpaceUrl: 'manish.signalwire.com' })

//mysql2
const mysql = require('mysql2/promise');
let dbConf = {
	host     : 'remotemysql.com',
	user     : 'DGWD3pwB9b',
	password : 'HPxda9fPEL',
	database : 'DGWD3pwB9b'
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requeted-With, Content-Type, Accept, Authorization, RBR");
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  if (req.method === 'OPTIONS') {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
 }); 

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
app.get('/index.js',function(req,res, next){
  fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
    res.contentType('application/javascript');
    res.send(minimizedContents._obfuscatedCode);
  });
});

//******************** Your code goes here ******************** 

//Purchase a new US number
app.post('/purchasenumberus', async function(req , res, next){
  //Setting variables
  var retStr = ""; //String to return
  let receivedNumber; // = "+122363364246";
  let receivedSid; // = "123456789123015154876" + (Math.random() * 1000).toString();
  let username = req.query.username;
  let create_date =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  let expire_date = moment(new Date()).add(30, 'days').format("YYYY-MM-DD HH:mm:ss");

  //Signalwire code. Lookup US number and purchase
  await client
  .availablePhoneNumbers('US')
  .local.list({})
  .then(availablePhoneNumbers => {
    const number = availablePhoneNumbers[0];
    receivedNumber = number.phoneNumber;
    return client.incomingPhoneNumbers.create({
      phoneNumber: number.phoneNumber,
    });
  })
  .then(purchasedNumber => {
    receivedSid = purchasedNumber.sid;
  });

  //Mysql code. Add number to US phone table
  let connection;
  try {
    connection = await mysql.createConnection(dbConf);
    var instruction = "INSERT INTO USNumbers (phone_sid, phone_number, username, time_created, time_expired) VALUES ('" + receivedSid + "', '" + receivedNumber + "', '" + username + "', '" + create_date + "', '" + expire_date + "');"; 
    var result = await connection.execute(instruction);
    retStr = retStr + "Success";
  }
  catch (err) {
    console.log(err);
    retStr = retStr + "Fail";
  }

  //return
  res.send({
    number: receivedNumber,
    sid: receivedSid,
    retStr : retStr
  });
});

//Purchase a new CA number
app.post('/purchasenumberca', async function(req , res, next){
  //Setting variables
  var retStr = ""; //String to return
  let receivedNumber; // = "+122363364246";
  let receivedSid; // = "123456789123015154876" + (Math.random() * 1000).toString();
  console.log(req);
  let username = req.query.username;
  console.log(username);
  let create_date =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  let expire_date = moment(new Date()).add(30, 'days').format("YYYY-MM-DD HH:mm:ss");

  //Signalwire code. Lookup US number and purchase
  await client
  .availablePhoneNumbers('CAN')
  .local.list({
    inRegion: 'ON',
  })
  .then(availablePhoneNumbers => {
    const number = availablePhoneNumbers[0];
    receivedNumber = number.phoneNumber;
    return client.incomingPhoneNumbers.create({
      phoneNumber: number.phoneNumber,
    });
  })
  .then(purchasedNumber => {
    receivedSid = purchasedNumber.sid;
  });

  //Mysql code. Add number to US phone table
  let connection;
  try {
    connection = await mysql.createConnection(dbConf);
    var instruction = "INSERT INTO CANumbers (phone_sid, phone_number, username, time_created, time_expired) VALUES ('" + receivedSid + "', '" + receivedNumber + "', '" + username + "', '" + create_date + "', '" + expire_date + "');"; 
    var result = await connection.execute(instruction);
    retStr = retStr + "Success";
  }
  catch (err) {
    console.log(err);
    retStr = retStr + "Fail";
  }

  //return
  res.send({
    number: receivedNumber,
    sid: receivedSid,
    retStr : retStr
  });
});

//Get User US Numbers
app.post('/getuserusnumbers', async function(req , res, next){
  //Setting variables
  var retStr = ""; //String to return
  let username = req.query.username;

  //Mysql code. Add number to US phone table
  let connection;
  try {
    connection = await mysql.createConnection(dbConf);
    //SELECT * FROM USNumbers INNER JOIN CANumbers on USNumbers.username=CANumbers.username WHERE USNumbers.username = 'username' OR CANumbers.username = 'username'
    var instruction = "INSERT INTO CANumbers (phone_sid, phone_number, username, time_created, time_expired) VALUES ('" + receivedSid + "', '" + receivedNumber + "', '" + username + "', '" + create_date + "', '" + expire_date + "');"; 
    var result = await connection.execute(instruction);
    retStr = retStr + "Success";
  }
  catch (err) {
    console.log(err);
    retStr = retStr + "Fail";
  }

  //return
  res.send({
    number: receivedNumber,
    sid: receivedSid,
    retStr : retStr
  });
});

app.listen(portNum);
console.log('Running app at localhost: ' + portNum);