import { useState, useEffect, useRef } from 'react';

interface Pet {
  emoji: string;
  name: string;
  baseSpeed: number;
  lane: number;
  position: number;
  speed: number;
  weatherAffinity: Record<string, number>;
}

const WEATHER_TYPES = [
  { name: 'Sunny', bg: 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 50%, #228B22 100%)', icon: '☀️', desc: 'Clear sky' },
  { name: 'Rain', bg: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 100%)', icon: '🌧️', desc: 'Heavy rain' },
  { name: 'Wind', bg: 'linear-gradient(to bottom, #a0aec0 0%, #cbd5e0 100%)', icon: '💨', desc: 'Strong wind' },
  { name: 'Storm', bg: 'linear-gradient(to bottom, #2d3748 0%, #1a202c 100%)', icon: '⛈️', desc: 'Thunderstorm' },
  { name: 'Snow', bg: 'linear-gradient(to bottom, #e2e8f0 0%, #f7fafc 100%)', icon: '❄️', desc: 'Snowing' },
  { name: 'Night', bg: 'linear-gradient(to bottom, #1a202c 0%, #2d3748 100%)', icon: '🌙', desc: 'Moonlight' },
  { name: 'Fog', bg: 'linear-gradient(to bottom, #9ca3af 0%, #d1d5db 100%)', icon: '🌫️', desc: 'Foggy' },
  { name: 'Heat', bg: 'linear-gradient(to bottom, #f6ad55 0%, #ed8936 100%)', icon: '🔥', desc: 'Scorching heat' },
];

const PET_TYPES = [
  { emoji: '🐕', name: 'Dog', baseSpeed: 3.2, weatherAffinity: { Sunny: 1.2, Rain: 0.9, Wind: 1.1, Storm: 0.7, Snow: 0.8, Night: 1.0, Fog: 1.0, Heat: 0.9 } },
  { emoji: '🐈', name: 'Cat', baseSpeed: 3.8, weatherAffinity: { Sunny: 1.1, Rain: 0.6, Wind: 1.0, Storm: 0.5, Snow: 0.7, Night: 1.3, Fog: 1.1, Heat: 1.2 } },
  { emoji: '🦆', name: 'Duck', baseSpeed: 3.0, weatherAffinity: { Sunny: 1.0, Rain: 1.4, Wind: 0.9, Storm: 1.1, Snow: 0.6, Night: 1.0, Fog: 0.9, Heat: 0.8 } },
  { emoji: '🐇', name: 'Bunny', baseSpeed: 3.5, weatherAffinity: { Sunny: 1.0, Rain: 0.7, Wind: 0.8, Storm: 0.6, Snow: 1.2, Night: 1.1, Fog: 1.0, Heat: 0.7 } },
  { emoji: '🦊', name: 'Fox', baseSpeed: 3.6, weatherAffinity: { Sunny: 0.9, Rain: 1.0, Wind: 1.2, Storm: 0.8, Snow: 1.1, Night: 1.4, Fog: 1.2, Heat: 0.8 } },
  { emoji: '🐢', name: 'Turtle', baseSpeed: 2.0, weatherAffinity: { Sunny: 1.3, Rain: 1.2, Wind: 0.9, Storm: 1.0, Snow: 1.1, Night: 1.0, Fog: 1.0, Heat: 0.6 } },
];

function PetRace() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [weather, setWeather] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [raceTime, setRaceTime] = useState(0);
  const [showRace, setShowRace] = useState(false);
  const [betOn, setBetOn] = useState<string | null>(null);
  const [betResult, setBetResult] = useState<string | null>(null);
  const [distance] = useState(250);
  const [weatherTimer, setWeatherTimer] = useState(0);
  const animationRef = useRef<number | null>(null);
  const weatherIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const shuffled = [...PET_TYPES].sort(() => Math.random() - 0.5).slice(0, 4);
    setPets(shuffled.map((p, i) => ({ ...p, lane: i, position: 0, speed: p.baseSpeed })));
  }, []);

  useEffect(() => {
    if (isRacing && !winner) {
      weatherIntervalRef.current = window.setInterval(() => {
        setWeatherTimer(t => {
          if (t >= 5) {
            setWeather(Math.floor(Math.random() * WEATHER_TYPES.length));
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => {
      if (weatherIntervalRef.current) clearInterval(weatherIntervalRef.current);
    };
  }, [isRacing, winner]);

  const getWeatherEffect = (pet: Pet) => {
    const weatherName = WEATHER_TYPES[weather].name;
    return pet.weatherAffinity[weatherName] || 1;
  };

  const startRace = () => {
    setIsRacing(true);
    setWinner(null);
    setRaceTime(0);
    setWeatherTimer(0);
    setBetResult(null);
    setWeather(0);
    setPets(prev => prev.map(p => ({ ...p, position: 0, speed: p.baseSpeed })));
    
    let lastTime = performance.now();
    
    const race = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      setRaceTime(t => t + deltaTime);
      
      setPets(prev => {
        const newPets = prev.map(pet => {
          const weatherMod = getWeatherEffect(pet);
          const randomVariation = 0.85 + Math.random() * 0.3;
          const newPos = pet.position + (pet.speed * weatherMod * randomVariation * deltaTime * 3);
          
          return { ...pet, position: newPos };
        });
        
        const finishedPet = newPets.find(p => p.position >= distance);
        if (finishedPet && !winner) {
          setWinner(finishedPet.name);
          setIsRacing(false);
          if (betOn === finishedPet.name) {
            setBetResult('win');
          } else if (betOn) {
            setBetResult('lose');
          }
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
    setWeatherTimer(0);
  };

  const resetRace = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (weatherIntervalRef.current) clearInterval(weatherIntervalRef.current);
    setIsRacing(false);
    setWinner(null);
    setRaceTime(0);
    setWeatherTimer(0);
    setBetResult(null);
    setWeather(0);
    const shuffled = [...PET_TYPES].sort(() => Math.random() - 0.5).slice(0, 4);
    setPets(shuffled.map((p, i) => ({ ...p, lane: i, position: 0, speed: p.baseSpeed })));
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (weatherIntervalRef.current) clearInterval(weatherIntervalRef.current);
    };
  }, []);

  const cyclePet = (index: number) => {
    const currentIndex = PET_TYPES.findIndex(p => p.name === pets[index].name);
    const nextIndex = (currentIndex + 1) % PET_TYPES.length;
    
    setPets(prev => {
      const newPets = [...prev];
      newPets[index] = { ...PET_TYPES[nextIndex], lane: index, position: prev[index].position, speed: PET_TYPES[nextIndex].baseSpeed };
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
          background: rgba(0,0,0,0.4);
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
          gap: 15px;
          padding: 0 150px;
        }
        
        .finish-flag {
          position: absolute;
          right: 120px;
          top: 0;
          bottom: 0;
          width: 30px;
          background: repeating-linear-gradient(
            45deg,
            white,
            white 15px,
            black 15px,
            black 30px
          );
        }
        
        .finish-line-label {
          position: absolute;
          right: 100px;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          font-weight: bold;
          font-size: 18px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .racetrack {
          display: flex;
          align-items: center;
          height: 70px;
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
          position: relative;
          border: 2px solid rgba(255,255,255,0.2);
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
          font-size: 45px;
          position: absolute;
          transition: left 0.1s linear;
          cursor: pointer;
          filter: drop-shadow(2px 3px 4px rgba(0,0,0,0.3));
        }
        
        .racer:hover {
          transform: scale(1.1);
        }
        
        .racer-info {
          position: absolute;
          left: 10px;
          color: white;
          font-size: 13px;
          background: rgba(0,0,0,0.6);
          padding: 3px 10px;
          border-radius: 4px;
          white-space: nowrap;
        }
        
        .racer-weather-effect {
          position: absolute;
          left: 10px;
          top: 45px;
          font-size: 16px;
          animation: bounce 0.5s infinite;
        }
        
        .progress-bar {
          width: 180px;
          height: 6px;
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
          position: absolute;
          left: 80px;
          top: 50px;
        }
        
        .progress-fill {
          height: 100%;
          background: #4ade80;
          border-radius: 3px;
          transition: width 0.1s linear;
        }
        
        .race-bet {
          display: flex;
          gap: 15px;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,0.4);
          flex-wrap: wrap;
        }
        
        .bet-btn {
          padding: 15px 25px;
          font-size: 18px;
          border: 3px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(255,255,255,0.15);
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
          background: rgba(0,0,0,0.4);
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
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .race-weather-info {
          position: absolute;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 18px;
          text-align: center;
          border: 2px solid rgba(255,255,255,0.3);
        }
        
        .weather-change-timer {
          font-size: 14px;
          opacity: 0.8;
          margin-top: 5px;
        }
        
        .race-timer {
          position: absolute;
          top: 80px;
          right: 180px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 22px;
          font-weight: bold;
          border: 2px solid rgba(255,255,255,0.3);
        }
        
        .race-toggle-btn {
          position: fixed;
          bottom: 20px;
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
        
        .pet-stats {
          font-size: 12px;
          color: #ffd700;
          margin-left: 5px;
        }
      `}</style>
      
      <button 
        className="race-btn-full race-toggle-btn"
        onClick={() => setShowRace(true)}
      >
        🏁 Pet Race
      </button>
      
      {showRace && (
        <div 
          className="race-container-full active"
          style={{ background: WEATHER_TYPES[weather].bg }}
        >
          <div className="race-header">
            <div className="race-title">🐾 Pet Race 2026 🐾</div>
            <button className="weather-btn" onClick={changeWeather}>
              {WEATHER_TYPES[weather].icon} {WEATHER_TYPES[weather].name}
            </button>
          </div>
          
          <div className="race-track">
            <div className="finish-flag"></div>
            <div className="finish-line-label">🏁 FINISH</div>
            <div className="race-weather-info">
              <div>{WEATHER_TYPES[weather].icon} {WEATHER_TYPES[weather].name}</div>
              <div>{WEATHER_TYPES[weather].desc}</div>
              {isRacing && <div className="weather-change-timer">⏱️ Weather change in {5 - weatherTimer}s</div>}
            </div>
            <div className="race-timer">⏱️ {raceTime.toFixed(1)}s</div>
            
            {pets.map((pet, index) => {
              const weatherEffect = getWeatherEffect(pet);
              const effectIcon = weatherEffect > 1.1 ? '🚀' : weatherEffect < 0.9 ? '🐢' : '➡️';
              const effectText = weatherEffect > 1.1 ? `+${Math.round((weatherEffect - 1) * 100)}%` : weatherEffect < 0.9 ? `${Math.round((weatherEffect - 1) * 100)}%` : 'normal';
              
              return (
                <div key={index} className="racetrack">
                  <div className="lanemarkers"></div>
                  <div className="racer-info" style={{ top: -25 }}>{pet.name}</div>
                  {isRacing && (
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(pet.position / distance * 100, 100)}%` }}></div>
                    </div>
                  )}
                  <div 
                    className="racer" 
                    style={{ 
                      left: `calc(${Math.min(pet.position / distance * 88, 88)}% + 10px)`,
                      transform: `scaleX(${pet.position > 0 ? 1 : -1})`
                    }}
                    onClick={() => !isRacing && cyclePet(index)}
                    title={!isRacing ? 'Click to change pet' : pet.name}
                  >
                    {pet.emoji}
                  </div>
                  {isRacing && (
                    <div className="racer-weather-effect" style={{ left: `calc(${Math.min(pet.position / distance * 88, 88)}% + 15px)` }}>
                      {effectIcon} {effectText}
                    </div>
                  )}
                </div>
              );
            })}
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
