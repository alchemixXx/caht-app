function generateMessage(text, name='Admin') {
  return {
    msg: text,
    createdAt: new Date().getTime(),
    name: name,
  };
}

function generateLocationMessage(position, name) {
  const url = `https://google.com/maps?q=${position.latitude},${position.longitude}`;
  return {
    msg: url,
    createdAt: new Date().getTime(),
    name: name,
  };
}

const users = [];

function addUser({ id, username, room }) {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room are required!',
    };
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: `Username ${username} is taken in room ${room}`,
    };
  }

  const user = { id, username, room };

  users.push(user);

  return { user };
}

function removeUser(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    return {
      error: 'no such user',
    };
  }

  return users.splice(index, 1)[0];
}

function getUser(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    return {
      error: 'no such user',
    };
  }

  return users[index];
}

function getUsersInRoom(room) {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
}

module.exports = {
  generateMessage,
  generateLocationMessage,
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
