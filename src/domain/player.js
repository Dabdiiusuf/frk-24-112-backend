// const { generateUsername } = require("unique-username-generator");
const { generatePirateName } = require("../util/pirateNames.js");
const uuid = require("uuid");
const ERR_MSGS = require("../util/error_messages.js");
const util = require("../util/util.js");

const players = [];

const create = (name) => {
  const finalName =
    name && String(name).trim() ? String(name).trim() : generatePirateName(); // <- pirate name fallback

  const player = {
    id: uuid.v4(),
    name: finalName,
  };

  players.push(player);
  return player;
};

const update = () => {};

const remove = () => {};

const findById = (id) => {
  if (!id) throw ERR_MSGS.ERR_INVALID_PLAYER_ID;
  const player = players.find((user) => user.id === id);
  if (!player) throw ERR_MSGS.ERR_PLAYER_NOT_FOUND;
  return player;
};

const getAll = () => {
  return players;
};

module.exports = { create, update, remove, findById, getAll };
