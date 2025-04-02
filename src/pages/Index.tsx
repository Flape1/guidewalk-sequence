
import React from 'react';
import Navigator from '@/components/Navigator';
import paths from '@/data/paths';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-wayfinding-dark text-white py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-bold">GuidePath</h1>
          <p className="text-gray-300">Your visual guide to complex buildings</p>
        </div>
      </header>
      
      <main className="py-8">
        <Navigator paths={paths} />
      </main>
      
      <footer className="bg-wayfinding-dark text-gray-300 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
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
