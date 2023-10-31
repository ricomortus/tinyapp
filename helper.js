const findUserByEmail = (email, usersDatabase) => {
  for (let userID in usersDatabase) {
    if (usersDatabase[userID].email === email) {
      return usersDatabase[userID];
    }
  }
  return null;
};

module.exports = { findUserByEmail };