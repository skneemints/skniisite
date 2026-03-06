import React, { useEffect, useState } from 'react';

export const BSOD: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onRestart, 2000);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15);
      });
    }, 400);
    return () => clearInterval(interval);
  }, [onRestart]);

  return (
    <div className="fixed inset-0 bg-[#0000aa] text-white font-mono p-10 z-[10000] flex flex-col gap-8 select-none overflow-hidden cursor-none">
      <div className="text-8xl mb-4">:(</div>
      
      <div className="text-2xl max-w-2xl leading-relaxed">
        Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.
      </div>

      <div className="text-4xl font-bold">
        {Math.min(100, percent)}% complete
      </div>

      <div className="mt-auto flex gap-6 items-start">
        <div className="w-24 h-24 bg-white flex items-center justify-center">
          <div className="w-20 h-20 bg-[#0000aa] border-4 border-white" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm">For more information about this issue and possible fixes, visit https://sknii.io/stopcode</p>
          <p className="text-xs opacity-80 mt-2">If you call a support person, give them this info:</p>
          <p className="text-xs opacity-80 font-bold">Stop code: KERNEL_DATA_INPAGE_ERROR (skniitty.sys)</p>
        </div>
      </div>
    </div>
  );
};
