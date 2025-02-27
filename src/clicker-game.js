import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';

const MindfulnessClicker = () => {
  // Load saved state from localStorage or use defaults
  const savedState = JSON.parse(localStorage.getItem('gameState') || '{}');
  
  const [clicks, setClicks] = useState(savedState.clicks || 0);
  const [lifetimeClicks, setLifetimeClicks] = useState(savedState.lifetimeClicks || 0);
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(savedState.level || 1);
  const [badges, setBadges] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [volume, setVolume] = useState(0.5); // Adjustable volume
  const [currentChallenge, setCurrentChallenge] = useState(savedState.currentChallenge || null);
  const [nodeStates, setNodeStates] = useState([
    { id: 'cupcake', name: 'Sweet Start', color: 'bg-pink-400', badge: '🧁', position: 0 },
    { id: 'heart', name: 'Love Power', color: 'bg-red-400', badge: '💖', position: 1 },
    { id: 'puppy', name: 'Playful Pup', color: 'bg-amber-400', badge: '🐶', position: 2 },
    { id: 'rainbow', name: 'Rainbow Joy', color: 'bg-purple-400', badge: '🌈', position: 3 }
  ]);
  const [showBadges, setShowBadges] = useState(false);
  const [isSpacebarPressed, setIsSpacebarPressed] = useState(false); // Track spacebar state

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

  const gridPositions = {
    0: 'col-start-2 row-start-1', // top
    1: 'col-start-3 row-start-2', // right
    2: 'col-start-2 row-start-3', // bottom
    3: 'col-start-1 row-start-2', // left
  };

  const challenges = [
    { multiplier: 2, condition: 'color', target: 'bg-amber-400', message: '2x points: click yellow bubbles!' },
    { multiplier: 2, condition: 'color', target: 'bg-pink-400', message: '2x points: click pink bubbles!' },
    { multiplier: 3, condition: 'badge', target: '🌈', message: '3x points: click rainbow bubbles!' },
    { multiplier: 3, condition: 'badge', target: '🐶', message: '3x points: click puppy bubbles!' },
    { multiplier: 2, condition: 'color', target: 'bg-red-400', message: '2x points: click red bubbles!' },
    { multiplier: 2, condition: 'color', target: 'bg-purple-400', message: '2x points: click purple bubbles!' }
  ];

  // Shuffle nodes after each click
  const shuffleNodes = () => {
    setNodeStates(prevStates => {
      const newStates = [...prevStates];
      for (let i = newStates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newStates[i].position, newStates[j].position] = [newStates[j].position, newStates[i].position];
      }
      return newStates;
    });
  };

  // Set new challenge periodically
  useEffect(() => {
    const setChallengeTimer = setInterval(() => {
      const newChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      setCurrentChallenge(newChallenge);
    }, 10000); // New challenge every 10 seconds

    return () => clearInterval(setChallengeTimer);
  }, []);

  const getOrbitalAnimation = (index) => {
    if (level < 3) return {};
    
    const duration = 3 + (index * 0.5); // Different speeds for each node
    const direction = index % 2 === 0 ? 1 : -1; // Alternate directions
    
    return {
      animate: {
        rotate: [0, 360 * direction],
      },
      transition: {
        duration: duration,
        repeat: Infinity,
        ease: "linear"
      }
    };
  };

  const OrbitingNode = ({ node, index }) => {
    const position = gridPositions[node.position];
    const orbitalMotion = getOrbitalAnimation(index);
    
    return (
      <motion.div
        className={`flex items-center justify-center ${position}`}
        {...orbitalMotion}
      >
        <motion.div
          className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${node.color} 
                     flex items-center justify-center cursor-pointer
                     text-white font-medium shadow-lg backdrop-blur-sm`}
          whileHover={{ 
            scale: 1.1,
            zIndex: 30
          }}
          animate={{
            scale: activeNode === node.id ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.3
          }}
          onClick={() => {
            setActiveNode(node.id);
            handleClick(node);
          }}
        >
          <span className="text-lg sm:text-2xl">{node.badge}</span>
        </motion.div>
      </motion.div>
    );
  };

  // Central core that pulses with energy
  const CoreElement = () => (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 
                    flex items-center justify-center cursor-pointer text-white font-medium 
                    shadow-lg backdrop-blur-sm text-center`}
        onClick={handleCoreClick}
      >
        <span className="text-sm sm:text-base whitespace-nowrap">Click Me!</span>
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

  // Calculate progress percentage
  useEffect(() => {
    const clicksNeeded = level * 50;
    const progressPercentage = Math.min((clicks / clicksNeeded) * 100, 100);
    setProgress(progressPercentage / 100); // Convert to decimal for width calculation
  }, [clicks, level]);

  // Check for level up
  useEffect(() => {
    const clicksNeeded = level * 50;
    if (clicks >= clicksNeeded) {
      setLevel(prev => prev + 1);
      setClicks(0); // Reset clicks for new level
      playLevelUp();
      
      // Add new badge for level up
      const newBadge = concepts[(level - 1) % concepts.length].badge;
      setBadges(prev => [...prev, newBadge]);
      playBadge();
    }
  }, [clicks, level, playLevelUp, playBadge]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleClick = (node) => {
    let pointsToAdd = 1;
    
    if (currentChallenge) {
      const matchesChallenge = 
        (currentChallenge.condition === 'color' && node.color === currentChallenge.target) ||
        (currentChallenge.condition === 'badge' && node.badge === currentChallenge.target);
      
      if (matchesChallenge) {
        pointsToAdd = currentChallenge.multiplier;
        playLevelUp(); // Extra sound for multiplier success
      }
    }

    setClicks(prev => prev + pointsToAdd);
    setLifetimeClicks(prev => prev + 1);
    shuffleNodes();
    playClick();
  };

  const getLevelDescription = () => {
    if (level >= 3) return "Level " + level + " 🌀";
    if (level === 2) return "Level " + level + " (Orbital motion coming soon!)";
    return "Level " + level;
  };

  // Handle core click
  const handleCoreClick = () => {
    setClicks(prev => prev + 1);
    setLifetimeClicks(prev => prev + 1);
    playClick();
    shuffleNodes();
  };

  // Add keyboard event listener for spacebar
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the pressed key is the spacebar and it's not already pressed
      if ((event.code === 'Space' || event.key === ' ') && !isSpacebarPressed) {
        // Prevent default behavior (like scrolling the page)
        event.preventDefault();
        // Set spacebar as pressed to prevent multiple triggers
        setIsSpacebarPressed(true);
        // Trigger the center circle click
        handleCoreClick();
      }
    };

    const handleKeyUp = (event) => {
      // Reset the spacebar state when it's released
      if (event.code === 'Space' || event.key === ' ') {
        setIsSpacebarPressed(false);
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up the event listeners when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacebarPressed, handleCoreClick, playClick, shuffleNodes]); // Include all dependencies

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 p-4">
      {/* Stats Bar */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 w-[90%] max-w-md px-4 z-20">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <span className="text-yellow-500">⭐</span>
            <span>Level {level}</span>
            {level >= 3 && <span>🌀</span>}
          </div>
          <button 
            onClick={() => setShowBadges(prev => !prev)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full
                     shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2
                     hover:scale-105 active:scale-95"
          >
            <span className="hidden sm:inline">My Badges</span>
            <span className="flex items-center gap-1">
              <span className="inline sm:hidden">Badges</span>
              <span className="bg-white bg-opacity-20 w-5 h-5 rounded-full flex items-center justify-center text-xs">
                {badges.length}
              </span>
            </span>
          </button>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="text-base sm:text-lg">{clicks} / {level * 50} Clicks</div>
          <div className="text-xs sm:text-sm text-gray-600">Lifetime Clicks: {lifetimeClicks}</div>
          {currentChallenge && (
            <div className="text-xs sm:text-sm text-purple-600 animate-pulse px-2 text-center">
              {currentChallenge.message}
            </div>
          )}
        </div>
      </div>

      {/* Badges Collection Modal */}
      <AnimatePresence>
        {showBadges && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBadges(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-[95%] max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Badge Collection
                </h2>
                <button 
                  onClick={() => setShowBadges(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 
                             rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2
                             shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(0,0,0,0.15)]
                             transform hover:scale-105 transition-all duration-300
                             border border-white backdrop-blur-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
                    }}
                  >
                    <span className="text-3xl transform hover:scale-110 transition-transform duration-300 
                                   hover:rotate-12 cursor-pointer filter drop-shadow-lg">
                      {badge}
                    </span>
                    <span className="text-xs text-gray-600 text-center font-medium">
                      Level {index + 1}
                    </span>
                  </motion.div>
                ))}
                
                {/* Placeholder badges */}
                {Array.from({ length: Math.max(0, 9 - badges.length) }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="aspect-square bg-gray-100 rounded-2xl p-4 sm:p-6 flex flex-col items-center 
                             justify-center gap-2 opacity-30"
                  >
                    <span className="text-3xl">?</span>
                    <span className="text-xs text-gray-400">
                      Level {badges.length + index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Area */}
      <div className="w-[min(90vw,90vh)] sm:w-[min(70vw,70vh)] md:w-[min(60vw,60vh)] lg:w-[min(50vw,50vh)] aspect-square relative">
        {/* Grid Container */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4">
          {/* Center Circle */}
          <div className="col-start-2 row-start-2 flex items-center justify-center">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 
                        flex items-center justify-center cursor-pointer text-white font-medium 
                        shadow-lg backdrop-blur-sm text-center"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              onClick={handleCoreClick}
            >
              <span className="text-sm sm:text-base whitespace-nowrap">Click Me!</span>
            </motion.div>
          </div>

          {/* Orbiting Nodes */}
          {nodeStates.map((node, index) => (
            <OrbitingNode key={node.id} node={node} index={index} />
          ))}
        </div>
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {progress >= 1 && (
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
              <span className="text-4xl">⭐</span>
              <h2 className="text-2xl font-bold">Level Up!</h2>
              <p className="text-4xl">{badges[badges.length - 1]}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MindfulnessClicker;