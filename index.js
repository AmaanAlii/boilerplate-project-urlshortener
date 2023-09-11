require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { parse } = require("path");
const app = express();
const dns = require("dns");
const url = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const original_urls = [];

app.post("/api/shorturl", (req, res) => {
  const givenUrl = req.body.url;
  const pasrsedUrl = url.parse(givenUrl);

  if (
    !pasrsedUrl.protocol ||
    !(pasrsedUrl.protocol === "http:" || pasrsedUrl.protocol === "https:")
  ) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(pasrsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    } else {
      let foundIndex = original_urls.indexOf(givenUrl);

      if (foundIndex < 0) {
        original_urls.push(givenUrl);
        foundIndex = original_urls.indexOf(givenUrl);
      }

      return res.json({
        original_url: givenUrl,
        short_url: foundIndex,
      });
    }
  });
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
  const urlIndex = parseInt(req.params.shortUrl);

  if (urlIndex < 0 || urlIndex >= original_urls.length) {
    return res.json({
      error: "Cannot find a short URL for the given URL",
    });
  }

  res.redirect(original_urls[urlIndex]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
