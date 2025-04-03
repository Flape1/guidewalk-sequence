import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { Path } from '@/data/paths';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [imageScale, setImageScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [initialPanPosition, setInitialPanPosition] = useState({ x: 0, y: 0 });
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const [nextImageLoaded, setNextImageLoaded] = useState(false);
  const [prevImageLoaded, setPrevImageLoaded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  
  const isMobile = useIsMobile();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  
  // Find the selected path, defaulting to the first path if none is selected
  const selectedPath = paths.find(p => p.id === selectedPathId) || (paths.length > 0 ? paths[0] : null);
  
  // Reset currentStepIndex when selectedPathId changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setActiveImageIndex(0);
    setImageScale(1);
    setPanPosition({ x: 0, y: 0 });
    setImagesLoaded({});
  }, [selectedPathId]);

  // Preload all images for the current path to ensure smooth transitions
  useEffect(() => {
    if (selectedPath && selectedPath.steps) {
      const newImagesLoaded = { ...imagesLoaded };
      
      selectedPath.steps.forEach((step, index) => {
        const img = new Image();
        img.src = step.image;
        img.onload = () => {
          newImagesLoaded[index] = true;
          setImagesLoaded(newImagesLoaded);
        };
      });
    }
  }, [selectedPath]);

  // Set active image index to match current step after transition
  useEffect(() => {
    if (!isTransitioning) {
      setActiveImageIndex(currentStepIndex);
    }
  }, [isTransitioning, currentStepIndex]);

  const handleNext = () => {
    if (selectedPath && currentStepIndex < selectedPath.steps.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      // Keep current image visible during transition preparation
      setTimeout(() => {
        // Set next image as active during transition
        setActiveImageIndex(currentStepIndex + 1);
        setCurrentStepIndex(prevIndex => prevIndex + 1);
        
        // Allow time for DOM to update before animation starts
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 50);
      
      resetZoomAndPan();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      // Keep current image visible during transition preparation
      setTimeout(() => {
        // Set previous image as active during transition
        setActiveImageIndex(currentStepIndex - 1);
        setCurrentStepIndex(prevIndex => prevIndex - 1);
        
        // Allow time for DOM to update before animation starts
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 50);
      
      resetZoomAndPan();
    }
  };

  const resetZoomAndPan = () => {
    setImageScale(1);
    setPanPosition({ x: 0, y: 0 });
    setLastPanPosition({ x: 0, y: 0 });
  };

  // Handle touch events for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    // If there are multiple touches (pinch/zoom), don't handle as a swipe
    if (e.touches.length > 1) return;
    
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    
    if (imageScale > 1) {
      setIsPanning(true);
      setInitialPanPosition({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // If there are multiple touches or we're not tracking a swipe, exit
    if (e.touches.length > 1 || touchStart === null) return;
    
    setTouchEnd(e.targetTouches[0].clientX);
    
    // Handle panning when zoomed in
    if (isPanning && imageScale > 1) {
      const deltaX = e.targetTouches[0].clientX - initialPanPosition.x;
      const deltaY = e.targetTouches[0].clientY - initialPanPosition.y;
      
      setPanPosition({
        x: lastPanPosition.x + deltaX / imageScale,
        y: lastPanPosition.y + deltaY / imageScale
      });
      
      // Prevent default to stop browser from scrolling/pulling to refresh
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPosition(panPosition);
      return;
    }
    
    if (!touchStart || !touchEnd) return;
    
    // Calculate the swipe distance
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 30; // Minimum distance required for a swipe
    
    // If the swipe is significant enough and we're not zoomed in
    if (Math.abs(distance) > minSwipeDistance && imageScale <= 1 && !isTransitioning) {
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

  // Handle pinch to zoom
  const lastTouchDistance = useRef<number>(0);
  
  const handleTouchZoomStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastTouchDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX, 
        touch2.clientY - touch1.clientY
      );
    }
  };

  const handleTouchZoomMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX, 
        touch2.clientY - touch1.clientY
      );
      
      if (lastTouchDistance.current > 0) {
        const scale = currentDistance / lastTouchDistance.current;
        setImageScale(prevScale => Math.max(1, Math.min(5, prevScale * scale)));
      }
      
      lastTouchDistance.current = currentDistance;
      e.preventDefault();
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setImageScale(prevScale => Math.min(5, prevScale + 0.5));
  };

  const handleZoomOut = () => {
    setImageScale(prevScale => {
      const newScale = Math.max(1, prevScale - 0.5);
      if (newScale === 1) {
        // Reset pan position when fully zoomed out
        setPanPosition({ x: 0, y: 0 });
        setLastPanPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetZoomAndPan();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStepIndex, selectedPath, imageScale]);

  // Handle direct navigation to specific step
  const handleStepClick = (index: number) => {
    if (isTransitioning || index === currentStepIndex) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setActiveImageIndex(index);
      setCurrentStepIndex(index);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 50);
    
    resetZoomAndPan();
  };

  if (!selectedPath || !selectedPath.steps || selectedPath.steps.length === 0) {
    return (
      <div className={`flex items-center justify-center ${fullPage ? 'h-screen w-screen' : 'h-[600px] w-full'} bg-gray-100`}>
        <div className="text-gray-500">No path selected or path has no steps</div>
      </div>
    );
  }

  // Get the current step and make sure it exists before using it
  const currentStep = selectedPath.steps[currentStepIndex];
  
  // Need to load both current and adjacent images for smooth transitions
  const nextStepIndex = currentStepIndex < selectedPath.steps.length - 1 ? currentStepIndex + 1 : null;
  const prevStepIndex = currentStepIndex > 0 ? currentStepIndex - 1 : null;

  // Image transformation styles
  const imageTransformStyle: CSSProperties = {
    transform: `scale(${imageScale}) translate(${panPosition.x}px, ${panPosition.y}px)`,
    transition: isPanning ? 'none' : 'transform 200ms ease-out',
    objectPosition: currentStep ? getImagePosition(currentStep).x + ' ' + getImagePosition(currentStep).y : '50% 50%'
  };

  return (
    <div 
      className={`relative ${fullPage ? 'h-screen w-screen' : 'h-[600px] w-full'} bg-black overflow-hidden`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Image container with transition handling */}
      <div 
        ref={imageContainerRef} 
        className="relative h-full w-full cursor-grab active:cursor-grabbing"
        onTouchStart={(e) => {
          handleTouchStart(e);
          handleTouchZoomStart(e);
        }}
        onTouchMove={(e) => {
          handleTouchMove(e);
          handleTouchZoomMove(e);
        }}
        onTouchEnd={handleTouchEnd}
      >
        {/* Current visible image with transition */}
        {selectedPath.steps.map((step, index) => (
          <div 
            key={index}
            className={`absolute inset-0 z-20 w-full h-full transition-opacity duration-300 ease-in-out ${
              index === activeImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img 
              ref={el => imageRefs.current[index] = el}
              src={step.image} 
              alt={step.description || `Step ${index + 1}`}
              className="w-full h-full object-cover"
              style={index === activeImageIndex ? imageTransformStyle : undefined}
              onLoad={() => {
                const newImagesLoaded = { ...imagesLoaded };
                newImagesLoaded[index] = true;
                setImagesLoaded(newImagesLoaded);
              }}
            />
          </div>
        ))}
      </div>

      {/* Zoom controls - show when zoomed in or controls are visible */}
      {(showControls || imageScale > 1) && !isMobile && (
        <div className="absolute top-4 right-4 flex space-x-2 bg-black/50 p-2 rounded-lg z-30">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomIn}
            className="h-8 w-8 text-white"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomOut}
            disabled={imageScale <= 1}
            className="h-8 w-8 text-white"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation Controls - show on desktop or when touch controls active */}
      {(showControls || isMobile) && (
        <>
          <Button
            className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 z-30 
                       ${isMobile ? 'w-12 h-12 rounded-full flex items-center justify-center' : ''}`}
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isTransitioning}
            aria-label="Previous step"
          >
            <ChevronLeft className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'}`} />
          </Button>
          <Button
            className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 z-30
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
      <ScrollArea className="absolute bottom-24 left-0 right-0 z-30 flex justify-center" orientation="horizontal">
        <div className="flex space-x-2 justify-center px-4">
          {selectedPath.steps.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 
                        ${index === currentStepIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/70'}`}
              onClick={() => handleStepClick(index)}
              aria-label={`Go to step ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Step Description */}
      {currentStep && (
        <div className="absolute bottom-16 left-0 right-0 z-30 flex justify-center px-4">
          <div className={`bg-black/60 text-white px-6 py-3 rounded-lg max-w-md text-center transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {selectedPath.steps[activeImageIndex]?.description || ''}
          </div>
        </div>
      )}
      
      {/* Mobile zoom and pan hint (shown briefly) */}
      {isMobile && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
          Swipe to navigate • Pinch to zoom
        </div>
      )}
    </div>
  );
};

export default PathViewer;
