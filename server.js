const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const axios = require('axios');  // Add axios for HTTP requests

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

// Replace with your actual weather API key
const WEATHER_API_KEY = '4a0abbc8b904c7ecd6a197e54823c7c2';

// Implement the WeatherService
async function GetWeather(call, callback) {
  const location = call.request.location;
  const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`;

  try {
    const response = await axios.get(apiUrl);
    const weatherData = response.data;

    const weatherResponse = {
      location: weatherData.name,
      temperature: `${weatherData.main.temp}°C`,
      condition: weatherData.weather[0].description,
      humidity: `${weatherData.main.humidity}%`,
    };

    callback(null, weatherResponse);
  } catch (error) {
    callback({
      code: grpc.status.NOT_FOUND,
      message: `Could not fetch weather for location: ${location}`,
    });
  }
}

// Start the gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(weatherProto.WeatherService.service, { GetWeather });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server running on port 50051');
    server.start();
  });
}

main();
