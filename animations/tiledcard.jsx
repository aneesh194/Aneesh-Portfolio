import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TiledCard = ({ imageSrc, alt, rows = 3, cols = 3 }) => {
  const [isHovered, setIsHovered] = useState(false);

  const tiles = Array.from({ length: rows * cols });

  return (
    <div 
      className="relative w-full max-w-md aspect-square overflow-hidden rounded-2xl shadow-2xl bg-zinc-900 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="grid w-full h-full"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)` 
        }}
      >
        {tiles.map((_, i) => {
          const x = i % cols;
          const y = Math.floor(i / cols);
          
          return (
            <motion.div
              key={i}
              className="relative overflow-hidden border-[0.5px] border-white/5"
              initial={false}
              animate={{
                scale: isHovered ? 0.95 : 1,
                rotateX: isHovered ? (y - rows/2) * 5 : 0,
                rotateY: isHovered ? (x - cols/2) * -5 : 0,
                z: isHovered ? 20 : 0
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: i * 0.02
              }}
            >
              <img
                src={imageSrc}
                alt={alt}
                className="absolute object-cover transition-transform duration-300 group-hover:scale-110"
                style={{
                  width: `${cols * 100}%`,
                  height: `${rows * 100}%`,
                  left: `-${x * 100}%`,
                  top: `-${y * 100}%`,
                  maxWidth: 'none'
                }}
              />
              
              {/* Overlay highlight */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 to-purple-500/20"
                animate={{ opacity: isHovered ? 1 : 0 }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Border overlay */}
      <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none group-hover:border-white/20 transition-colors duration-500" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-cyan-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
    </div>
  );
};

export default TiledCard;
