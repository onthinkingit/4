
import React from 'react';

export const LudoBoard: React.FC<{ playersCount: 2 | 4 }> = ({ playersCount }) => {
  const renderHome = (colorClass: string, label: string) => (
    <div className={`${colorClass} rounded-lg border-2 border-white/20 p-2 flex flex-col items-center justify-center relative`}>
      <div className="bg-white w-2/3 h-2/3 rounded-md flex flex-wrap gap-1 p-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`${colorClass} w-5 h-5 rounded-full shadow-inner border border-white/40`}></div>
        ))}
      </div>
      <span className="text-[10px] text-white font-bold mt-1 uppercase opacity-70">{label}</span>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto aspect-square bg-white shadow-2xl rounded-xl overflow-hidden border-4 border-white">
      <div className="grid grid-cols-15 grid-rows-15 h-full w-full">
        {/* Top Left - Red Home */}
        <div className="col-span-6 row-span-6">
          {renderHome('bg-red-500', 'Player 1')}
        </div>
        
        {/* Top Middle - Path */}
        <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border border-gray-100">
           {Array.from({length: 18}).map((_, i) => (
             <div key={i} className={`border border-gray-50 ${i % 3 === 1 && i > 0 ? 'bg-yellow-500' : 'bg-gray-100'}`}></div>
           ))}
        </div>

        {/* Top Right - Green Home */}
        <div className="col-span-6 row-span-6">
          {renderHome('bg-green-500', 'Player 2')}
        </div>

        {/* Center Path Row */}
        <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border border-gray-100">
           {Array.from({length: 18}).map((_, i) => (
             <div key={i} className={`border border-gray-50 ${Math.floor(i / 6) === 1 && i % 6 > 0 ? 'bg-red-500' : 'bg-gray-100'}`}></div>
           ))}
        </div>
        <div className="col-span-3 row-span-3 bg-gradient-to-br from-red-400 via-blue-400 to-green-400 flex items-center justify-center">
            <span className="text-white font-bold text-xs">FINISH</span>
        </div>
        <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border border-gray-100">
           {Array.from({length: 18}).map((_, i) => (
             <div key={i} className={`border border-gray-50 ${Math.floor(i / 6) === 1 && i % 6 < 5 ? 'bg-blue-500' : 'bg-gray-100'}`}></div>
           ))}
        </div>

        {/* Bottom Left - Yellow Home */}
        <div className="col-span-6 row-span-6">
          {renderHome('bg-yellow-500', 'Player 4')}
        </div>

        {/* Bottom Middle - Path */}
        <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border border-gray-100">
           {Array.from({length: 18}).map((_, i) => (
             <div key={i} className={`border border-gray-50 ${i % 3 === 1 && i < 15 ? 'bg-green-500' : 'bg-gray-100'}`}></div>
           ))}
        </div>

        {/* Bottom Right - Blue Home */}
        <div className="col-span-6 row-span-6">
          {renderHome('bg-blue-500', 'Player 3')}
        </div>
      </div>
    </div>
  );
};
