import { useState, useEffect, useRef } from 'react';

interface Pet {
  emoji: string;
  name: string;
  baseSpeed: number;
  lane: number;
  position: number;
  speed: number;
}

const WEATHER_TYPES = [
  { name: 'Sunny', bg: 'linear-gradient(to bottom, #87CEEB, #98FB98)', boost: 1 },
  { name: 'Rain', bg: 'linear-gradient(to bottom, #4a5568, #2d3748)', speedMod: 0.8 },
  { name: 'Wind', bg: 'linear-gradient(to bottom, #a0aec0, #cbd5e0)', speedMod: 1.3 },
  { name: 'Storm', bg: 'linear-gradient(to bottom, #2d3748, #1a202c)', speedMod: 0.6 },
  { name: 'Snow', bg: 'linear-gradient(to bottom, #e2e8f0, #f7fafc)', speedMod: 0.9 },
  { name: 'Night', bg: 'linear-gradient(to bottom, #1a202c, #2d3748)', speedMod: 1.1 },
];

function PetRace() {
  const [pets, setPets] = useState<Pet[]>([
    { emoji: '🐕', name: 'Dog', baseSpeed: 3, lane: 0, position: 0, speed: 3 },
    { emoji: '🐈', name: 'Cat', baseSpeed: 3.5, lane: 1, position: 0, speed: 3.5 },
    { emoji: '🦆', name: 'Duck', baseSpeed: 3.2, lane: 2, position: 0, speed: 3.2 },
  ]);
  const [weather, setWeather] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [raceTime, setRaceTime] = useState(0);
  const [showRace, setShowRace] = useState(false);
  const [betOn, setBetOn] = useState<string | null>(null);
  const [betResult, setBetResult] = useState<string | null>(null);
  const [distance] = useState(100);
  const animationRef = useRef<number | null>(null);

  const startRace = () => {
    setIsRacing(true);
    setWinner(null);
    setRaceTime(0);
    setBetResult(null);
    setPets(prev => prev.map(p => ({ ...p, position: 0, speed: p.baseSpeed })));
    
    const race = () => {
      setRaceTime(t => t + 1);
      
      setPets(prev => {
        const weatherMod = WEATHER_TYPES[weather].speedMod || 1;
        
        const newPets = prev.map(pet => {
          const randomVariation = 0.8 + Math.random() * 0.4;
          const newPos = pet.position + (pet.speed * weatherMod * randomVariation * 0.15);
          
          if (newPos >= distance && !winner) {
            setWinner(pet.name);
            setIsRacing(false);
            if (betOn === pet.name) {
              setBetResult('win');
            } else if (betOn) {
              setBetResult('lose');
            }
          }
          
          return { ...pet, position: newPos };
        });
        
        if (newPets.some(p => p.position >= distance)) {
          return newPets;
        }
        
        animationRef.current = requestAnimationFrame(race);
        return newPets;
      });
    };
    
    animationRef.current = requestAnimationFrame(race);
  };

  const changeWeather = () => {
    setWeather(prev => (prev + 1) % WEATHER_TYPES.length);
  };

  const resetRace = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRacing(false);
    setWinner(null);
    setRaceTime(0);
    setBetResult(null);
    setPets([
      { emoji: '🐕', name: 'Dog', baseSpeed: 3, lane: 0, position: 0, speed: 3 },
      { emoji: '🐈', name: 'Cat', baseSpeed: 3.5, lane: 1, position: 0, speed: 3.5 },
      { emoji: '🦆', name: 'Duck', baseSpeed: 3.2, lane: 2, position: 0, speed: 3.2 },
    ]);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const cyclePet = (index: number) => {
    const emojis = ['🐕', '🐈', '🐱', '🐶', '🦆', '🐸', '🐦', '🐧', '🦜', '🐢', '🐉', '🦄'];
    const currentIndex = emojis.indexOf(pets[index].emoji);
    const nextEmoji = emojis[(currentIndex + 1) % emojis.length];
    
    setPets(prev => {
      const newPets = [...prev];
      newPets[index] = { ...newPets[index], emoji: nextEmoji };
      return newPets;
    });
  };

  return (
    <>
      <style>{`
        .race-container-full {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: none;
          flex-direction: column;
          transition: background 0.5s;
        }
        
        .race-container-full.active {
          display: flex;
        }
        
        .race-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          background: rgba(0,0,0,0.3);
        }
        
        .race-title {
          color: white;
          font-size: 28px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .weather-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .race-track {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 20px;
          padding: 0 100px;
        }
        
        .finish-flag {
          position: absolute;
          right: 80px;
          top: 0;
          bottom: 0;
          width: 20px;
          background: repeating-linear-gradient(
            45deg,
            white,
            white 10px,
            black 10px,
            black 20px
          );
        }
        
        .racetrack {
          display: flex;
          align-items: center;
          height: 80px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          position: relative;
        }
        
        .lanemarkers {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 98px,
            rgba(255,255,255,0.1) 98px,
            rgba(255,255,255,0.1) 100px
          );
        }
        
        .racers {
          display: flex;
          align-items: center;
          gap: 30px;
          position: absolute;
          left: 10px;
        }
        
        .racer {
          font-size: 50px;
          position: absolute;
          transition: left 0.1s linear;
          cursor: pointer;
          filter: drop-shadow(2px 3px 4px rgba(0,0,0,0.3));
        }
        
        .racer-info {
          position: absolute;
          left: 10px;
          color: white;
          font-size: 14px;
          background: rgba(0,0,0,0.5);
          padding: 3px 8px;
          border-radius: 4px;
          white-space: nowrap;
        }
        
        .progress-bar {
          width: 200px;
          height: 8px;
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
          position: absolute;
          left: 80px;
          top: 55px;
        }
        
        .progress-fill {
          height: 100%;
          background: #4ade80;
          border-radius: 4px;
          transition: width 0.1s linear;
        }
        
        .race-bet {
          display: flex;
          gap: 15px;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,0.3);
        }
        
        .bet-btn {
          padding: 15px 25px;
          font-size: 18px;
          border: 3px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        .bet-btn:hover {
          transform: scale(1.05);
        }
        
        .bet-btn.selected {
          border-color: #ffd700;
          background: rgba(255, 215, 0, 0.3);
        }
        
        .race-controls-full {
          display: flex;
          gap: 15px;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,0.3);
        }
        
        .race-btn-full {
          padding: 15px 40px;
          font-size: 20px;
          font-weight: bold;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        
        .race-btn-full:hover {
          transform: scale(1.05);
        }
        
        .winner-banner-full {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #FFD700, #FFA500);
          padding: 40px 60px;
          border-radius: 20px;
          font-size: 42px;
          font-weight: bold;
          color: #333;
          z-index: 10001;
          animation: popIn 0.5s ease-out;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          text-align: center;
        }
        
        .bet-result {
          font-size: 28px;
          margin-top: 10px;
        }
        
        .win-result { color: #22c55e; }
        .lose-result { color: #ef4444; }
        
        @keyframes popIn {
          from { transform: translate(-50%, -50%) scale(0); }
          to { transform: translate(-50%, -50%) scale(1); }
        }
        
        .race-weather-info {
          position: absolute;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 16px;
        }
        
        .race-timer {
          position: absolute;
          top: 80px;
          right: 150px;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 20px;
          font-weight: bold;
        }
        
        .race-toggle-btn {
          position: fixed;
          bottom: 70px;
          right: 20px;
          z-index: 9999;
          background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }
        
        .race-toggle-btn:hover {
          transform: scale(1.05);
        }
      `}</style>
      
      <button 
        className="race-btn-full race-toggle-btn"
        onClick={() => setShowRace(true)}
      >
        🏁 Race
      </button>
      
      {showRace && (
        <div 
          className="race-container-full active"
          style={{ background: WEATHER_TYPES[weather].bg }}
        >
          <div className="race-header">
            <div className="race-title">🐾 Pet Race 2026 🐾</div>
            <button className="weather-btn" onClick={changeWeather}>
              🌤️ {WEATHER_TYPES[weather].name}
            </button>
          </div>
          
          <div className="race-track">
            <div className="finish-flag"></div>
            <div className="race-weather-info">
              🌡️ Weather: {WEATHER_TYPES[weather].name}
              {WEATHER_TYPES[weather].speedMod !== 1 && (
                <span> ({WEATHER_TYPES[weather].speedMod! > 1 ? '🚀' : '🐢'} {WEATHER_TYPES[weather].speedMod! > 1 ? '+' : ''}{Math.round((WEATHER_TYPES[weather].speedMod! - 1) * 100)}%)
              </span>
              )}
            </div>
            <div className="race-timer">⏱️ {raceTime}s</div>
            
            {pets.map((pet, index) => (
              <div key={index} className="racetrack">
                <div className="lanemarkers"></div>
                <div className="racer-info" style={{ top: -25 }}>{pet.name}</div>
                {isRacing && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(pet.position, 100)}%` }}></div>
                  </div>
                )}
                <div 
                  className="racer" 
                  style={{ 
                    left: `calc(${Math.min(pet.position / distance * 85, 85)}% + 10px)`,
                    transform: `scaleX(${pet.position > 0 ? 1 : -1})`
                  }}
                  onClick={() => cyclePet(index)}
                  title="Click to change"
                >
                  {pet.emoji}
                </div>
              </div>
            ))}
          </div>
          
          {!isRacing && !winner && (
            <div className="race-bet">
              {pets.map(pet => (
                <button
                  key={pet.name}
                  className={`bet-btn ${betOn === pet.name ? 'selected' : ''}`}
                  onClick={() => setBetOn(pet.name)}
                >
                  {pet.emoji} {pet.name}
                </button>
              ))}
            </div>
          )}
          
          <div className="race-controls-full">
            {!isRacing && !winner && (
              <button 
                className="race-btn-full" 
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
                onClick={startRace}
              >
                🏁 START RACE!
              </button>
            )}
            {(isRacing || winner) && (
              <button 
                className="race-btn-full" 
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}
                onClick={resetRace}
              >
                🔄 Race Again
              </button>
            )}
            <button 
              className="race-btn-full" 
              style={{ background: '#ef4444', color: 'white' }}
              onClick={() => { resetRace(); setShowRace(false); }}
            >
              ❌ Exit
            </button>
          </div>
          
          {winner && (
            <div className="winner-banner-full">
              🎉 {winner} Wins! 🎉
              {betResult && (
                <div className={`bet-result ${betResult}`}>
                  {betResult === 'win' ? '💰 You won your bet!' : '😢 You lost!'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default PetRace;