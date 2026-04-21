import { useState, useEffect } from 'react';

interface PetProps {
  emoji: string;
  name: string;
  speed: number;
  startDelay: number;
  bounceOffset: number;
}

interface PixelPetProps {
  pet: PetProps;
  onClick?: () => void;
}

function PixelPet({ pet, onClick }: PixelPetProps) {
  const [pos, setPos] = useState(-100);
  const [facing, setFacing] = useState(1);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      const moveInterval = setInterval(() => {
        setPos(prev => {
          const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
          const next = prev + pet.speed;
          
          if (next > screenWidth + 50) {
            setFacing(-1);
            return -60;
          }
          
          if (prev > 100 && prev < screenWidth - 100) {
            setFacing(prev > (prev + pet.speed) ? -1 : 1);
          }
          
          return next;
        });
      }, 50);

      return () => clearInterval(moveInterval);
    }, pet.startDelay);

    return () => clearTimeout(startTimeout);
  }, [pet.speed, pet.startDelay]);

  return (
    <div 
      className="pixel-pet"
      style={{ 
        left: pos,
        transform: `scaleX(${facing}) translateY(${Math.sin(pos / 20) * pet.bounceOffset}px)`,
      }}
      onClick={onClick}
      title={pet.name}
    >
      <div className="pixel-pet-body">{pet.emoji}</div>
      <div className="pixel-pet-shadow"></div>
    </div>
  );
}

interface PetSelectorProps {
  onChangePet: (index: number, newEmoji: string) => void;
}

export function Pets({ onChangePet }: PetSelectorProps) {
  const [pets, setPets] = useState<PetProps[]>([
    { emoji: '🐕', name: 'Dog', speed: 1.5, startDelay: 0, bounceOffset: 3 },
    { emoji: '🐈', name: 'Cat', speed: 2, startDelay: 8000, bounceOffset: 4 },
    { emoji: '🦆', name: 'Duck', speed: 1.8, startDelay: 16000, bounceOffset: 2 },
  ]);

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
    
    onChangePet(index, nextEmoji);
  };

  return (
    <>
      <style>{`
        .pixel-pet {
          position: fixed;
          bottom: 12px;
          z-index: 9999;
          cursor: pointer;
          transition: transform 0.1s;
          user-select: none;
        }
        
        .pixel-pet:hover {
          filter: brightness(1.2);
        }
        
        .pixel-pet-body {
          font-size: 42px;
          line-height: 1;
          text-shadow: 2px 3px 0 rgba(0,0,0,0.2);
        }
        
        .pixel-pet-shadow {
          width: 28px;
          height: 6px;
          background: rgba(0,0,0,0.2);
          border-radius: 50%;
          margin: 2px auto 0;
        }
      `}</style>
      
      {pets.map((pet, index) => (
        <PixelPet 
          key={index} 
          pet={pet} 
          onClick={() => cyclePet(index)}
        />
      ))}
    </>
  );
}