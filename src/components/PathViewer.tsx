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
  
  // Find the selected path, defaulting to the first path if none is selected
  const selectedPath = paths.find(p => p.id === selectedPathId) || paths[0];
  
  // Reset currentStepIndex when selectedPathId changes
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [selectedPathId]);
  
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
    if (selectedPath && currentStepIndex < selectedPath.steps.length - 1) {
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

  if (!selectedPath || !selectedPath.steps || selectedPath.steps.length === 0) {
    return (
      <div className={`flex items-center justify-center ${fullPage ? 'h-screen w-screen' : 'h-[600px] w-full'} bg-gray-100`}>
        <div className="text-gray-500">No path selected or path has no steps</div>
      </div>
    );
  }

  const currentStep = selectedPath.steps[currentStepIndex];
  const position = getImagePosition(currentStep);

  return (
    <div 
      className={`relative ${fullPage ? 'h-screen w-screen' : 'h-[600px] w-full'} bg-black`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div 
        ref={containerRef}
        className="h-full w-full overflow-x-auto overflow-y-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-full min-w-full flex items-center justify-center">
          <img 
            src={currentStep.image} 
            alt={currentStep.description}
            className="h-full w-auto object-contain"
            style={{
              objectPosition: `${position.x} ${position.y}`
            }}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && (
        <>
          <Button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
            onClick={handleNext}
            disabled={currentStepIndex === selectedPath.steps.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Step Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {selectedPath.steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentStepIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Step Description */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded">
        {currentStep.description}
      </div>
    </div>
  );
};

export default PathViewer;
