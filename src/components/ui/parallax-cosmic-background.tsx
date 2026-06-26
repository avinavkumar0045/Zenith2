import React, { useEffect, useState } from 'react';

interface CosmicParallaxBgProps {
  head: string;
  text: string;
  loop?: boolean;
  className?: string;
}

const generateStarBoxShadow = (count: number): string => {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadows.push(`${x}px ${y}px #FFF`);
  }
  return shadows.join(', ');
};

const CosmicParallaxBg: React.FC<CosmicParallaxBgProps> = ({
  head,
  text,
  loop = true,
  className = '',
}) => {
  const [smallStars] = useState<string>(() => generateStarBoxShadow(700));
  const [mediumStars] = useState<string>(() => generateStarBoxShadow(200));
  const [bigStars] = useState<string>(() => generateStarBoxShadow(100));
  
  const textParts = text.split(',').map(part => part.trim());
  
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--animation-iteration', 
      loop ? 'infinite' : '1'
    );
  }, [loop]);
  
  return (
    <div className={`cosmic-parallax-container ${className}`}>
      <div id="stars" style={{ boxShadow: smallStars }} className="cosmic-stars"></div>
      <div id="stars2" style={{ boxShadow: mediumStars }} className="cosmic-stars-medium"></div>
      <div id="stars3" style={{ boxShadow: bigStars }} className="cosmic-stars-large"></div>
      <div id="horizon"><div className="glow"></div></div>
      <div id="earth"></div>
    </div>
  );
};

export { CosmicParallaxBg };
