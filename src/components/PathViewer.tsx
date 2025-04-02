
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Path } from '@/data/paths';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface PathViewerProps {
  paths: Path[];
}

const PathViewer: React.FC<PathViewerProps> = ({ paths }) => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  
  const [currentPath, setCurrentPath] = useState<Path | undefined>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [api, setApi] = useState<any>(null);
  
  useEffect(() => {
    const path = paths.find(p => p.id === pathId);
    if (path) {
      setCurrentPath(path);
    } else {
      toast.error("Path not found");
      navigate('/');
    }
  }, [pathId, paths, navigate]);

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

  if (!currentPath) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const currentStep = currentPath.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / currentPath.steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate('/')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Locations
      </Button>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{currentPath.name}</h1>
        <p className="text-muted-foreground">{currentPath.description}</p>
      </div>
      
      <div className="rounded-lg overflow-hidden bg-wayfinding-dark shadow-xl h-[60vh] mb-6">
        <Carousel setApi={setApi} className="w-full h-full" opts={{ loop: false }}>
          <CarouselContent className="h-full">
            {currentPath.steps.map((step, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="h-full w-full flex items-center justify-center">
                  <img 
                    src={step.image} 
                    alt={step.description} 
                    className="w-full h-full object-cover"
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
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Step {currentStepIndex + 1} of {currentPath.steps.length}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
        <div className="text-lg font-medium">{currentStep.description}</div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="w-32"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={currentStepIndex === currentPath.steps.length - 1}
            className="w-32 bg-wayfinding-blue hover:bg-blue-600"
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PathViewer;
