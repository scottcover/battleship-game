import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BattleshipGame.css';

const GRID_SIZE = 10;
const SHIPS = [
  { id: 1, length: 5, name: 'Carrier', placed: false },
  { id: 2, length: 4, name: 'Battleship', placed: false },
  { id: 3, length: 3, name: 'Cruiser', placed: false },
  { id: 4, length: 3, name: 'Submarine', placed: false },
  { id: 5, length: 2, name: 'Destroyer', placed: false },
];

const generateEmptyGrid = () => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
};

const BattleshipGame = () => {
  const [playerGrid, setPlayerGrid] = useState(generateEmptyGrid());
  const [aiGrid, setAiGrid] = useState(generateEmptyGrid());
  const [playerShips, setPlayerShips] = useState(SHIPS);
  const [aiShips, setAiShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [horizontal, setHorizontal] = useState(true);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [placingShips, setPlacingShips] = useState(true);
  const [aiHits, setAiHits] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const aiShips = placeShips(SHIPS);
    setAiShips(aiShips);
    const aiGridWithShips = generateGridWithShips(aiShips);
    setAiGrid(aiGridWithShips);
  }, []);

  const placeShips = (ships) => {
    const grid = generateEmptyGrid();
    const placedShips = [];

    ships.forEach(ship => {
      let placed = false;

      while (!placed) {
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        const positions = [];

        for (let i = 0; i < ship.length; i++) {
          const r = orientation === 'horizontal' ? row : row + i;
          const c = orientation === 'horizontal' ? col + i : col;

          if (r >= GRID_SIZE || c >= GRID_SIZE || grid[r][c] !== null) {
            break;
          }

          positions.push({ row: r, col: c });
        }

        if (positions.length === ship.length) {
          positions.forEach(({ row, col }) => {
            grid[row][col] = ship;
          });
          placedShips.push({ ...ship, positions });
          placed = true;
        }
      }
    });

    return placedShips;
  };

  const generateGridWithShips = (ships) => {
    const grid = generateEmptyGrid();
    ships.forEach(ship => {
      ship.positions.forEach(({ row, col }) => {
        grid[row][col] = ship;
      });
    });
    return grid;
  };

  const handleCellClick = (row, col) => {
    if (placingShips) {
      placePlayerShip(row, col);
    } else if (playerTurn && !gameOver) {
      handlePlayerAttack(row, col);
    }
  };

  const placePlayerShip = (row, col) => {
    if (!selectedShip) return;

    const newGrid = [...playerGrid];
    const newShips = [...playerShips];
    const ship = newShips.find(ship => ship.id === selectedShip);
    const { length } = ship;
    const positions = [];

    for (let i = 0; i < length; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;

      if (r >= GRID_SIZE || c >= GRID_SIZE || newGrid[r][c] !== null) {
        return;
      }

      positions.push({ row: r, col: c });
    }

    positions.forEach(({ row, col }) => {
      newGrid[row][col] = ship;
    });

    ship.positions = positions;
    ship.placed = true;

    setPlayerGrid(newGrid);
    setPlayerShips(newShips);
    setSelectedShip(null);

    if (newShips.every(ship => ship.placed)) {
      setPlacingShips(false);
    }
  };

  const handlePlayerAttack = (row, col) => {
    if (aiGrid[row][col] === 'hit' || aiGrid[row][col] === 'miss') return;

    const newAiGrid = [...aiGrid];
    if (aiGrid[row][col] === null) {
      newAiGrid[row][col] = 'miss';
    } else if (typeof aiGrid[row][col] === 'object') {
      newAiGrid[row][col] = 'hit';
    }
    setAiGrid(newAiGrid);
    checkGameOver(newAiGrid, 'player');
    setPlayerTurn(false);
    if (!gameOver) handleAiAttack();
  };

  const handleAiAttack = () => {
    if (gameOver) return;

    let row, col;

    if (aiHits.length > 0) {
      const lastHit = aiHits[aiHits.length - 1];
      const potentialTargets = [
        { row: lastHit.row - 1, col: lastHit.col },
        { row: lastHit.row + 1, col: lastHit.col },
        { row: lastHit.row, col: lastHit.col - 1 },
        { row: lastHit.row, col: lastHit.col + 1 },
      ];

      const validTargets = potentialTargets.filter(target =>
        target.row >= 0 &&
        target.row < GRID_SIZE &&
        target.col >= 0 &&
        target.col < GRID_SIZE &&
        playerGrid[target.row][target.col] !== 'hit' &&
        playerGrid[target.row][target.col] !== 'miss'
      );

      if (validTargets.length > 0) {
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        row = target.row;
        col = target.col;
      }
    }

    if (row === undefined || col === undefined) {
      do {
        row = Math.floor(Math.random() * GRID_SIZE);
        col = Math.floor(Math.random() * GRID_SIZE);
      } while (playerGrid[row][col] === 'hit' || playerGrid[row][col] === 'miss');
    }

    const newPlayerGrid = [...playerGrid];
    if (playerGrid[row][col] === null) {
      newPlayerGrid[row][col] = 'miss';
    } else if (typeof playerGrid[row][col] === 'object') {
      newPlayerGrid[row][col] = 'hit';
      setAiHits([...aiHits, { row, col }]);
    }
    setPlayerGrid(newPlayerGrid);
    checkGameOver(newPlayerGrid, 'ai');
    setPlayerTurn(true);
  };

  const checkGameOver = (grid, player) => {
    if (player === 'player') {
      const allShipsSunk = aiShips.every(ship =>
        ship.positions.every(({ row, col }) => grid[row][col] === 'hit')
      );
      if (allShipsSunk) {
        setGameOver(true);
        const playAgain = window.confirm('Congratulations! You sank all enemy ships. You win! Do you want to play again?');
        if (playAgain) {
          window.location.reload();
        } else {
          navigateToMainPage();
        }
      }
    } else {
      const allShipsSunk = playerShips.every(ship =>
        ship.positions.every(({ row, col }) => grid[row][col] === 'hit')
      );
      if (allShipsSunk) {
        setGameOver(true);
        const playAgain = window.confirm('Oh no! The enemy sank all your ships. You lose. Do you want to play again?');
        if (playAgain) {
          window.location.reload();
        } else {
          navigateToMainPage();
        }
      }
    }
  };

  const navigateToMainPage = () => {
    navigate('/');
  };

  const renderPlayerGrid = (grid, handleClick) => {
    return grid.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            className={`cell ${cell === 'hit' ? 'hit' : cell === 'miss' ? 'miss' : cell ? 'ship' : ''}`}
            onClick={() => handleClick(rowIndex, colIndex)}
          >
            {cell === 'hit' ? 'X' : cell === 'miss' ? 'O' : ''}
          </div>
        ))}
      </div>
    ));
  };

  const renderAiGrid = (grid, handleClick) => {
    return grid.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            className={`cell ${cell === 'hit' ? 'hit' : cell === 'miss' ? 'miss' : ''}`}
            onClick={() => handleClick(rowIndex, colIndex)}
          >
            {cell === 'hit' ? 'X' : cell === 'miss' ? 'O' : ''}
          </div>
        ))}
      </div>
    ));
  };

  const selectShip = (shipId) => {
    setSelectedShip(shipId);
  };

  return (
    <div className="App">
      <h1>Battleship</h1>
      <div className="grid-container">
        <div className="ai-grid">
          <h2>AI Grid</h2>
          {renderAiGrid(aiGrid, handlePlayerAttack)}
        </div>
        <div className="player-area">
          <div className="player-grid">
            <h2>Player Grid</h2>
            {renderPlayerGrid(playerGrid, handleCellClick)}
          </div>
          {placingShips && (
            <div className="ship-selector">
              <h2>Select a ship</h2>
              <div className="ships">
                {playerShips.map(ship => (
                  <button
                    key={ship.id}
                    onClick={() => selectShip(ship.id)}
                    disabled={ship.placed}
                  >
                    {`${ship.name} (${ship.length})`}
                  </button>
                ))}
              </div>
              <button onClick={() => setHorizontal(!horizontal)}>
                {horizontal ? 'Horizontal' : 'Vertical'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleshipGame;
