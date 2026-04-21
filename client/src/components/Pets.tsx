import { useState, useEffect, useRef } from 'react';

interface PetProps {
  emoji: string;
  name: string;
  speed: number;
  lane: number;
}

function PixelPet({ pet, pos, isRacing, onClick }: { pet: PetProps; pos: number; isRacing: boolean; onClick?: () => void }) {
  return (
    <div 
      className="pixel-pet"
      style={{ 
        left: pos,
        bottom: 60 + pet.lane * 70,
        transform: `scaleX(${pos > 0 ? 1 : -1})`,
      }}
      onClick={onClick}
      title={pet.name}
    >
      <div className="pixel-pet-body" style={{ 
        animation: isRacing ? 'bounce 0.3s ease-in-out infinite alternate' : 'none',
        filter: isRacing ? 'none' : 'grayscale(0.5)'
      }}>
        {pet.emoji}
      </div>
      <div className="pixel-pet-name">{pet.name}</div>
      <div className="pixel-pet-shadow"></div>
    </div>
  );
}

export function Pets() {
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [positions, setPositions] = useState([0, 0, 0]);
  const [pets, setPets] = useState<PetProps[]>([
    { emoji: '🐕', name: 'Dog', speed: 2 + Math.random(), lane: 0 },
    { emoji: '🐈', name: 'Cat', speed: 2.2 + Math.random(), lane: 1 },
    { emoji: '🦆', name: 'Duck', speed: 2.1 + Math.random(), lane: 2 },
  ]);
  
  const animationRef = useRef<number | null>(null);
  const raceStarted = useRef(false);

  const startRace = () => {
    setIsRacing(true);
    setWinner(null);
    setPositions([0, 0, 0]);
    raceStarted.current = true;
    
    const race = () => {
      if (!raceStarted.current) return;
      
      setPositions(prev => {
        const newPositions = prev.map((pos, i) => {
          const randomBoost = Math.random() * 0.5;
          return pos + pets[i].speed + randomBoost;
        });
        
        const screenWidth = window.innerWidth;
        const finishLine = screenWidth - 100;
        
        const winnerIndex = newPositions.findIndex(pos => pos >= finishLine);
        if (winnerIndex !== -1 && raceStarted.current) {
          raceStarted.current = false;
          setWinner(pets[winnerIndex].name);
          setIsRacing(false);
        }
        
        return newPositions;
      });
      
      animationRef.current = requestAnimationFrame(race);
    };
    
    animationRef.current = requestAnimationFrame(race);
  };

  const resetRace = () => {
    raceStarted.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRacing(false);
    setWinner(null);
    setPositions([0, 0, 0]);
    setPets([
      { emoji: '🐕', name: 'Dog', speed: 2 + Math.random(), lane: 0 },
      { emoji: '🐈', name: 'Cat', speed: 2.2 + Math.random(), lane: 1 },
      { emoji: '🦆', name: 'Duck', speed: 2.1 + Math.random(), lane: 2 },
    ]);
  };

  const cyclePet = (index: number) => {
    const petEmojis = ['🐕', '🐈', '🐱', '🐶', '🦆', '🐸', '🐦', '🐧', '🦜', '🐢'];
    const currentPet = pets[index];
    const currentIndex = petEmojis.indexOf(currentPet.emoji);
    const nextEmoji = petEmojis[(currentIndex + 1) % petEmojis.length];
    
    setPets(prev => {
      const newPets = [...prev];
      newPets[index] = { ...newPets[index], emoji: nextEmoji };
      return newPets;
    });
  };

  useEffect(() => {
    return () => {
      raceStarted.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        .race-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 280px;
          background: linear-gradient(to bottom, #87CEEB 0%, #98FB98 50%, #228B22 100%);
          z-index: 9998;
          display: none;
        }
        
        .race-container.active {
          display: block;
          animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .race-track {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          height: 220px;
        }
        
        .finish-line {
          position: absolute;
          right: 80px;
          bottom: 0;
          top: 0;
          width: 10px;
          background: repeating-linear-gradient(
            0deg,
            white,
            white 10px,
            black 10px,
            black 20px
          );
        }
        
        .race-controls {
          position: fixed;
          bottom: 290px;
          right: 20px;
          z-index: 9999;
          display: flex;
          gap: 10px;
        }
        
        .race-btn {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          transition: transform 0.1s;
        }
        
        .race-btn:hover {
          transform: scale(1.05);
        }
        
        .race-btn.start {
          background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          color: white;
        }
        
        .race-btn.reset {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        
        .winner-banner {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #FFD700, #FFA500);
          padding: 30px 50px;
          border-radius: 20px;
          font-size: 32px;
          font-weight: bold;
          color: #333;
          z-index: 10000;
          animation: popIn 0.5s ease-out;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        @keyframes popIn {
          from { transform: translate(-50%, -50%) scale(0); }
          to { transform: translate(-50%, -50%) scale(1); }
        }
        
        .pixel-pet {
          position: absolute;
          z-index: 9999;
          cursor: pointer;
          transition: left 0.05s linear;
        }
        
        .pixel-pet:hover .pixel-pet-body {
          filter: brightness(1.2);
        }
        
        .pixel-pet-body {
          font-size: 48px;
          text-shadow: 2px 3px 0 rgba(0,0,0,0.2);
        }
        
        .pixel-pet-name {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
        }
        
        .pixel-pet-shadow {
          width: 32px;
          height: 8px;
          background: rgba(0,0,0,0.25);
          border-radius: 50%;
          margin: 4px auto 0;
        }
      `}</style>
      
      <div className={`race-container ${isRacing || winner ? 'active' : ''}`}>
        <div className="race-track">
          <div className="finish-line"></div>
          {pets.map((pet, index) => (
            <PixelPet 
              key={index} 
              pet={pet} 
              pos={positions[index]} 
              isRacing={isRacing}
              onClick={() => cyclePet(index)}
            />
          ))}
        </div>
      </div>

      <div className="race-controls">
        {!isRacing && !winner && (
          <button className="race-btn start" onClick={startRace}>
            🏁 Start Race!
          </button>
        )}
        {(isRacing || winner) && (
          <button className="race-btn reset" onClick={resetRace}>
            🔄 Race Again
          </button>
        )}
      </div>

      {winner && (
        <div className="winner-banner">
          🎉 {winner} Wins! 🎉
        </div>
      )}
    </>
  );
}
