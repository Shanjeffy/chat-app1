const moment = require('moment');

function formatMessage(username, text, avatar = '') {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    avatar
  };
}

module.exports = formatMessage;
