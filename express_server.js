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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "3lehaID" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "3lehaID": {
    id: "3lehaID",
    email: "3leha@id",
    password: "id"
  }
};

// loop over urlDatabase to find all urls created by a specific user using user_id
function urlsforUser(user_id) {
  let output = {}
  for (key in urlDatabase) {
    let element = urlDatabase[key];
    if (element.userID === user_id) {
      output[key] = element;
    }
  }
  return output;
}
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
  const templateVars = { urls: {}, users: {}, user_id: '' };
  if (req.cookies.user_id) {
    templateVars.users = users;
    templateVars.user_id = req.cookies.user_id;
    let userURLs = urlsforUser(req.cookies.user_id);
    templateVars.urls = userURLs;
  }
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  let templateVars = {}
  if (req.cookies.user_id) {
    console.log('from urls/new ', req.cookies.user_id)
    templateVars.users = users;
    templateVars.user_id = req.cookies.user_id;
    res.render('urls_new', templateVars);
  } else {
    let user_id;
    let users;
    templateVars = { user_id, users }
    res.redirect('/login');
  }
});
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL].longURL;
  const user_id = req.cookies.user_id;
  const templateVars = { shortURL, longURL, users, user_id };
  res.render('urls_show', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
  const user_id = req.cookies.user_id;
  urlDatabase[shortURL] = { longURL, userID: user_id };
  console.log('from 109: ', urlDatabase)
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
// from urls_show edit form
app.post('/urls/:id', (req, res) => {
  if (req.cookies.user_id) {
    const shortURL = req.params.id;
    const { longURL } = req.body;
    const { user_id } = req.cookies;
    let userURLs = urlsforUser(user_id);
    if (userURLs.hasOwnProperty(shortURL)) {
      userURLs[shortURL].longURL = longURL;
      res.redirect('/urls');
    } else {
      res.send("you don't have access to this URL")
    }
  } else {
    res.send('Please login to view or edit');
  }
  // urlDatabase[shortURL]["longURL"] = longURL;
  // res.redirect('/urls');
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