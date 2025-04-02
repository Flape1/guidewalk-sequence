
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PathViewerProps {
  paths: Path[];
}

const PathViewer: React.FC<PathViewerProps> = ({ paths }) => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  
  const [selectedPathId, setSelectedPathId] = useState<string>(pathId || (paths.length > 0 ? paths[0].id : ''));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [api, setApi] = useState<any>(null);
  
  const selectedPath = paths.find(p => p.id === selectedPathId);
  
  useEffect(() => {
    if (pathId && paths.some(p => p.id === pathId)) {
      setSelectedPathId(pathId);
    } else if (paths.length > 0 && (!pathId || !paths.some(p => p.id === pathId))) {
      // If no valid path ID is provided in the URL, use the first available path
      if (pathId && !paths.some(p => p.id === pathId)) {
        toast.error("Path not found");
      }
      setSelectedPathId(paths[0].id);
      // Update the URL without reloading the page if we're on the path page
      if (window.location.pathname.includes('/path/')) {
        navigate(`/path/${paths[0].id}`, { replace: true });
      }
    }
  }, [pathId, paths, navigate]);

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

  const handlePathChange = (pathId: string) => {
    setSelectedPathId(pathId);
    // Update URL if we're on the path page
    if (window.location.pathname.includes('/path/')) {
      navigate(`/path/${pathId}`, { replace: true });
    }
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const currentStep = selectedPath.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / selectedPath.steps.length) * 100;

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
        <h1 className="text-3xl font-bold mb-2">{selectedPath.name}</h1>
        <p className="text-muted-foreground">{selectedPath.description}</p>
      </div>
      
      <div className="rounded-lg overflow-hidden bg-wayfinding-dark shadow-xl h-[60vh] mb-6">
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
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Step {currentStepIndex + 1} of {selectedPath.steps.length}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 mb-10">
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
            disabled={currentStepIndex === selectedPath.steps.length - 1}
            className="w-32 bg-wayfinding-blue hover:bg-blue-600"
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Path thumbnails navigation */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Available Paths</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {paths.map((path) => (
            <div 
              key={path.id}
              onClick={() => handlePathChange(path.id)}
              className={`cursor-pointer rounded-md overflow-hidden transition-all duration-200 ${selectedPathId === path.id ? 'ring-4 ring-wayfinding-blue ring-opacity-70 transform scale-105' : 'hover:opacity-80'}`}
            >
              <div className="aspect-video relative">
                <img 
                  src={path.steps[0].image} 
                  alt={path.name} 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 flex items-center justify-center ${selectedPathId === path.id ? 'bg-blue-500 bg-opacity-30' : 'bg-black bg-opacity-40 hover:bg-opacity-20'} transition-all duration-200`}>
                  <p className="text-white text-xs sm:text-sm font-medium text-center px-2">{path.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PathViewer;
