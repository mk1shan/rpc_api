const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the protobuf
const PROTO_PATH = path.join(__dirname, 'weather.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const weatherProto = grpc.loadPackageDefinition(packageDefinition).weather;

// Create a gRPC client
const client = new weatherProto.WeatherService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Initialize Express
const app = express();
app.use(express.json());

// Define a route that uses the gRPC client
app.get('/weather', (req, res) => {
  const location = req.query.location || 'New York';
  client.GetWeather({ location }, (error, response) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(response);
    }
  });
});

// Start the Express server
app.listen(3006, () => {
  console.log('Express server running on port 3006');
});
