require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const urlparser = require("url");
const dns = require("dns");
const mongoose = require("mongoose");

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose
  .connect("mongodb+srv://root:root@cluster0.sm95v3e.mongodb.net/")
  .then(() => console.log("Conexion conn mongo exitosa"))
  .catch((error) => console.log(error));

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});

const Url = mongoose.model("Urls", urlSchema);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address) res.json({ error: "Invalida URL" });
    else {
      const urlCount = await Url.countDocuments({}); // buscar cant de registros en la BD
      const newUrl = new Url({
        original_url: url,
        short_url: urlCount,
      });

      newUrl.save();

      res.json({
        original_url: url,
        short_url: urlCount,
      });
    }
  });
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDoc = await Url.findOne({ short_url: +shorturl });
  res.redirect(urlDoc.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
