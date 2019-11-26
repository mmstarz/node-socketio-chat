const messageFormat = (text, username) => {
  return {
    msg: text,
    createdAt: new Date().getTime(),
    username
  };
};

const locationFormat = (coords, username) => {
  return {
    coords,
    createdAt: new Date().getTime(),
    username
  };
};

module.exports = {
  messageFormat,
  locationFormat
};
