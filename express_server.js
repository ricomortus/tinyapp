const express = require("express");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { findUserByEmail, urlsForUser } = require('./helper');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [
    'zXwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA0123456789abcdef',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789abcd'
  ],
}));

const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

//New url database structure
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    // userID: "test",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    // userID: "test",
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
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  if (!userID || !users[userID]) {
    res.status(403).send("Please log in to access your urls.");
    return;
  }
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: users[userID],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  if (!userID && !users[userID]) {
    res.status(403).send('You cannot shorten your URLs until you log in!');
    return;
  }
  const id = generateRandomString();
  //Update access of longURL with new data structure
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID
  };
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  if (!userID || !users[userID]) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user: users[userID]
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  //accessing the unique short url id via params
  const id = req.params.id;
  //make sure user is logged in to access this page.
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  //Extract current users urls
  const userUrls = urlsForUser(userID, urlDatabase);

  if (!userID || !users[userID]) {
    res.status(403).send("Please log in to access first.");
    return;
  } else {
    //Loop through the userUrls object
    for (let key in userUrls) {
      //Check for matches of the params id, if matched, render.
      if (key === id) {
        //Update access of longURL with new data structure
        const longURL = urlDatabase[id].longURL;
        if (!longURL) {
          return res.status(404).send("Short URL ID does not exist.");
        }
        const templateVars = {
          id,
          longURL,
          user: users[userID]
        };
        res.render("urls_show", templateVars);
      }
    }
    //Return error message if user is trying to access a link that does not belong to them.
    return res.status(403).send("You cannot access this URL.");
  }
});
  

/**
 * HTTP or HTTPS must be appended on long URLs for this to redirect properly.
 */
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send("Short URL ID does not exist.");
  }
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
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  if (userID && users[userID]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[userID]
  };
  res.render("urls_login", templateVars);
});



app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);
  if (user) {
    if (password === user.password) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send('Incorrect password');
    }
  } else {
    res.status(403).send('Email not registered.');
  }
});

app.post("/logout", (req,res) => {
  delete req.session.user_id;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  // const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  if (userID && users[userID]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[userID]
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
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});