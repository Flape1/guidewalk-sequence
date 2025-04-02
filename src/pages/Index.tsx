import React, { useState, useEffect } from 'react';
import paths from '@/data/paths';
import PathViewer from '@/components/PathViewer';

const Index = () => {
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with the first path if available
  useEffect(() => {
    if (paths.length > 0 && !isInitialized) {
      setSelectedPathId(paths[0].id);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handlePathSelect = (pathId: string) => {
    if (paths.some(path => path.id === pathId)) {
      setSelectedPathId(pathId);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      {/* Full-screen path viewer */}
      <PathViewer 
        paths={paths} 
        selectedPathId={selectedPathId} 
        onPathChange={handlePathSelect} 
        fullPage={true}
      />
      
      {/* Location cards overlay */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent h-24 absolute inset-0" />
        <div className="flex justify-center items-end h-full">
          <div className="flex gap-2 justify-center pb-2">
            {paths.map((path) => (
              <div 
                key={path.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPathId === path.id 
                    ? 'ring-2 ring-white scale-105 z-20' 
                    : 'opacity-80 hover:opacity-100'
                }`}
                onClick={() => handlePathSelect(path.id)}
              >
                <div className="w-32 relative">
                  <img 
                    src={path.steps[0].image} 
                    alt={path.name}
                    className="w-full h-16 object-cover rounded-lg shadow-lg" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg">
                    <div className="absolute bottom-0 left-0 right-0 p-1">
                      <h3 className="text-white text-xs font-medium text-center">{path.name}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
