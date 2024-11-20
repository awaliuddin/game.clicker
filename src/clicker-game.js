import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';

const MindfulnessClicker = () => {
  const [clicks, setClicks] = useState(0);
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [volume, setVolume] = useState(0.5); // Adjustable volume

  // Sound effects
  const [playClick] = useSound('/sounds/click.mp3', { volume });
  const [playLevelUp] = useSound('/sounds/levelup.mp3', { volume });
  const [playBadge] = useSound('/sounds/badge.mp3', { volume });
  
  const concepts = [
    { id: 'cupcake', name: 'Sweet Start', color: 'bg-pink-400', badge: '🧁' },
    { id: 'heart', name: 'Love Power', color: 'bg-red-400', badge: '💖' },
    { id: 'puppy', name: 'Playful Pup', color: 'bg-amber-400', badge: '🐶' },
    { id: 'rainbow', name: 'Rainbow Joy', color: 'bg-purple-400', badge: '🌈' }
  ];

  // Start with 50 clicks for first level
  const clicksNeeded = level === 1 ? 50 : Math.floor(100 * Math.pow(1.5, level - 1));

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  useEffect(() => {
    const newProgress = (clicks / clicksNeeded) * 100;
    setProgress(Math.min(newProgress, 100));

    if (newProgress >= 100) {
      // Level up!
      const newBadge = concepts[(level - 1) % concepts.length].badge;
      setBadges(prev => [...prev, newBadge]);
      setLevel(prev => prev + 1);
      setClicks(0);
      setProgress(0);
      triggerConfetti();
      playLevelUp();
      setTimeout(() => playBadge(), 500); // Play badge sound after level up
    }
  }, [clicks, level, playLevelUp, playBadge]);

  const handleClick = () => {
    setClicks(prev => prev + 1);
    playClick();
  };

  const OrbitingNode = ({ concept, index, total }) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 150;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return (
      <motion.div
        className={`absolute w-24 h-24 rounded-full ${concept.color} 
                   flex items-center justify-center cursor-pointer
                   text-white font-medium shadow-lg backdrop-blur-sm`}
        style={{
          transform: `translate(${x}px, ${y}px)`,
        }}
        whileHover={{ scale: 1.1 }}
        animate={{
          scale: activeNode === concept.id ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.3
        }}
        onClick={() => {
          setActiveNode(concept.id);
          handleClick();
        }}
      >
        <span className="text-2xl">{concept.badge}</span>
      </motion.div>
    );
  };

  // Central core that pulses with energy
  const CoreElement = () => (
    <motion.div
      className="absolute w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 
                 rounded-full flex items-center justify-center z-10 cursor-pointer"
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center">
        <span className="text-white text-lg font-semibold">Click Me!</span>
      </div>
    </motion.div>
  );

  // Badge Display Component
  const BadgeDisplay = ({ badge, index }) => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute w-16 h-16 flex items-center justify-center"
      style={{
        top: `${Math.sin(index * 0.5) * 30 + 100}px`,
        right: `${index * 80 + 20}px`,
      }}
    >
      <span className="text-4xl">{badge}</span>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Stats Bar */}
      <div className="absolute top-0 left-0 right-0 bg-white p-4 shadow-md z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500" />
            <span className="font-semibold">Level {level}</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="volume" className="text-sm text-gray-600">🔊</label>
            <input
              id="volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mt-2 h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Click Counter */}
      <div className="absolute top-24 left-0 right-0 text-center z-20">
        <span className="text-2xl font-bold text-purple-600">
          {clicks} / {clicksNeeded} Clicks
        </span>
      </div>

      {/* Game Area */}
      <div className="relative w-[600px] h-[600px] flex items-center justify-center mt-32">
        <CoreElement />
        {concepts.map((concept, i) => (
          <OrbitingNode
            key={concept.id}
            concept={concept}
            index={i}
            total={concepts.length}
          />
        ))}
      </div>

      {/* Earned Badges Display */}
      <div className="fixed right-0 top-0 h-full w-48 flex flex-col items-end justify-start pt-32">
        {badges.map((badge, index) => (
          <BadgeDisplay key={index} badge={badge} index={index} />
        ))}
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {progress === 100 && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Sparkles className="w-16 h-16 text-yellow-500" />
              <h2 className="text-2xl font-bold">Level Up!</h2>
              <p className="text-4xl">{concepts[(level - 1) % concepts.length].badge}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MindfulnessClicker;