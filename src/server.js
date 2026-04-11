const http = require('http');
const app = require('./app');
const { PORT } = require('./config/env');
const { initSocket } = require('./socket');

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



