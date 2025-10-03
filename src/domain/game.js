//https://en.wikipedia.org/wiki/Go_(game)
const { environments, ENV, logger } = require("../config");
const {
  emptyGame,
  fullGame,
  whiteGame,
  blackGame,
} = require("../test_data/loader");

const uuid = require("uuid");
const gomokuHandler = require("./gomoku.js");
const playerHandler = require("./player.js");
const ERR_MSGS = require("../util/error_messages.js");

let numGames = 0;
const COLS = 10;
const ROWS = 10;
const games = [];

const createGame = (name) => {
  if (!name) {
    name = "game_" + numGames++;
  }
  const board = gomokuHandler.createBoard();
  const game = {
    id: uuid.v4(),
    name: name,

    round: 0,
    currentPlayer: 1,
    player1: null,
    player2: null,
    state: "waiting",
    board: board,
    winner: null,
    winnerNumber: null,
  };
  games.push(game);
  return game;
};

if (ENV === environments.DEV || ENV === environments.TEST) {
  games.push(emptyGame);
  games.push(fullGame);
  games.push(whiteGame);
  games.push(blackGame);
  createGame("ramdom game 1");
  createGame("ramdom game 2");
}

const saveGame = (game) => {
  return game;
};
const getGames = () => {
  return games;
};

const addPlayer = (id, playerName) => {
  const game = findGameById(id);
  if (game.player2) {
    throw ERR_MSGS.ERR_GAME_FULL;
  }
  const player = playerHandler.create(playerName);
  if (game.player1 == null) {
    game.player1 = player;
  } else {
    game.player2 = player;
  }
  // auto-start when 2 players
  if (game.player1 && game.player2 && game.state === "waiting") {
    game.state = "in_progress";
    game.currentPlayer = 1;
  }
  return game;
};

// helper: map playerId -> 1 or 2 (throws if not in game)
const playerNumberFor = (game, playerId) => {
  if (game.player1?.id === playerId) return 1;
  if (game.player2?.id === playerId) return 2;
  throw ERR_MSGS.ERR_PLAYER_NOT_FOUND;
};

// helper: after a valid move, update outcome
const updateOutcome = (game, lastMoverNumber) => {
  if (gomokuHandler.isWin(game.board)) {
    game.state = "won";
    game.winnerNumber = lastMoverNumber;
    game.winner = lastMoverNumber === 1 ? game.player1 : game.player2;
    return;
  }
  if (gomokuHandler.isTie(game.board)) {
    game.state = "tie";
    game.winnerNumber = null;
    game.winner = null;
    return;
  }
  game.state = "in_progress";
};

const play = (id, playerId, col, row) => {
  if (!id) throw ERR_MSGS.ERR_GAME_NOT_FOUND;
  const game = findGameById(id);
  if (!game) throw ERR_MSGS.ERR_GAME_NOT_FOUND;
  if (!playerId) throw ERR_MSGS.ERR_PLAYER_NOT_FOUND;

  if (game.state === "waiting") {
    // not enough players
    throw (
      ERR_MSGS.ERR_GAME_NOT_READY ?? new Error("Game is waiting for players")
    );
  }
  if (game.state === "won" || game.state === "tie") {
    throw ERR_MSGS.ERR_GAME_FINISHED ?? new Error("Game already finished");
  }

  const moverNumber = playerNumberFor(game, playerId);
  if (moverNumber !== game.currentPlayer) {
    throw ERR_MSGS.ERR_NOT_YOUR_TURN ?? new Error("Not your turn");
  }

  // apply move using rules engine (validates bounds/occupancy)
  gomokuHandler.play(game.board, col, row, moverNumber);

  // advance round, check outcome, and set next player if game continues
  game.round += 1;
  updateOutcome(game, moverNumber);
  if (game.state === "in_progress") {
    game.currentPlayer = moverNumber === 1 ? 2 : 1;
  }
  return game;
};

const findGamesByName = (name) => {
  return games.filter((game) => game.name === name);
};

const findGameById = (id) => {
  console.log(games);
  if (!id) throw ERR_MSGS.ERR_GAME_NOT_FOUND;
  const game = games.find((game) => game.id === id);
  if (!game) {
    console.log("No game found!");
    throw ERR_MSGS.ERR_GAME_NOT_FOUND;
  }
  return game;
};

const joinGame = (gameId, playerId) => {
  if (!gameId) throw ERR_MSGS.ERR_GAME_NOT_FOUND;
  if (!playerId) throw ERR_MSGS.ERR_INVALID_PLAYER_ID;

  const game = findGameById(gameId);
  const player = playerHandler.findById(playerId); // throws if invalid/not found
  // already in game → no-op
  if (game.player1?.id === player.id || game.player2?.id === player.id)
    return game;

  if (game.player1 == null) {
    game.player1 = player;
  } else if (game.player2 == null) {
    game.player2 = player;
  } else {
    throw ERR_MSGS.ERR_GAME_FULL;
  }
  if (game.player1 && game.player2 && game.state === "waiting") {
    game.state = "in_progress";
    game.currentPlayer = 1;
  }

  return game;
};

module.exports = {
  play,
  createGame,
  saveGame,
  getGames,
  findGameById,
  findGamesByName,
  addPlayer,
  joinGame,
};
