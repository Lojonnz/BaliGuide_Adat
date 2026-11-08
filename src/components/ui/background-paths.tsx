import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import type { ReactNode } from "react";

interface BackgroundPathsProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  asChild?: boolean;
}

export function BackgroundPaths({
  title = "BaliGuide Adat",
  subtitle = "Sacred Territory Geofencing & Traditional Village Administration",
  children,
  asChild = false,
}: BackgroundPathsProps) {
  const Comp = asChild ? Slot : "div";

  const paths = [
    { id: 1, d: "M-100 100 C 200 200, 400 -50, 700 150 C 1000 350, 1200 50, 1500 200", color: "rgba(0, 102, 204, 0.4)" },
    { id: 2, d: "M-100 200 C 300 50, 600 300, 900 100 C 1200 -100, 1400 250, 1600 150", color: "rgba(255, 179, 0, 0.45)" },
    { id: 3, d: "M-100 300 C 150 400, 500 150, 800 350 C 1100 550, 1300 150, 1600 300", color: "rgba(14, 159, 110, 0.4)" },
    { id: 4, d: "M-100 50 C 250 150, 500 -50, 850 200 C 1200 450, 1350 50, 1700 150", color: "rgba(217, 119, 6, 0.35)" },
  ];

  return (
    <div className="relative min-h-[460px] w-full flex flex-col items-center justify-center overflow-hidden py-16 px-4 bg-gradient-to-b from-[var(--color-surface-alt)] to-[var(--color-bg)] transition-colors duration-300">
      {/* Background Animated SVG Paths */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-85 dark:opacity-75">
        <svg
          className="w-full h-full absolute inset-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 800"
          fill="none"
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke={path.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 4 + path.id * 1.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <Comp>
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 dark:from-blue-400 dark:via-teal-300 dark:to-amber-300 bg-clip-text text-transparent pb-1">
                {title}
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-lg sm:text-xl max-w-2xl mx-auto text-[var(--color-text-muted)] font-medium leading-relaxed">
                {subtitle}
              </p>
            </motion.div>
            {children && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 flex flex-wrap justify-center gap-4"
              >
                {children}
              </motion.div>
            )}
          </div>
        </Comp>
      </div>
    </div>
  );
}
