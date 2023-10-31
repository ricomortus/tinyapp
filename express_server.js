const express = require("express");
const cookieParser = require('cookie-parser');
const { findUserByEmail } = require('./helper');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  test: {
    id: "test",
    email: "test@test.com",
    password: "test"
  }
};

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new",templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});

// app.post("/login", (req, res) => {
//   const { username } = req.body;
//   res.cookie("user_id", username);
//   res.redirect("/urls");
// });

app.post("/login", (req, res) => {
  const { email } = req.body;

  // const userId = Object.keys(users).find(id => users[id].email === email);
  const user = findUserByEmail(email, users);
  if (user) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(401).send('Email not registered.');
  }
});

app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req,res) => {
  const { email, password } = req.body;
  // const userID = Object.keys(users).find(id => users[id].email === email);
  const user = findUserByEmail(email, users);

  if (email.length === 0 || password.length === 0) {
    res.status(400).send("A valid email and a valid password must be provided.");
  } else if (user) {
    res.status(400).send("This email already has an account associated with it.");
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email,
      password
    };
    res.cookie('user_id', id);
    res.redirect('/urls');
  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});