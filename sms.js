const accountSid = 'AC2b6dca4154a03105caade2a3569d2df1';
const authToken = 'e7a6457d75e2b89e96729ee055fe95f0';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'You have got a new RIDE!!GO to the given location fast',
     from: '+12028041787',
     to: '+919619730222'
  })
  .then(message => console.log(message));

// var navigator=window.navigator;
// if ("geolocation" in navigator) {
//   // check if geolocation is supported/enabled on current browser
//   navigator.geolocation.getCurrentPosition(
//   function success(position) {
//      // for when getting location is a success
//      console.log('latitude', position.coords.latitude, 
//                  'longitude', position.coords.longitude);
//   },
//   function error(error_message) {
//     // for when getting location results in an error
//     console.error('An error has occured while retrieving location', error_message);
//   }  
// );
// }
// else {
//   // geolocation is not supported
//   // get your location some other way
//   console.log('geolocation is not enabled on this browser');
// }