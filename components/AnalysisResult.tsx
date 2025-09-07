import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { PlayIcon, StopIcon, SparklesIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon } from '../constants';

interface AnalysisResultProps {
  result: AnalysisResult;
  originalImageUrl: string;
  narrationState: 'playing' | 'paused' | 'stopped';
  narrationVolume: number;
  isEnhancing: boolean;
  uploadDate: string | null;
  onPlayPauseNarration: () => void;
  onStopNarration: () => void;
  onVolumeChange: (volume: number) => void;
  onEnhanceImage: () => void;
  onJumpToTimeline: (stepId: string) => void;
  onFindSimilarCases: (term: string) => void;
}

const AnalysisResultDisplay: React.FC<AnalysisResultProps> = ({
  result,
  originalImageUrl,
  narrationState,
  narrationVolume,
  isEnhancing,
  uploadDate,
  onPlayPauseNarration,
  onStopNarration,
  onVolumeChange,
  onEnhanceImage,
  onJumpToTimeline,
  onFindSimilarCases,
}) => {
  const [visibleBoxes, setVisibleBoxes] = useState<number[]>([]);

  useEffect(() => {
    setVisibleBoxes([]); // Reset on new result
    if (result.manipulatedAreas && result.manipulatedAreas.length > 0) {
      const timeouts: NodeJS.Timeout[] = [];
      result.manipulatedAreas.forEach((_, index) => {
        const timeout = setTimeout(() => {
          setVisibleBoxes(prev => [...prev, index]);
        }, 500 + (index * 300)); // Initial delay + staggered delay for each box
        timeouts.push(timeout);
      });

      return () => { // Cleanup on unmount or result change
        timeouts.forEach(clearTimeout);
      };
    }
  }, [result.manipulatedAreas]);
  
  const getPlayButtonContent = () => {
      if (narrationState === 'playing') return <><PauseIcon /> Pause</>;
      if (narrationState === 'paused') return <><PlayIcon /> Resume</>;
      return <><PlayIcon /> Play Narration</>;
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-1">Forensic Analysis</h2>
        {uploadDate && (
            <p className="text-xs text-gray-500 mb-3">Analysis performed on: {uploadDate}</p>
        )}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
          <p className="text-gray-300 whitespace-pre-wrap">{result.analysisText}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Original Image</h3>
          <img src={originalImageUrl} alt="Original" className="rounded-lg shadow-lg w-full h-auto object-contain" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Generated Tampered Version</h3>
          <div className="relative w-full">
            <img src={result.tamperedImageUrl} alt="Tampered" className="rounded-lg shadow-lg w-full h-auto object-contain" />
            {result.manipulatedAreas?.map((area, index) => {
                const width = (area.x2 - area.x1) * 100;
                const height = (area.y2 - area.y1) * 100;
                const left = area.x1 * 100;
                const top = area.y1 * 100;
                const isVisible = visibleBoxes.includes(index);
                return (
                    <div
                        key={index}
                        className={`absolute border-2 border-red-500 rounded-sm group pointer-events-none transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                        style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                        }}
                    >
                      <div 
                        className="absolute top-0 left-0 w-full h-full bg-red-500/0 group-hover:bg-red-500/20 group-hover:scale-105 transition-all duration-200 pointer-events-auto"
                        title={area.description}
                      >
                          <span className="absolute -top-7 left-0 w-max max-w-xs bg-gray-900 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                              {area.description}
                          </span>
                      </div>
                    </div>
                );
            })}
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-4 space-y-4">
         <h3 className="text-lg font-semibold text-center text-gray-300">Next Steps</h3>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={() => onJumpToTimeline('analysis')}
                className="w-full sm:w-auto text-sm flex items-center justify-center px-4 py-2 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                View 'Analysis' on Timeline
            </button>
            <button
                onClick={() => onFindSimilarCases('tampering')}
                 className="w-full sm:w-auto text-sm flex items-center justify-center px-4 py-2 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                Find Similar Cases
            </button>
         </div>
      </div>

      <div className="border-t border-gray-700 pt-4 space-y-4">
         <h3 className="text-lg font-semibold text-center text-gray-300">Narration Controls</h3>
         <div className="flex items-center justify-center gap-4">
            <button
                onClick={onPlayPauseNarration}
                className="w-36 flex items-center justify-center px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                {getPlayButtonContent()}
            </button>
            <button
                onClick={onStopNarration}
                disabled={narrationState === 'stopped'}
                className="w-36 flex items-center justify-center px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
                >
                <StopIcon /> Stop
            </button>
         </div>
         <div className="flex items-center gap-3 max-w-xs mx-auto">
            <VolumeOffIcon className="w-5 h-5 text-gray-400" />
            <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={narrationVolume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                aria-label="Narration volume"
            />
            <VolumeUpIcon className="w-5 h-5 text-gray-400" />
         </div>
      </div>


      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-gray-700">
        <button
          onClick={onEnhanceImage}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-wait"
          disabled={isEnhancing}
        >
          {isEnhancing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enhancing...
            </>
          ) : (
            <><SparklesIcon /> Enhance with Fal (Simulated)</>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnalysisResultDisplay;