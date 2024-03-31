const headers = require("./headers.js");

const errorHandler = (res, msg, statusCode = 404) => {
  res.writeHead(statusCode, headers);
  res.write(
    JSON.stringify({
      "success": false,
      "message": msg
    })
  );
  res.end();
};

module.exports = errorHandler;
