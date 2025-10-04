'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export default function LoadingSpinner({ isLoading }: LoadingSpinnerProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center z-50">
      {/* Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Loading Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Title */}
        <motion.h1 
          className="text-4xl font-bold text-white mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Space Biology Research Platform
        </motion.h1>

        {/* Planet System */}
        <div className="relative w-64 h-64">
          {/* Central Star */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full shadow-2xl shadow-yellow-300/50"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {/* Star glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 to-orange-400 blur-sm"></div>
          </motion.div>

          {/* Planet 1 - Mercury (closest) */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              transformOrigin: '0 0',
              transform: 'translate(-50%, -50%) rotate(0deg) translateX(40px)',
            }}
          >
            <motion.div
              className="w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-lg"
              animate={{
                rotate: [0, -360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>

          {/* Planet 2 - Venus */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              transformOrigin: '0 0',
              transform: 'translate(-50%, -50%) rotate(0deg) translateX(60px)',
            }}
          >
            <motion.div
              className="w-6 h-6 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full shadow-lg"
              animate={{
                rotate: [0, -360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>

          {/* Planet 3 - Earth */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              transformOrigin: '0 0',
              transform: 'translate(-50%, -50%) rotate(0deg) translateX(80px)',
            }}
          >
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-500 rounded-full shadow-lg relative overflow-hidden"
              animate={{
                rotate: [0, -360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {/* Earth continents */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-700 rounded-full opacity-70">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-600 rounded-full"></div>
                <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-green-700 rounded-full"></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Planet 4 - Mars */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              transformOrigin: '0 0',
              transform: 'translate(-50%, -50%) rotate(0deg) translateX(100px)',
            }}
          >
            <motion.div
              className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg"
              animate={{
                rotate: [0, -360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>

          {/* Planet 5 - Jupiter */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              transformOrigin: '0 0',
              transform: 'translate(-50%, -50%) rotate(0deg) translateX(120px)',
            }}
          >
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full shadow-lg relative"
              animate={{
                rotate: [0, -360],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {/* Jupiter bands */}
              <div className="absolute inset-0 rounded-full border-2 border-orange-600 opacity-50"></div>
              <div className="absolute inset-2 rounded-full border border-orange-500 opacity-30"></div>
            </motion.div>
          </motion.div>

          {/* Orbital Paths */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-120 h-120 border border-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-160 h-160 border border-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-200 h-200 border border-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-240 h-240 border border-white/10 rounded-full"></div>
        </div>

        {/* Loading Text */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.p 
            className="text-white text-lg mb-2"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading your research universe...
          </motion.p>
          <motion.div 
            className="flex justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
