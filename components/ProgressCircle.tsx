"use client"
import { motion } from "framer-motion"

interface Props {
    progress: number // 0–1
    playing?: boolean
    size?: number
}

export function ProgressCircle({ progress, playing, size = 36 }: Props) {
    const radius = size / 2 - 3
    const circumference = radius * 2 * Math.PI
    const strokeDashoffset = circumference - progress * circumference

    return (
        <div className="relative">
            <svg width={size} height={size} className="text-primary transform -rotate-90">
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset: circumference }}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    className="opacity-20"
                />
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset, transition: "stroke-dashoffset 0.3s ease-in-out" }}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeLinecap="round"
                />
            </svg>

            {playing && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-primary/10"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                />
            )}

            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium">{Math.round(progress * 100)}%</span>
            </div>
        </div>
    )
}
