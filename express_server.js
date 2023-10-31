const express = require("express");
const cookieParser = require('cookie-parser');
const { findUserByEmail, urlsForUser } = require('./helper');
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


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

//New url database structure
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  test: {
    id: "test",
    email: "test@test.com",
    password: "test"
  }
};

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID && !users[userID]) {
    res.status(403).send("Please log in to access your urls.");
    return;
  }
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID && !users[userID]) {
    res.status(403).send('You cannot shorten your URLs until you log in!');
    return;
  }
  const id = generateRandomString();
  //Update access of longURL with new data structure
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID && !users[userID]) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  //Update access of longURL with new data structure
  const longURL = urlDatabase[id].longURL;
  if (!longURL) {
    return res.status(404).send("Short URL ID does not exist.");
  }
  const templateVars = {
    id,
    longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  //Update access of longURL with new data structure
  const longURL = urlDatabase[id].longURL;
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
  //Update access of longURL with new data structure
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});

//GET /login
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID && users[userID]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});



app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(password);
  const user = findUserByEmail(email, users);
  console.log(user);
  if (user) {
    if (password === user.password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      res.status(403).send('Incorrect password');
    }
  } else {
    res.status(403).send('Email not registered.');
  }
});

app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID && users[userID]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req,res) => {
  const { email, password } = req.body;
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