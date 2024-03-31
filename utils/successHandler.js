const headers = require("./headers.js");

const successHandler = (res, content) => {
  res.writeHead(200, headers);
  res.write(
    JSON.stringify({
      success: true,
      data: content,
    })
  );
  res.end();
};

module.exports = successHandler;
