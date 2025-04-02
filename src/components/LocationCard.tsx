
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Path } from '@/data/paths';
import { Link } from 'react-router-dom';

interface LocationCardProps {
  path: Path;
}

const LocationCard: React.FC<LocationCardProps> = ({ path }) => {
  return (
    <Link to={`/path/${path.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle>{path.name}</CardTitle>
          <CardDescription>{path.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-48 overflow-hidden rounded-md">
            <img 
              src={path.steps[0].image} 
              alt={path.name} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{path.steps.length} steps</span>
            <span className="text-sm font-medium text-wayfinding-blue">View Path</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default LocationCard;
