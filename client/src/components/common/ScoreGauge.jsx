import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

function getColor(score) {
  if (score >= 80) return '#059669';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

export default function ScoreGauge({ score, size = 160, strokeWidth = 12, label, grade, gradeColor }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayScore, setDisplayScore] = useState(0);

  const motionScore = useMotionValue(0);
  const strokeDashoffset = useTransform(motionScore, [0, 100], [circumference, 0]);

  useEffect(() => {
    const controls = animate(motionScore, score, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return controls.stop;
  }, [score, motionScore]);

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-navy-100 dark:text-navy-600"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-3xl font-bold text-navy-500 dark:text-white">
            {displayScore}
          </span>
          {grade && (
            <span
              className="font-heading text-lg font-bold"
              style={{ color: gradeColor || color }}
            >
              {grade}
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-navy-400 dark:text-gray-400">{label}</span>
      )}
    </div>
  );
}
