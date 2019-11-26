const users = [];

// addUser
const addUser = ({ id, username, room }) => {
  // format input data
  username = username.trim().toLowerCase();
  room = room
    .toString()
    .trim()
    .toLowerCase();

  // data validation
  if (!username || !room) {
    return {
      error: "username and room are required"
    };
  }

  // existing user check
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: "username already taken"
    };
  }

  // store new user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// removeUser
const removeUser = id => {
  // .findIndex() - stops find when index is found
  // .filter() - continues until end of array
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    // return removed user
    return users.splice(index, 1)[0];
  } else {
    return {
      error: "user not found"
    };
  }
};

// getUser
const getUser = id => {
  const user = users.find(user => user.id === id);

  if (!user) {
    return {
      error: "user not found"
    };
  }

  return user;
};

// getUsersInRoom
const getUsersInRoom = room => {
  // console.log(room);
  if (room) {
    room = room
      .toString()
      .trim()
      .toLowerCase();

    return users.filter(user => user.room === room);
  }
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
