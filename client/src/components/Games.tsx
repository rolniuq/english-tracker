import { useState, useEffect, useCallback } from 'react';

function Game2048() {
  const [grid, setGrid] = useState<number[][]>([[]]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const init = useCallback(() => {
    let g = Array(4).fill(null).map(() => Array(4).fill(0));
    const addTile = () => {
      const empty: [number, number][] = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (g[r][c] === 0) empty.push([r, c]);
        }
      }
      if (empty.length > 0) {
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        g[r][c] = Math.random() < 0.9 ? 2 : 4;
      }
    };
    addTile();
    addTile();
    setGrid(g);
    setScore(0);
    setWon(false);
    setGameOver(false);
  }, []);

  useEffect(() => {
    if (showGame && grid[0].length === 0) init();
  }, [showGame, grid, init]);

  useEffect(() => {
    const saved = localStorage.getItem('2048-best');
    if (saved) setBest(parseInt(saved));
  }, []);

  const saveBest = (s: number) => {
    if (s > best) {
      setBest(s);
      localStorage.setItem('2048-best', s.toString());
    }
  };

  const addTile = (g: number[][]) => {
    const empty: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length > 0) {
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      g[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
    return g;
  };

  const move = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (won || gameOver) return;

    setGrid(g => {
      let newGrid = g.map(row => [...row]);
      let moved = false;
      let points = 0;

      const slideLeft = (row: number[]) => {
        let arr = row.filter(x => x !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            points += arr[i];
            arr.splice(i + 1, 1);
          }
        }
        while (arr.length < 4) arr.push(0);
        return arr;
      };

      const getCol = (grid: number[][], c: number) => grid.map(row => row[c]);
      const setCol = (grid: number[][], c: number, col: number[]) => {
        const result = grid.map(row => [...row]);
        for (let r = 0; r < 4; r++) result[r][c] = col[r];
        return result;
      };

      if (dir === 'left') {
        newGrid = newGrid.map(row => slideLeft(row));
      } else if (dir === 'right') {
        newGrid = newGrid.map(row => slideLeft(row.reverse()).reverse());
      } else if (dir === 'up') {
        for (let c = 0; c < 4; c++) {
          const col = getCol(newGrid, c);
          const newCol = slideLeft(col);
          newGrid = setCol(newGrid, c, newCol);
        }
      } else if (dir === 'down') {
        for (let c = 0; c < 4; c++) {
          const col = getCol(newGrid, c);
          const newCol = slideLeft(col.reverse()).reverse();
          newGrid = setCol(newGrid, c, newCol);
        }
      }

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (newGrid[r][c] !== g[r][c]) moved = true;
        }
      }

      if (moved) {
        addTile(newGrid);
        setScore(s => {
          const newScore = s + points;
          saveBest(newScore);
          return newScore;
        });
        if (newGrid.some(row => row.some(cell => cell === 2048))) setWon(true);
        if (newGrid.every(row => row.every(cell => cell !== 0))) {
          let canMove = false;
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (r < 3 && newGrid[r][c] === newGrid[r+1][c]) canMove = true;
              if (c < 3 && newGrid[r][c] === newGrid[r][c+1]) canMove = true;
            }
          }
          if (!canMove) setGameOver(true);
        }
      }

      return moved ? newGrid : g;
    });
  }, [won, gameOver]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('up');
      else if (e.key === 'ArrowDown') move('down');
      else if (e.key === 'ArrowLeft') move('left');
      else if (e.key === 'ArrowRight') move('right');
    };
    if (showGame) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showGame, move]);

  const colors: Record<number, string> = {
    2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
    32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
    512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
  };

  return (
    <>
      <style>{`
        .game2048-btn {
          position: fixed; bottom: 120px; right: 20px;
          padding: 12px 20px; background: linear-gradient(135deg, #11998e, #38ef7d);
          color: white; border: none; border-radius: 8px;
          font-size: 14px; font-weight: bold; cursor: pointer; z-index: 9999;
        }
        .game2048-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10000; }
        .game2048-box {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: #bbada0; padding: 20px; border-radius: 10px; z-index: 10001;
          width: 340px;
        }
        .game2048-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .game2048-title { color: white; font-size: 28px; font-weight: bold; }
        .game2048-scores { display: flex; gap: 10px; }
        .game2048-score { background: #bbada0; padding: 5px 15px; border-radius: 5px; text-align: center; }
        .game2048-score-label { color: #eee4da; font-size: 12px; }
        .game2048-score-val { color: white; font-weight: bold; font-size: 18px; }
        .game2048-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #bbada0; padding: 10px; border-radius: 8px; }
        .game2048-cell {
          width: 70px; height: 70px; background: #cdc1b4; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: bold;
        }
        .game2048-won { background: #edc22e !important; animation: pulse 0.3s infinite; }
        .game2048-gameover { color: white; font-size: 24px; text-align: center; margin: 10px 0; }
        .game2048-actions { display: flex; gap: 10px; justify-content: center; margin-top: 15px; }
        .game2048-btn2 { padding: 10px 20px; background: #8f7a66; color: white; border: none; border-radius: 6px; cursor: pointer; }
        .game2048-close { position: absolute; top: -40px; right: 0; background: #ff6b6b; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
      <button className="game2048-btn" onClick={() => setShowGame(true)}>🎮 2048</button>

      {showGame && (
        <>
          <div className="game2048-overlay" onClick={() => setShowGame(false)} />
          <div className="game2048-box">
            <button className="game2048-close" onClick={() => setShowGame(false)}>✕</button>
            <div className="game2048-header">
              <div className="game2048-title">2048</div>
              <div className="game2048-scores">
                <div className="game2048-score">
                  <div className="game2048-score-label">SCORE</div>
                  <div className="game2048-score-val">{score}</div>
                </div>
                <div className="game2048-score">
                  <div className="game2048-score-label">BEST</div>
                  <div className="game2048-score-val">{best}</div>
                </div>
              </div>
            </div>
            {won && <div style={{ color: '#edc22e', textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>🎉 You Win! 🎉</div>}
            {gameOver && <div className="game2048-gameover">😢 Game Over!</div>}
            <div className="game2048-grid">
              {grid.map((row, r) => row.map((cell, c) => (
                <div key={`${r}-${c}`} className="game2048-cell" style={{ background: colors[cell] || '#cdc1b4', color: cell > 4 ? '#f9f6f2' : '#776e65' }}>
                  {cell || ''}
                </div>
              )))}
            </div>
            <div className="game2048-actions">
              <button className="game2048-btn2" onClick={init}>🔄 New Game</button>
            </div>
            <div style={{ color: '#eee4da', textAlign: 'center', marginTop: 10, fontSize: 12 }}>Use arrow keys to play</div>
          </div>
        </>
      )}
    </>
  );
}

function SlidingPuzzle() {
  const [tiles, setTiles] = useState<{id: number, pos: number}[]>([]);
  const [moves, setMoves] = useState(0);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [won, setWon] = useState(false);
  const [gridSize, setGridSize] = useState(4);
  const [level, setLevel] = useState(1);

  const init = useCallback((size?: number) => {
    const actualSize = size || gridSize;
    const totalTiles = actualSize * actualSize;
    const t = Array.from({ length: totalTiles }, (_, i) => ({ id: i + 1, pos: i }));
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    setTiles(t);
    setMoves(0);
    setWon(false);
  }, [gridSize]);

  useEffect(() => {
    if (showPuzzle && tiles.length === 0) init();
  }, [showPuzzle, tiles.length, init]);

  const nextLevel = () => {
    if (gridSize < 6) {
      setGridSize(s => s + 1);
      setTimeout(() => init(gridSize + 1), 500);
    } else {
      setGridSize(4);
      setLevel(l => l + 1);
      setTimeout(() => init(4), 500);
    }
  };

  const move = (pos: number) => {
    if (won || tiles.length === 0) return;
    const empty = tiles.find(t => t.id === gridSize * gridSize);
    const clicked = tiles.find(t => t.pos === pos);
    if (!empty || !clicked) return;
    
    const emptyRow = Math.floor(empty.pos / gridSize);
    const emptyCol = empty.pos % gridSize;
    const clickedRow = Math.floor(clicked.pos / gridSize);
    const clickedCol = clicked.pos % gridSize;
    const isAdjacent = (emptyRow === clickedRow && Math.abs(emptyCol - clickedCol) === 1) ||
                       (emptyCol === clickedCol && Math.abs(emptyRow - clickedRow) === 1);
    if (!isAdjacent) return;

    setTiles(prev => {
      const newTiles = prev.map(t => 
        t.id === clicked.id ? { ...t, pos: empty.pos } :
        t.id === empty.id ? { ...t, pos: clicked.pos } : t
      );
      const solved = newTiles.every(t => t.pos === t.id - 1);
      if (solved) {
        setWon(true);
        setTimeout(nextLevel, 1500);
      }
      return newTiles;
    });
    setMoves(m => m + 1);
  };

  return (
    <>
      <style>{`
        .puz-btn {
          position: fixed; bottom: 70px; left: 20px;
          padding: 12px 20px; background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          color: white; border: none; border-radius: 8px;
          font-size: 14px; font-weight: bold; cursor: pointer; z-index: 9999;
        }
        .puz-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10000; }
        .puz-box {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: #bbada0; padding: 15px; border-radius: 10px; z-index: 10001;
        }
        .puz-grid { display: grid; gap: 6px; }
        .puz-tile {
          display: flex; align-items: center; justify-content: center;
          border-radius: 4px; font-weight: bold;
          cursor: pointer; transition: all 0.15s;
        }
        .puz-tile-empty { background: #cdc1b4; cursor: default; }
        .puz-tile-won { background: #edc22e !important; animation: pulse 0.3s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .puz-header { color: white; text-align: center; margin-bottom: 10px; }
        .puz-stats { color: #eee; text-align: center; margin: 10px 0; }
        .puz-actions { display: flex; gap: 10px; justify-content: center; margin-top: 10px; }
        .puz-btn2 { padding: 10px 20px; background: #8f7a66; color: white; border: none; border-radius: 6px; cursor: pointer; }
        .puz-close { position: absolute; top: -40px; right: 0; background: #ff6b6b; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
      <button className="puz-btn" onClick={() => setShowPuzzle(true)}>🧩 Puzzle {gridSize}x{gridSize}</button>
      
      {showPuzzle && (
        <>
          <div className="puz-overlay" onClick={() => setShowPuzzle(false)} />
          <div className="puz-box">
            <button className="puz-close" onClick={() => setShowPuzzle(false)}>✕</button>
            <div className="puz-header" style={{ fontSize: 24, fontWeight: 'bold' }}>
              🧩 Puzzle {gridSize}x{gridSize} {level > 1 && `(Level ${level})`}
            </div>
            <div className="puz-stats">Moves: {moves} {won && '🎉 Next Level!'}</div>
            <div 
              className="puz-grid"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: `${gridSize * 60}px`,
                height: `${gridSize * 60}px`
              }}
            >
              {Array.from({ length: gridSize * gridSize }, (_, pos) => {
                if (tiles.length === 0) return <div key={pos} className="puz-tile"></div>;
                const tile = tiles.find(t => t.pos === pos);
                const empty = tiles.find(t => t.id === gridSize * gridSize);
                if (!empty) return <div key={pos} className="puz-tile"></div>;
                const emptyRow = Math.floor(empty.pos / gridSize);
                const emptyCol = empty.pos % gridSize;
                const tileRow = Math.floor(pos / gridSize);
                const tileCol = pos % gridSize;
                const canMove = (emptyRow === tileRow && Math.abs(emptyCol - tileCol) === 1) ||
                                 (emptyCol === tileCol && Math.abs(emptyRow - tileRow) === 1);
                const maxVal = gridSize * gridSize - 1;
                return (
                  <div
                    key={pos}
                    className={`puz-tile ${tile?.id === gridSize * gridSize ? 'puz-tile-empty' : ''} ${won ? 'puz-tile-won' : ''}`}
                    style={{ 
                      background: tile && tile.id <= maxVal && tile.pos === tile.id - 1 ? '#f2b179' : '#8f7a66',
                      fontSize: gridSize > 4 ? '16px' : '22px'
                    }}
                    onClick={() => canMove && tile && move(pos)}
                  >
                    {tile ? (tile.id === gridSize * gridSize ? '' : tile.id) : ''}
                  </div>
                );
              })}
            </div>
            <div className="puz-actions">
              <button className="puz-btn2" onClick={() => init()}>🔄 Shuffle</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function Games() {
  return (
    <>
      <Game2048 />
      <SlidingPuzzle />
    </>
  );
}
