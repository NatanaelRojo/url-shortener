const express = require('express');
const shortId = require('shortid');
const serverSetup = require('./serverSetup');
const dns = require("dns").promises;  // Use the promise-based API
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

serverSetup(app);

// In-memory storage for short URLs
const urlDatabase = {};

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// POST /api/shorturl
app.post('/api/shorturl', async (req, res) => {
  const { url = '' } = req.body;

  // Validate the URL format
  try {
    const validUrl = new URL(url);
    // Perform DNS resolution to check if the hostname is valid
    await dns.resolve6(validUrl.hostname); // Check if hostname resolves to an IP address
  } catch (err) {
    console.log(err);
    return res.json({ error: "invalid url" });
  }

  // Check if URL is already shortened
  for (const [shortUrl, originalUrl] of Object.entries(urlDatabase)) {
    if (originalUrl === url) {
      return res.json({ original_url: url, short_url: shortUrl });
    }
  }

  // Generate a unique short URL
  const shortUrl = shortId.generate(); // Generate a unique ID
  urlDatabase[shortUrl] = url;

  res.json({ original_url: url, short_url: shortUrl });
});

// GET /api/shorturl/:short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url = '' } = req.params;
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
