
import React, { useState, useEffect } from 'react';
import { Path } from '@/data/paths';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const progress = ((currentStepIndex + 1) / selectedPath.steps.length) * 100;

  return (
    <div className={`relative ${fullPage ? 'h-full' : ''}`}>
      <div className={`bg-wayfinding-dark shadow-xl ${fullPage ? 'h-full' : 'rounded-lg overflow-hidden h-[60vh] mb-6'}`}>
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
          
          <div className="hidden">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
      
      {/* Overlay controls for navigation */}
      <div className={`absolute ${fullPage ? 'bottom-4 left-0 right-0' : 'bottom-8 left-0 right-0'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-black bg-opacity-60 rounded-lg p-4 text-white">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">
                  Step {currentStepIndex + 1} of {selectedPath.steps.length}
                </span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
              <div className="text-lg font-medium">{currentStep.description}</div>
              
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  className="w-32 bg-opacity-70"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                
                <Button 
                  onClick={handleNext}
                  disabled={currentStepIndex === selectedPath.steps.length - 1}
                  className="w-32 bg-wayfinding-blue hover:bg-blue-600"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathViewer;
