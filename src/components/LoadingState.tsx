import { useState, useEffect } from "react";

const loadingMessages = [
  "Analyzing your positioning",
  "Checking ICP alignment",
  "Evaluating keyword density",
  "Crafting optimized headlines",
  "Generating positioning angles",
  "Finalizing recommendations",
];

const LoadingState = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 95));
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <section className="py-20 px-6">
      <div className="max-w-lg mx-auto text-center">
        <div className="card-elevated p-10 glow-accent">
          {/* Animated loader */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-muted animate-pulse" />
              <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{progress}%</span>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Loading message */}
          <p className="text-lg text-foreground font-medium animate-pulse">
            {loadingMessages[messageIndex]}
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoadingState;
