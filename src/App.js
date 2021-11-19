import { useEffect, useState } from 'react';
import './App.css';
import Hex from './Hex'
import InvisibleHex from './InvisibleHex';
import hexPng from './hex.png';

function App() {

  const [prevBoardState, setPrevBoardState] = useState(null);
  const [boardState, setBoardState] = useState(initiateBoardState());
  const [currentPlayer, setCurrentPlayer] = useState("Red");
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [turnNumber, setTurnNumber] = useState(0);
  const [lastMoveLocation, setLastMoveLocation] = useState(null);

  function initiateBoardState() {
    const initialBoardState = Array(11);
    for (let i = 0; i < 11; i++) {
      initialBoardState[i] = Array(11);
      for (let j = 0; j < 11; j++) {
        initialBoardState[i][j] = {
          color: "hsla(0, 0%, 99%, 1)",
          fromTop: i === 0 ? 1 : 100,
          fromBottom: i === 10 ? 1 : 100,
          fromLeft: j === 0 ? 1 : 100,
          fromRight: j === 10 ? 1 : 100,
        }
      }
    }
    return initialBoardState;
  }

  function startGame() {
    setGameStarted(true);
  }

  useEffect(() => {
    function checkWinner() {
      if (winner) return;
      findRedWinner();
      findBlueWinner();
    }

    function findRedWinner() {
      const stack = [];
      const visitedHexes = createEmptyVisitedHexesMap();
      //add all left-side Red hexes to the stack
      for (let y = 0; y < 11; y++) {
        const startingLocation = { x: 0, y: y };
        if (boardState[y][0].color === "Red") {
          stack.push(startingLocation);
        }
      }
      while (stack.length >= 1) {
        const location = stack.pop();
        const { x, y } = location;
        if (x === 10) {
          setWinner("Red");
          return;
        }
        if (!visitedHexes.get(x).get(y)) {
          visitedHexes.get(x).set(y, true);
          const neighbors = getNeighbors(location);
          neighbors.forEach((neighbor) => {
            const neighborX = neighbor.x;
            const neighborY = neighbor.y;
            if (boardState[neighborY][neighborX].color === "Red") {
              stack.push(neighbor);
            }
          });
        }
      }
    }

    function findBlueWinner() {
      const stack = [];
      const visitedHexes = createEmptyVisitedHexesMap();
      //add all top-row blue hexes to the stack
      for (let x = 0; x < 11; x++) {
        const startingLocation = { x: x, y: 0 };
        if (boardState[0][x].color === "Blue") {
          stack.push(startingLocation);
        }
      }
      while (stack.length >= 1) {
        const location = stack.pop();
        const { x, y } = location;
        if (y === 10) {
          setWinner("Blue");
          return;
        }
        if (!visitedHexes.get(x).get(y)) {
          visitedHexes.get(x).set(y, true);
          const neighbors = getNeighbors(location);
          neighbors.forEach((neighbor) => {
            const neighborX = neighbor.x;
            const neighborY = neighbor.y;
            if (boardState[neighborY][neighborX].color === "Blue") {
              stack.push(neighbor);
            }
          });
        }
      }
    }

    checkWinner();
  }, [boardState, currentPlayer, winner, lastMoveLocation]);

  function populateHexes() {
    const hexes = [];

    //add top blue row
    for (let i = 0; i < 32; i++) {
      hexes.push(<InvisibleHex border={"Top"} color={i % 2 === 0 || i > 19 ? "inherit" : "Blue"} />);
    }

    for (let row = 0; row < 11; row++) {
      let hexesPushed = 0;
      let rightInvisiblePushed = false;
      for (let column = 0; column < 32; column++) {
        if (column < row) {
          if (column === row - 1) {
            hexes.push(<InvisibleHex border={"Left"} color={"Red"} />);
          } else {
            hexes.push(<InvisibleHex border={""} color={"inherit"} />);
          }
        } else if (hexesPushed === 11 && !rightInvisiblePushed) {
          hexes.push(<InvisibleHex border={"Right"} color={"Red"} />);
          rightInvisiblePushed = true;
        } else if (hexesPushed === 11 && rightInvisiblePushed) {
          hexes.push(<InvisibleHex border={""} color={"inherit"} />);
        } else {
          hexes.push(<Hex row={row} column={hexesPushed} color={boardState[row][hexesPushed].color} turn={turnNumber} winner={winner} onClickCallback={makeMove} />);
          hexesPushed++;
          column++;
        }
      }
    }

    //add bottom blue row
    for (let i = 0; i < 32; i++) {
      hexes.push(<InvisibleHex border={"Top"} color={i % 2 === 0 || i < 11 || i > 29 ? "inherit" : "Blue"} />);
    }
    return hexes;
  }

  function makeMove(row, column) {
    console.log("called handle hex selected");
    setPrevBoardState(boardState);
    const newBoardState = Array(11);
    for (let i = 0; i < 11; i++) {
      newBoardState[i] = Array(11);
      for (let j = 0; j < 11; j++) {
        newBoardState[i][j] = { ...boardState[i][j] };
      }
    }
    newBoardState[row][column].color = currentPlayer;
    console.log(newBoardState);
    setBoardState(newBoardState);
    setTurnNumber(turnNumber + 1);
    setLastMoveLocation({ x: column, y: row });
    switchPlayer();
  }



  function switchPlayer() {
    currentPlayer === "Red" ? setCurrentPlayer("Blue") : setCurrentPlayer("Red");
  }

  function createEmptyVisitedHexesMap() {
    const visitedHexes = new Map();
    for (let xKey = 0; xKey < 11; xKey++) {
      const innerMap = new Map();
      for (let yKey = 0; yKey < 11; yKey++) {
        innerMap.set(yKey, false);
      }
      visitedHexes.set(xKey, innerMap);
    }
    return visitedHexes;
  }

  function getNeighbors(location) {
    const { x, y } = location;
    const neighbors = [];
    //check the row above
    if (y > 0) {
      neighbors.push({ x: x, y: y - 1 });
      if (x < 10) neighbors.push({ x: x + 1, y: y - 1 });
    }
    //check the row below
    if (y < 10) {
      neighbors.push({ x: x, y: y + 1 });
      if (x > 0) neighbors.push({ x: x - 1, y: y + 1 });
    }
    //check same row, one column prior
    if (x > 0) neighbors.push({ x: x - 1, y });
    //check same row, one column after
    if (x < 10) neighbors.push({ x: x + 1, y: y });
    return neighbors;
  }

  function reset() {
    setBoardState(Array(11).fill(Array(11).fill({ color: "hsla(0, 0%, 99%, 1)" })));
    setWinner(null);
    setCurrentPlayer("Red");
    setTurnNumber(0);
  }

  function undo() {
    const newBoardState = Array(11);
    for (let i = 0; i < 11; i++) {
      newBoardState[i] = [...prevBoardState[i]]
    }
    setWinner(null);
    setBoardState(newBoardState);
    setPrevBoardState(null);
    setTurnNumber(turnNumber - 1);
    switchPlayer();
  }

  const hexes = populateHexes();
  return (
    <div>
      {!gameStarted ?
        <div className="splashScreen">
          <h1> Hex </h1>
          <img className="hexLogo" src={hexPng} alt="Hex Logo" />
          <button className="startButton" onClick={startGame}>Start Game</button>
          <a href="https://www.peterclarke.org/hex/rules.html">How to Play</a>
        </div>
        :
        <div className="outerGrid">
          <div className="leftBar">
            {winner ?
              <div>
                <p style={{ backgroundColor: winner }}><b>{winner} Wins!</b></p>
                <button onClick={undo} disabled={!prevBoardState}>Undo</button>
                <button onClick={reset}>Restart</button>
              </div>
              :
              <div>
                <p style={{ backgroundColor: currentPlayer }}>{currentPlayer}'s Turn</p>
                <button onClick={undo} disabled={!prevBoardState}>Undo</button>
                <button onClick={reset}>Restart</button>
              </div>
            }
          </div>
          <div className="hexGrid">
            {hexes}
          </div>
        </div>
      }
    </div>
  );
}

export default App;
