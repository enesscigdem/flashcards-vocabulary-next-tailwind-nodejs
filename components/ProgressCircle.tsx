'use client';
import { motion } from 'framer-motion';

interface Props {
  progress: number; // 0–1
  playing?: boolean;
}

export function ProgressCircle({ progress, playing }: Props) {
  const radius = 18;
  const stroke = 3;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
      <svg width={radius * 2} height={radius * 2} className="text-primary">
        <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
        />
        {playing && (
            <motion.circle
                className="text-primary/30"
                animate={{ r: radius * 1.2, opacity: 0 }}
                initial={{ r: radius, opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1 }}
                fill="currentColor"
                cx={radius}
                cy={radius}
            />
        )}
      </svg>
  );
}
