const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");

let db;

app.set("view engine", "ejs");
app.use(methodOverride("_method"));

app.use("/public", express.static("public"));

MongoClient.connect(
  "mongodb+srv://benfsong11:wiegoethe11@cluster0.rbjrl.mongodb.net/boardapp?retryWrites=true&w=majority",
  function (err, client) {
    if (err) {
      return console.log(err);
    }

    db = client.db("boardapp");

    app.listen(8080, function () {
      console.log("listening on 8080");
    });
  }
); // DB 접속이 완료되면 Node.js 서버를 띄워 준다.

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  //   res.sendFile(__dirname + "/index.html");
  res.render("index.ejs");
});

app.get("/write", function (req, res) {
  //   res.sendFile(__dirname + "/write.html");
  res.render("write.ejs");
});

app.get("/list", function (req, res) {
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      res.render("list.ejs", { posts: result });
    });
});

app.post("/add", function (req, res) {
  db.collection("counter").findOne(
    { name: "contentCount" },
    function (err, result) {
      let totalContentCount = result.totalPost;

      db.collection("post").insertOne(
        {
          _id: totalContentCount + 1,
          title: req.body.title,
          content: req.body.content,
        },
        function (err, result) {
          console.log("저장 완료!");
          res.redirect("/list");
          db.collection("counter").updateOne(
            { name: "contentCount" },
            { $inc: { totalPost: 1 } },
            function (err, result) {
              if (err) {
                return console.log(err);
              }
            }
          );
        }
      );
    }
  );
}); // 데이터는 Object 자료형으로 저장해야 한다.

app.delete("/delete", function (req, res) {
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, function (err, result) {
    console.log("삭제 완료!");
  });
});

app.get("/detail/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      res.render("detail.ejs", { detailPosts: result });
    }
  );
});

app.get("/edit/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      res.render("edit.ejs", { editPosts: result });
    }
  );
});

app.put("/edit", function (req, res) {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { title: req.body.title, content: req.body.content } },
    function (err, result) {
      console.log("수정 완료!");
      res.redirect("/list");
    }
  );
});
