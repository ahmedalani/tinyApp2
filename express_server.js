/* eslint-disable */
const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get('/', (req, res) => {
  res.send('Hello!!');
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL };
  res.render('urls_show', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.send('not Found')
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const { longURL } = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});