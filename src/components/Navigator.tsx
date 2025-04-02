
import React from 'react';
import LocationCard from '@/components/LocationCard';
import { Path } from '@/data/paths';

interface NavigatorProps {
  paths: Path[];
}

const Navigator: React.FC<NavigatorProps> = ({ paths }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Interactive Wayfinder</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Find your way through buildings with our step-by-step visual guides
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => (
          <LocationCard key={path.id} path={path} />
        ))}
      </div>
    </div>
  );
};

export default Navigator;
