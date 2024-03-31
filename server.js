const http = require("http");
const mongoose = require("mongoose");

const dotenv = require("dotenv")
dotenv.config({path:"./config.env"});

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

const PostModel = require("./model/post.js");
const headers = require("./utils/headers.js");
const successHandler = require("./utils/successHandler.js");
const errorHandler = require("./utils/errorHandler.js");

(async () => {
  try {
    await mongoose.connect(DB);
    console.log("資料庫連接成功");
  } catch (err) {
    console.log(err);
  }
})();

const requestListener = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url === "/posts" && req.method === "GET") {
    const post = await PostModel.find();
    successHandler(res, post);
    return;
  }

  if (req.url === "/posts" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (data.content !== undefined) {
          const newPost = await PostModel.create({
            name: data.name,
            content: data.content,
            tags: data.tags,
            type: data.type,
          });
          successHandler(res, newPost);
        } else {
          errorHandler(res, "輸入欄位不正確");
        }
      } catch (err) {
        errorHandler(res, "資料格式錯誤");
      }
    });
    return;
  }

  if (req.url.startsWith("/posts/") && req.method === "DELETE") {
    try {
      const id = req.url.split("/").pop();
      await PostModel.findByIdAndDelete(id);
      successHandler(res, null);
    } catch (err) {
      errorHandler(res, "查無此 ID");
    }
    return;
  }

  if (req.url === "/posts" && req.method === "DELETE") {
    await PostModel.deleteMany({});
    successHandler(res, []);
    return;
  }

  if (req.url.startsWith("/posts/") && req.method === "PATCH") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const id = req.url.split("/").pop();
        if (data.content !== undefined) {
          const editContent = {
            content: data.content,
          };
          try {
            const editPost = await PostModel.findByIdAndUpdate(id, editContent);
            successHandler(res, editPost);
          } catch (err) {
            errorHandler(res, "查無此 ID");
          }
        } else {
          errorHandler(res, "content 為必填");
        }
      } catch (err) {
        errorHandler(res, "資料格式錯誤");
      }
    });
    return;
  }

  if (req.url === "/posts" && req.method === "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  errorHandler(res, "無此路由", 404);
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3000);
