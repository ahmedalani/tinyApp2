/* eslint-disable */
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
app.use(cookieParser());
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
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
// loop over users to find user_id with matching email given
function findIDbyemail(em) {
  for (key in users) {
    if (users[key].email === em) {
      return key;
    }
  }
}
// loop over users insearch of matching email
function doesEmailExist(em) {
  for (key in users) {
    emailinDatabase = users[key].email
    if (emailinDatabase === em) {
      return true;
    }
  }
  return false;
}

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  if (req.cookies) {
    templateVars.users = users;
    templateVars.user_id = req.cookies.user_id;
  }
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  const user_id = req.cookies.user_id;
  const templateVars = { shortURL, longURL, users, user_id };
  res.render('urls_show', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.send('not Found')
  } else {
    res.redirect(longURL);
  }
});
app.get('/register', (req, res) => {
  let user_id;
  let users;
  const templateVars = { users, user_id };
  res.render('register', templateVars);
});
app.get('/login', (req, res) => {
  res.render('login');
});


app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const { longURL } = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});
app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
app.post('/urls/:shortURL/edit', (req, res) => {
  const { shortURL } = req.params;
  user_id = req.cookies.user_id
  res.redirect(`/urls/${shortURL}`);
});
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const { longURL } = req.body;
  urlDatabase[id] = longURL;
  res.redirect('/urls');
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let user_id = findIDbyemail(email);
  if (!user_id || users[user_id].password !== password) {
    res.status(403).send('invalid email address or password go back and try again!');
  } else {
    res.cookie('user_id', user_id);
    res.redirect('/urls');
  }
});
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
// create a new user with new ID then add it to users obj then set cookie
app.post('/register', (req, res) => {
  let { email, password } = req.body;
  if (email === '') {
    res.status(400).send('Something broke!')
  } else if (doesEmailExist(email)) {
    res.status(400).send('email exist, please try another email address')
  } else {
    let id = generateRandomString();
    let user = { id, email, password };
    users[id] = user;
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});