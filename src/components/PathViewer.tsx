
import React, { useState, useEffect } from 'react';
import { Path } from '@/data/paths';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface PathViewerProps {
  paths: Path[];
  selectedPathId?: string;
  onPathChange?: (pathId: string) => void;
  fullPage?: boolean;
}

const PathViewer: React.FC<PathViewerProps> = ({ 
  paths, 
  selectedPathId = paths.length > 0 ? paths[0].id : '', 
  onPathChange,
  fullPage = false
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [api, setApi] = useState<any>(null);
  
  const selectedPath = paths.find(p => p.id === selectedPathId) || (paths.length > 0 ? paths[0] : null);
  
  useEffect(() => {
    // Reset step index when changing paths
    setCurrentStepIndex(0);
    if (api) {
      api.scrollTo(0, { immediate: true });
    }
  }, [selectedPathId, api]);

  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      setCurrentStepIndex(api.selectedScrollSnap());
    };
    
    api.on("select", handleSelect);
    
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  const handleNext = () => {
    if (api) api.scrollNext();
  };

  const handlePrevious = () => {
    if (api) api.scrollPrev();
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
  }, [api]);

  if (!selectedPath) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  const currentStep = selectedPath.steps[currentStepIndex];

  return (
    <div className="h-full w-full relative">
      <Carousel setApi={setApi} className="w-full h-full" opts={{ loop: false }}>
        <CarouselContent className="h-full">
          {selectedPath.steps.map((step, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="h-full w-full flex items-center justify-center">
                <img 
                  src={step.image} 
                  alt={step.description} 
                  className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Minimal navigation controls */}
      <div className="absolute bottom-40 left-0 right-0 z-10 pointer-events-none">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-center">
            <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 pointer-events-auto">
              <p className="text-white text-lg font-medium">{currentStep.description}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Side navigation buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <Button 
          variant="ghost" 
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="h-20 w-12 rounded-r-full bg-black bg-opacity-30 hover:bg-opacity-50 text-white"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button 
          variant="ghost" 
          onClick={handleNext}
          disabled={currentStepIndex === selectedPath.steps.length - 1}
          className="h-20 w-12 rounded-l-full bg-black bg-opacity-30 hover:bg-opacity-50 text-white"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default PathViewer;
