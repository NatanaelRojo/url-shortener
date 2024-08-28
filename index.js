const express = require('express');
const validUrl = require('valid-url');
const shortId = require('shortid');
const bodyParser = require("body-parser");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/public", express.static(process.cwd() + "/public"));

// In-memory storage for short URLs
const urlDatabase = {};

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

function urlValidator(url) {
  // const urlRegex = /^https:\/\/www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // const urlRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;
  // console.log(url);
  // console.log(urlRegex.test(url));
  // return urlRegex.test(url);
  try {
    const validUrl = new URL(url);
    if (validUrl.origin === "null") {
      console.log('null URL');
      console.log({ error: "invalid url" });
      // return res.json({ error: "invalid url" });
      return false;
    } else {
      console.log('try dns.lookup()');
      dns.lookup(validUrl.hostname, (err, addr, family) => {
        if (err || !addr) {
          console.log(`failed dns.lookup() on URL: ${url}`)
          console.log({ error: "invalid hostname" });
          // return res.json({ error: "invalid hostname" });
          return false;
        }
        console.log(`no dns.lookup() errors, ${req.body.url} must be valid`);
      });
    }
    return true;
  } catch (err) {
    console.log(err);
    console.log('caught error');
    console.log({ error: "invalid url" });
    // return res.json({ error: "invalid url" });
    return false;
  }
}

// POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const { url = '' } = req.body;
  const urlRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;
  console.log(url);

  if (urlValidator(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Validate the URL
  // if (!urlRegex.test(url)) {
  // if (!validUrl.isUri(url)) {
  // return res.json({ error: 'invalid url' });
  // }

  // Check if URL is already shortened
  for (const [shortUrl, originalUrl] of Object.entries(urlDatabase)) {
    if (originalUrl === url) {
      return res.json({ original_url: url, short_url: shortUrl });
    }
  }

  // Generate a unique short URL
  const shortUrl = shortId.generate(); // Generate a 6-character unique ID
  urlDatabase[shortUrl] = url;

  res.json({ original_url: url, short_url: shortUrl });
});

// GET /api/shorturl/:short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url = '' } = req.params;
  console.log(short_url);

  const originalUrl = urlDatabase[short_url];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
