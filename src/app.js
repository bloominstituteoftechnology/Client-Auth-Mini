// Do NOT modify this file; make your changes in server.js.
const { server } = require('./server.js');

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`server running on ${port}`));
