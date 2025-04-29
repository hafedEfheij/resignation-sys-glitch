const http = require('http');
const options = {
  host: process.env.PROJECT_DOMAIN + '.glitch.me',
  port: 80,
  path: '/'
};

console.log('Keep-alive service started');
setInterval(function() {
  http.get(options, function(res) {
    console.log('Keeping application alive - ' + new Date());
  }).on('error', function(err) {
    console.log('Error occurred: ' + err.message);
  });
}, 280000); // ping every 4.6 minutes (Glitch sleeps after 5 minutes of inactivity)
