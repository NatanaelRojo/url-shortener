const express = require('express');
require('dotenv').config();
const serverSetup = require('./serverSetup');
const shortId = require('shortid');
const Url = require('./db/models/Url.model');

let app = express();
serverSetup(app);

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.json({ error: 'invalid url' });
  }
  const foundUrl = await Url.findOne({ originalUrl: url });
  if (!foundUrl) {
    const newUrl = await Url.create({ originalUrl: url, shortUrl: shortId.generate() });
    return res.json({ original_url: newUrl.originalUrl, short_url: newUrl.shortUrl });
  }
  return res.json({ original_url: foundUrl.originalUrl, short_url: foundUrl.shortUrl });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
