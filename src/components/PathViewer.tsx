
import React, { useState, useEffect, useRef } from 'react';
import { Path } from '@/data/paths';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  // Check if step and nextStepIndicator exist before accessing properties
  if (step && step.nextStepIndicator) {
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMobile = useIsMobile();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Find the selected path, defaulting to the first path if none is selected
  const selectedPath = paths.find(p => p.id === selectedPathId) || (paths.length > 0 ? paths[0] : null);
  
  // Reset currentStepIndex when selectedPathId changes
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [selectedPathId]);

  const handleNext = () => {
    if (selectedPath && currentStepIndex < selectedPath.steps.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentStepIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentStepIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Handle touch events for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    // Calculate the swipe distance
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // Minimum distance required for a swipe
    
    // If the swipe is significant enough
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left, go to next
        handleNext();
      } else {
        // Swiped right, go to previous
        handlePrevious();
      }
    }
    
    // Reset touch points
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStepIndex, selectedPath]);

  if (!selectedPath || !selectedPath.steps || selectedPath.steps.length === 0) {
    return (
      <div className={`flex items-center justify-center ${fullPage ? 'h-screen w-screen' : 'h-[600px] w-full'} bg-gray-100`}>
        <div className="text-gray-500">No path selected or path has no steps</div>
      </div>
    );
  }

  // Get the current step and make sure it exists before using it
  const currentStep = selectedPath.steps[currentStepIndex];
  
  // Need to load both current and next images for smooth transitions
  const nextStepIndex = currentStepIndex < selectedPath.steps.length - 1 ? currentStepIndex + 1 : null;
  const prevStepIndex = currentStepIndex > 0 ? currentStepIndex - 1 : null;
  const nextStep = nextStepIndex !== null ? selectedPath.steps[nextStepIndex] : null;
  const prevStep = prevStepIndex !== null ? selectedPath.steps[prevStepIndex] : null;

  return (
    <div 
      className={`relative ${fullPage ? 'h-screen w-screen' : 'h-[600px] w-full'} bg-black overflow-hidden`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main image container */}
      <div ref={imageContainerRef} className="relative h-full w-full">
        {/* Current image */}
        {currentStep && (
          <div className="absolute inset-0 z-10">
            <img 
              src={currentStep.image} 
              alt={currentStep.description || 'Current step'}
              className={`w-full h-full object-cover transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
              style={{
                objectPosition: getImagePosition(currentStep).x + ' ' + getImagePosition(currentStep).y
              }}
            />
          </div>
        )}
        
        {/* Preload next and previous images for smoother transitions */}
        {nextStep && (
          <div className="absolute inset-0 z-0">
            <img 
              src={nextStep.image} 
              alt={nextStep.description || 'Next step'}
              className="w-full h-full object-cover opacity-0"
              style={{
                objectPosition: getImagePosition(nextStep).x + ' ' + getImagePosition(nextStep).y
              }}
            />
          </div>
        )}
        
        {prevStep && (
          <div className="absolute inset-0 z-0">
            <img 
              src={prevStep.image} 
              alt={prevStep.description || 'Previous step'}
              className="w-full h-full object-cover opacity-0"
              style={{
                objectPosition: getImagePosition(prevStep).x + ' ' + getImagePosition(prevStep).y
              }}
            />
          </div>
        )}
      </div>

      {/* Navigation Controls - show on desktop or when touch controls active */}
      {(showControls || isMobile) && (
        <>
          <Button
            className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 z-20 
                       ${isMobile ? 'w-12 h-12 rounded-full flex items-center justify-center' : ''}`}
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isTransitioning}
            aria-label="Previous step"
          >
            <ChevronLeft className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'}`} />
          </Button>
          <Button
            className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 z-20
                       ${isMobile ? 'w-12 h-12 rounded-full flex items-center justify-center' : ''}`}
            onClick={handleNext}
            disabled={currentStepIndex === selectedPath.steps.length - 1 || isTransitioning}
            aria-label="Next step"
          >
            <ChevronRight className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'}`} />
          </Button>
        </>
      )}

      {/* Step Indicator Pills */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {selectedPath.steps.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-200 
                      ${index === currentStepIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/70'}`}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentStepIndex(index);
                setTimeout(() => setIsTransitioning(false), 300);
              }
            }}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Step Description */}
      {currentStep && (
        <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center px-4">
          <div className={`bg-black/60 text-white px-6 py-3 rounded-lg max-w-md text-center transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {currentStep.description}
          </div>
        </div>
      )}
      
      {/* Mobile swipe hint (shown briefly) */}
      {isMobile && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
          Swipe to navigate
        </div>
      )}
    </div>
  );
};

export default PathViewer;
