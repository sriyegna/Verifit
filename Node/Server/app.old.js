const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

app.get('/requestnumber', function(req , res){
  //let retStr = req.query.name1 + " " + req.query.name2;
  const { RestClient } = require('@signalwire/node')
  const client = new RestClient('YourProjectID', 'YourAuthToken', { signalwireSpaceUrl: 'example.signalwire.com' })

client
  .availablePhoneNumbers('US')
  .local.list({
    inRegion: 'WA',
  })
  .then(availablePhoneNumbers => {
    const number = availablePhoneNumbers[0];
    return client.incomingPhoneNumbers.create({
      phoneNumber: number.phoneNumber,
    });
  })
  .then(purchasedNumber => console.log(purchasedNumber.sid));

  res.send({
    foo: "someText"
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});