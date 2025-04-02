
import React, { useState } from 'react';
import LocationCard from '@/components/LocationCard';
import PathViewer from '@/components/PathViewer';
import { Path } from '@/data/paths';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NavigatorProps {
  paths: Path[];
}

const Navigator: React.FC<NavigatorProps> = ({ paths }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'viewer'>('cards');
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Interactive Wayfinder</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Find your way through buildings with our step-by-step visual guides
        </p>
      </div>
      
      <Tabs defaultValue="cards" className="mb-8">
        <TabsList>
          <TabsTrigger value="cards" onClick={() => setViewMode('cards')}>Location Cards</TabsTrigger>
          <TabsTrigger value="viewer" onClick={() => setViewMode('viewer')}>Interactive Viewer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => (
              <LocationCard key={path.id} path={path} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="viewer" className="mt-6">
          <PathViewer paths={paths} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Navigator;
