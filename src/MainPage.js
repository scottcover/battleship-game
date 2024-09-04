import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/game');
  };

  return (
    <div className="main-container">
      <header className="header">
        <h1>Battleship Game</h1>
      </header>
      <div className="content">
        <p>Welcome to the Battleship game! Are you ready to play?</p>
        <button className="play-button" onClick={handlePlayClick}>Play</button>
      </div>
    </div>
  );
};

export default MainPage;

