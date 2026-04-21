import { useState, useEffect, useCallback } from 'react';

function SlidingPuzzle() {
  const [tiles, setTiles] = useState<{id: number, pos: number}[]>([]);
  const [moves, setMoves] = useState(0);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [won, setWon] = useState(false);

  const init = useCallback(() => {
    const t = Array.from({ length: 16 }, (_, i) => ({ id: i + 1, pos: i }));
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    setTiles(t);
    setMoves(0);
    setWon(false);
  }, []);

  useEffect(() => {
    if (showPuzzle && tiles.length === 0) init();
  }, [showPuzzle, tiles.length, init]);

  const move = (index: number) => {
    if (won) return;
    const empty = tiles.find(t => t.id === 16)!;
    const clicked = tiles[index];
    const emptyRow = Math.floor(empty.pos / 4);
    const emptyCol = empty.pos % 4;
    const clickedRow = Math.floor(clicked.pos / 4);
    const clickedCol = clicked.pos % 4;
    const isAdjacent = (emptyRow === clickedRow && Math.abs(emptyCol - clickedCol) === 1) ||
                       (emptyCol === clickedCol && Math.abs(emptyRow - clickedRow) === 1);
    if (!isAdjacent) return;

    setTiles(prev => prev.map(t => 
      t.id === clicked.id ? { ...t, pos: empty.pos } :
      t.id === empty.id ? { ...t, pos: clicked.pos } : t
    ));
    setMoves(m => m + 1);

    setTimeout(() => {
      const solved = tiles.every(t => t.pos === t.id - 1);
      if (solved) setWon(true);
    }, 100);
  };

  return (
    <>
      <style>{`
        .puz-btn {
          position: fixed; bottom: 120px; left: 20px;
          padding: 12px 20px; background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          color: white; border: none; border-radius: 8px;
          font-size: 14px; font-weight: bold; cursor: pointer; z-index: 9999;
        }
        .puz-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10000;
        }
        .puz-box {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: #bbada0; padding: 15px; border-radius: 10px; z-index: 10001;
        }
        .puz-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
          width: 280px; height: 280px;
        }
        .puz-tile {
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px; font-size: 24px; font-weight: bold;
          cursor: pointer; transition: all 0.15s;
        }
        .puz-tile-empty { background: #cdc1b4; cursor: default; }
        .puz-tile-curr { background: #f2b179; }
        .puz-tile-won { background: #edc22e !important; animation: pulse 0.3s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .puz-header { color: white; text-align: center; margin-bottom: 10px; }
        .puz-stats { color: #eee; text-align: center; margin: 10px 0; }
        .puz-actions { display: flex; gap: 10px; justify-content: center; margin-top: 10px; }
        .puz-btn2 {
          padding: 10px 20px; background: #8f7a66; color: white;
          border: none; border-radius: 6px; cursor: pointer;
        }
        .puz-close { position: absolute; top: -40px; right: 0; background: #ff6b6b; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
      <button className="puz-btn" onClick={() => setShowPuzzle(true)}>🧩 Puzzle 15</button>
      
      {showPuzzle && (
        <>
          <div className="puz-overlay" onClick={() => setShowPuzzle(false)} />
          <div className="puz-box">
            <button className="puz-close" onClick={() => setShowPuzzle(false)}>✕</button>
            <div className="puz-header" style={{ fontSize: 24, fontWeight: 'bold' }}>🧩 Sliding Puzzle</div>
            <div className="puz-stats">Moves: {moves} {won && '🎉 SOLVED!'}</div>
            <div className="puz-grid">
              {tiles.map((tile, idx) => {
                const empty = tiles.find(t => t.id === 16)!;
                const emptyRow = Math.floor(empty.pos / 4);
                const emptyCol = empty.pos % 4;
                const tileRow = Math.floor(tile.pos / 4);
                const tileCol = tile.pos % 4;
                const canMove = (emptyRow === tileRow && Math.abs(emptyCol - tileCol) === 1) ||
                                 (emptyCol === tileCol && Math.abs(emptyRow - tileRow) === 1);
                return (
                  <div
                    key={tile.id}
                    className={`puz-tile ${tile.id === 16 ? 'puz-tile-empty' : ''} ${won ? 'puz-tile-won' : ''}`}
                    style={{ background: tile.id <= 15 && tile.pos === tile.id - 1 ? '#f2b179' : '#8f7a66' }}
                    onClick={() => canMove && move(idx)}
                  >
                    {tile.id === 16 ? '' : tile.id}
                  </div>
                );
              })}
            </div>
            <div className="puz-actions">
              <button className="puz-btn2" onClick={init}>🔄 Shuffle</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function Games() {
  return <SlidingPuzzle />;
}