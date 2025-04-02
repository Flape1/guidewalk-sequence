
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Path } from '@/data/paths';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface PathViewerProps {
  paths: Path[];
}

const PathViewer: React.FC<PathViewerProps> = ({ paths }) => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  
  const [currentPath, setCurrentPath] = useState<Path | undefined>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [animatingForward, setAnimatingForward] = useState(false);
  const [animatingBackward, setAnimatingBackward] = useState(false);
  const [prevImage, setPrevImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  
  useEffect(() => {
    const path = paths.find(p => p.id === pathId);
    if (path) {
      setCurrentPath(path);
      setCurrentImage(path.steps[0].image);
    } else {
      toast.error("Path not found");
      navigate('/');
    }
  }, [pathId, paths, navigate]);

  const handleNext = useCallback(() => {
    if (!currentPath || animatingForward || animatingBackward) return;
    
    if (currentStepIndex < currentPath.steps.length - 1) {
      setAnimatingForward(true);
      setPrevImage(currentImage);
      setCurrentImage(currentPath.steps[currentStepIndex + 1].image);
      
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setAnimatingForward(false);
      }, 750); // Match with animation duration
    }
  }, [currentPath, currentStepIndex, animatingForward, animatingBackward, currentImage]);

  const handlePrevious = useCallback(() => {
    if (!currentPath || animatingForward || animatingBackward) return;
    
    if (currentStepIndex > 0) {
      setAnimatingBackward(true);
      setPrevImage(currentImage);
      setCurrentImage(currentPath.steps[currentStepIndex - 1].image);
      
      setTimeout(() => {
        setCurrentStepIndex(prev => prev - 1);
        setAnimatingBackward(false);
      }, 750); // Match with animation duration
    }
  }, [currentPath, currentStepIndex, animatingForward, animatingBackward, currentImage]);

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
  }, [handleNext, handlePrevious]);

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
      
      <div className="relative rounded-lg overflow-hidden bg-wayfinding-dark shadow-xl h-[60vh] mb-6">
        <div className="image-transition-container">
          {prevImage && animatingForward && (
            <img 
              src={prevImage} 
              alt="Previous" 
              className="image-transition animate-image-zoom-in"
            />
          )}
          {prevImage && animatingBackward && (
            <img 
              src={prevImage} 
              alt="Previous" 
              className="image-transition animate-fade-out"
            />
          )}
          {currentImage && !animatingForward && !animatingBackward && (
            <img 
              src={currentImage} 
              alt={currentStep.description} 
              className="image-transition animate-fade-in"
            />
          )}
          {currentImage && animatingForward && (
            <img 
              src={currentImage} 
              alt={currentStep.description} 
              className="image-transition animate-image-zoom-out"
            />
          )}
          {currentImage && animatingBackward && (
            <img 
              src={currentImage} 
              alt={currentStep.description} 
              className="image-transition animate-fade-in"
            />
          )}
        </div>
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
            disabled={currentStepIndex === 0 || animatingForward || animatingBackward}
            className="w-32"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={currentStepIndex === currentPath.steps.length - 1 || animatingForward || animatingBackward}
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
