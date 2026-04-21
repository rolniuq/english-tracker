import { useState, useEffect, useCallback } from 'react';

interface PuzzlePiece {
  value: number;
  correctPos: number;
  currentPos: number;
}

function PuzzleGame() {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [emptyPos, setEmptyPos] = useState(15);
  const [moveCount, setMoveCount] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);

  const shuffle = useCallback(() => {
    const newPieces: PuzzlePiece[] = [];
    for (let i = 0; i < 16; i++) {
      newPieces.push({
        value: i === 15 ? 0 : i + 1,
        correctPos: i,
        currentPos: i,
      });
    }
    
    for (let i = newPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
    }
    
    const emptyIndex = newPieces.findIndex(p => p.value === 0);
    setEmptyPos(emptyIndex);
    setPieces(newPieces);
    setMoveCount(0);
    setIsSolved(false);
  }, []);

  useEffect(() => {
    if (showPuzzle && pieces.length === 0) {
      shuffle();
    }
  }, [showPuzzle, pieces.length, shuffle]);

  const canMove = (pos: number) => {
    const row = Math.floor(pos / 4);
    const col = pos % 4;
    const emptyRow = Math.floor(emptyPos / 4);
    const emptyCol = emptyPos % 4;
    
    return (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
           (col === emptyCol && Math.abs(row - emptyRow) === 1);
  };

  const movePiece = (pos: number) => {
    if (!canMove(pos) || isSolved) return;
    
    setPieces(prev => {
      const newPieces = [...prev];
      [newPieces[pos], newPieces[emptyPos]] = [newPieces[emptyPos], newPieces[pos]];
      
      const solved = newPieces.every(p => p.currentPos === p.correctPos);
      if (solved) {
        setIsSolved(true);
      }
      
      return newPieces;
    });
    
    setEmptyPos(pos);
    setMoveCount(c => c + 1);
  };

  return (
    <>
      <style>{`
        .puzzle-btn {
          position: fixed;
          bottom: 20px;
          left: 20px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          z-index: 9999;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }
        
        .puzzle-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          display: none;
        }
        
        .puzzle-container.active {
          display: block;
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .puzzle-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          z-index: 9999;
        }
        
        .puzzle-title {
          text-align: center;
          color: white;
          margin-bottom: 15px;
          font-size: 24px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .puzzle-stats {
          text-align: center;
          color: white;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .puzzle-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          width: 300px;
          height: 300px;
          background: #333;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .puzzle-piece {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 8px;
          font-size: 28px;
          font-weight: bold;
          color: white;
          cursor: pointer;
          transition: transform 0.1s, background 0.2s;
          box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2);
        }
        
        .puzzle-piece:hover {
          transform: scale(1.05);
        }
        
        .puzzle-piece.empty {
          background: transparent;
          cursor: default;
          box-shadow: none;
        }
        
        .puzzle-piece.correct {
          background: linear-gradient(135deg, #11998e, #38ef7d);
        }
        
        .puzzle-solved {
          background: linear-gradient(135deg, #FFD700, #FFA500);
        }
        
        .puzzle-controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 15px;
        }
        
        .puzzle-control-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.1s;
        }
        
        .puzzle-control-btn:hover {
          transform: scale(1.05);
        }
        
        .puzzle-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>
      
      <button className="puzzle-btn" onClick={() => setShowPuzzle(true)}>
        🧩 Puzzle
      </button>
      
      {showPuzzle && (
        <>
          <div className="puzzle-overlay" onClick={() => setShowPuzzle(false)} />
          <div className="puzzle-container active">
            <div className="puzzle-title">🧩 Number Puzzle 🧩</div>
            <div className="puzzle-stats">
              Moves: {moveCount} {isSolved && '🎉 SOLVED!'}
            </div>
            <div className="puzzle-grid">
              {pieces.map((piece, index) => (
                <div
                  key={index}
                  className={`puzzle-piece ${piece.value === 0 ? 'empty' : ''} ${
                    piece.currentPos === piece.correctPos ? 'correct' : ''
                  } ${isSolved ? 'puzzle-solved' : ''}`}
                  style={{ opacity: piece.value === 0 ? 0 : 1 }}
                  onClick={() => canMove(index) && movePiece(index)}
                >
                  {piece.value || ''}
                </div>
              ))}
            </div>
            <div className="puzzle-controls">
              <button className="puzzle-control-btn" style={{ background: '#667eea', color: 'white' }} onClick={shuffle}>
                🔄 Shuffle
              </button>
              <button className="puzzle-control-btn" style={{ background: '#ff6b6b', color: 'white' }} onClick={() => setShowPuzzle(false)}>
                ❌ Close
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default PuzzleGame;