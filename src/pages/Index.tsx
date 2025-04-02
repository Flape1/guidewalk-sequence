
import React, { useState } from 'react';
import paths from '@/data/paths';
import PathViewer from '@/components/PathViewer';

const Index = () => {
  const [selectedPathId, setSelectedPathId] = useState(paths.length > 0 ? paths[0].id : '');

  const handlePathSelect = (pathId: string) => {
    setSelectedPathId(pathId);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Full-screen path viewer */}
      <PathViewer 
        paths={paths} 
        selectedPathId={selectedPathId} 
        onPathChange={handlePathSelect} 
        fullPage={true}
      />
      
      {/* Hovering thumbnails at the bottom */}
      <div className="absolute bottom-10 left-0 right-0 z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x justify-center">
            {paths.map((path) => (
              <div 
                key={path.id}
                className={`flex-shrink-0 cursor-pointer transition-all duration-200 snap-start ${
                  selectedPathId === path.id 
                    ? 'ring-2 ring-wayfinding-blue scale-105 z-20' 
                    : 'opacity-80 hover:opacity-100'
                }`}
                onClick={() => handlePathSelect(path.id)}
              >
                <div className="w-40 relative">
                  <img 
                    src={path.steps[0].image} 
                    alt={path.name}
                    className="w-full h-24 object-cover rounded-md shadow-lg" 
                  />
                  <div className={`absolute inset-0 flex items-end justify-center rounded-md ${
                    selectedPathId === path.id 
                      ? 'bg-blue-500 bg-opacity-20' 
                      : 'bg-black bg-opacity-40'
                  }`}>
                    <p className="text-white text-sm font-medium p-2 text-center w-full truncate">
                      {path.name}
                    </p>
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
