
import React, { useState } from 'react';
import paths from '@/data/paths';
import PathViewer from '@/components/PathViewer';
import LocationCard from '@/components/LocationCard';

const Index = () => {
  const [selectedPathId, setSelectedPathId] = useState(paths.length > 0 ? paths[0].id : '');

  const handlePathSelect = (pathId: string) => {
    setSelectedPathId(pathId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-wayfinding-dark text-white py-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-bold">GuidePath</h1>
          <p className="text-gray-300">Your visual guide to complex buildings</p>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {/* Full-screen path viewer */}
        <div className="flex-1">
          <PathViewer 
            paths={paths} 
            selectedPathId={selectedPathId} 
            onPathChange={handlePathSelect} 
            fullPage={true}
          />
        </div>
        
        {/* Bottom thumbnails */}
        <div className="bg-wayfinding-dark py-4 px-2">
          <div className="container mx-auto max-w-6xl">
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              {paths.map((path) => (
                <div 
                  key={path.id}
                  className={`flex-shrink-0 cursor-pointer transition-all duration-200 snap-start ${
                    selectedPathId === path.id 
                      ? 'ring-2 ring-wayfinding-blue scale-105 z-10' 
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  onClick={() => handlePathSelect(path.id)}
                >
                  <div className="w-40 relative">
                    <img 
                      src={path.steps[0].image} 
                      alt={path.name}
                      className="w-full h-24 object-cover rounded-md" 
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
      </main>
      
      <footer className="bg-wayfinding-dark text-gray-300 py-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-2 md:mb-0">
              <p className="text-sm">© {new Date().getFullYear()} GuidePath. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sm hover:text-white transition-colors">About</a>
              <a href="#" className="text-sm hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-sm hover:text-white transition-colors">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
