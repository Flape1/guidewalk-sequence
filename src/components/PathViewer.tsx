import React, { useState, useEffect, useRef } from 'react';
import { Path } from '@/data/paths';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PathViewerProps {
  paths: Path[];
  selectedPathId?: string;
  onPathChange?: (pathId: string) => void;
  fullPage?: boolean;
}

// Add position data to help focus on important parts of the image
type ImagePosition = {
  x: string; // percentage from left
  y: string; // percentage from top
};

const getImagePosition = (step: any): ImagePosition => {
  // Use the nextStepIndicator coordinates if available
  if (step.nextStepIndicator) {
    return {
      x: `${step.nextStepIndicator.x}%`,
      y: `${step.nextStepIndicator.y}%`
    };
  }
  // Default to center if no indicator is present
  return {
    x: '50%',
    y: '50%'
  };
};

const PathViewer: React.FC<PathViewerProps> = ({ 
  paths, 
  selectedPathId = paths.length > 0 ? paths[0].id : '', 
  onPathChange,
  fullPage = false
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedPath = paths.find(p => p.id === selectedPathId) || (paths.length > 0 ? paths[0] : null);
  
  useEffect(() => {
    // Check device type and orientation
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  const handleNext = () => {
    if (currentStepIndex < selectedPath.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Handle touch events for horizontal scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !containerRef.current) return;
    
    const touchDelta = touchStart - e.touches[0].clientX;
    containerRef.current.scrollLeft = scrollLeft + touchDelta;
    
    // Prevent vertical scrolling while swiping horizontally
    if (Math.abs(touchDelta) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex]);

  if (!selectedPath) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const currentStep = selectedPath.steps[currentStepIndex];
  const position = getImagePosition(currentStep);

  return (
    <div 
      className="h-screen w-screen fixed inset-0 bg-black"
      onMouseEnter={() => !isMobile && setShowControls(true)}
      onMouseLeave={() => !isMobile && setShowControls(false)}
    >
      <div 
        ref={containerRef}
        className="h-full w-full overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-full min-w-fit flex items-center justify-start">
          <img 
            src={currentStep.image} 
            alt={currentStep.description} 
            className="h-full w-auto max-w-none"
            style={{
              objectFit: 'contain'
            }}
            loading="eager"
          />
        </div>
      </div>
      
      {/* Interactive step indicator */}
      <div className={`absolute ${isMobile ? (isLandscape ? 'bottom-4' : 'bottom-20') : 'bottom-28'} left-0 right-0 z-10`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-center gap-2">
            {selectedPath.steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStepIndex(index)}
                className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} rounded-full transition-all duration-300 ${
                  currentStepIndex === index 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step description with progress */}
      <div className={`absolute ${isMobile ? (isLandscape ? 'bottom-2' : 'bottom-12') : 'bottom-20'} left-0 right-0 z-10`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-center">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 text-center max-w-[90%]">
              <p className="text-white text-sm font-medium">
                Step {currentStepIndex + 1} of {selectedPath.steps.length}: {currentStep.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation buttons with fade effect */}
      {!isMobile && (
        <>
          <div className={`absolute inset-y-0 left-0 flex items-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <Button 
              variant="ghost" 
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="h-20 w-12 rounded-r-full bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          </div>
          
          <div className={`absolute inset-y-0 right-0 flex items-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <Button 
              variant="ghost" 
              onClick={handleNext}
              disabled={currentStepIndex === selectedPath.steps.length - 1}
              className="h-20 w-12 rounded-l-full bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </>
      )}
      
      {/* Mobile touch controls for next/previous */}
      {isMobile && (
        <div className="absolute inset-0 flex pointer-events-none">
          <div 
            className="w-1/4 h-full pointer-events-auto"
            onClick={handlePrevious}
          />
          <div className="w-1/2 h-full" />
          <div 
            className="w-1/4 h-full pointer-events-auto"
            onClick={handleNext}
          />
        </div>
      )}
    </div>
  );
};

export default PathViewer;
