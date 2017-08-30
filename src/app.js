// Do NOT modify this file; make your changes in server.js.
const { server } = require('./server.js');

/* eslint no-console: 0 */
const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
// server.listen(port, (err) => {
//   console.log(`Server is listening on port: ${port}`);
//   if (err) {
//     console.log('\n************************');
//     console.log("ERROR: Couldn't connect to MongoDB.");
//     console.log('ERROR: Do you have it running?????');
//     console.log('************************\n');
//   }
// });
