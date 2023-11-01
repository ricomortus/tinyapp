const findUserByEmail = (email, usersDatabase) => {
  for (let userID in usersDatabase) {
    if (usersDatabase[userID].email === email) {
      return usersDatabase[userID];
    }
  }
  return undefined;
};

const urlsForUser = (id, urlDatabase) => {
  let userUrls = { };
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      userUrls[key] = {
        longURL: urlDatabase[key].longURL,
        userID: urlDatabase[key].userID
      };
    }
  }
  return userUrls;
};

module.exports = { findUserByEmail, urlsForUser };