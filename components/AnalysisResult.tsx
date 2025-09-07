import React, { useState, useEffect } from 'react';
import type { AnalysisResult, FileMetadata } from '../types';
import { PlayIcon, StopIcon, SparklesIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon, RobotIcon, AnalysisIcon, MetadataIcon } from '../constants';

interface AnalysisResultProps {
  result: AnalysisResult;
  originalImageUrl: string;
  fileMetadata: FileMetadata | null;
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

const TabButton: React.FC<{ Icon: React.FC<any>, label: string, isActive: boolean, onClick: () => void }> = ({ Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
            isActive
                ? 'border-cyan-400 text-cyan-400 bg-cyan-900/20'
                : 'border-transparent text-gray-400 hover:bg-base-100/50 hover:text-gray-200'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);


const AnalysisResultDisplay: React.FC<AnalysisResultProps> = ({
  result,
  originalImageUrl,
  fileMetadata,
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
  const [activeTab, setActiveTab] = useState<'analysis' | 'ai' | 'metadata'>('analysis');

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
  
  const renderMetadata = () => (
    <div className="p-4 space-y-3 animate-fade-in">
        <h3 className="text-xl font-bold text-gray-200">File Evidence</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
            <div className="bg-base-200/50 p-3 rounded-md">
                <dt className="text-gray-400 text-xs">Filename</dt>
                <dd className="text-cyan-300 truncate">{fileMetadata?.name || 'N/A'}</dd>
            </div>
            <div className="bg-base-200/50 p-3 rounded-md">
                <dt className="text-gray-400 text-xs">Upload Date</dt>
                <dd className="text-cyan-300">{uploadDate || 'N/A'}</dd>
            </div>
            <div className="bg-base-200/50 p-3 rounded-md">
                <dt className="text-gray-400 text-xs">File Size</dt>
                <dd className="text-cyan-300">{fileMetadata ? `${(fileMetadata.size / 1024).toFixed(2)} KB` : 'N/A'}</dd>
            </div>
            <div className="bg-base-200/50 p-3 rounded-md">
                <dt className="text-gray-400 text-xs">Dimensions</dt>
                <dd className="text-cyan-300">{fileMetadata?.dimensions || 'N/A'}</dd>
            </div>
             <div className="sm:col-span-2 bg-base-200/50 p-3 rounded-md">
                <dt className="text-gray-400 text-xs">SHA-256 Hash (Simulated)</dt>
                <dd className="text-cyan-300 break-all">{fileMetadata?.hash || 'N/A'}</dd>
            </div>
        </div>
        <div className="pt-4 mt-4 border-t border-gray-700/50">
            <h3 className="text-xl font-bold text-gray-200 mb-3">Narration Controls</h3>
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
             <div className="flex items-center gap-3 max-w-xs mx-auto mt-4">
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
    </div>
  );
  
  const renderAiAnalysis = () => (
     <div className="p-4 animate-fade-in">
        {result.aiDetection ? (
            <div className={`p-4 rounded-lg border ${result.aiDetection.isAiGenerated ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-green-900/30 border-green-700/50'}`}>
              <h3 className={`text-lg font-semibold ${result.aiDetection.isAiGenerated ? 'text-yellow-300' : 'text-green-300'}`}>
                {result.aiDetection.isAiGenerated ? 'Likely AI-Generated' : 'Likely Not AI-Generated'}
              </h3>
              <p className="text-gray-300 mt-2 whitespace-pre-wrap">{result.aiDetection.reasoning}</p>
            </div>
        ) : <p>No AI Detection analysis available.</p>}
     </div>
  );
  
  const renderTamperingAnalysis = () => (
      <div className="p-4 space-y-4 animate-fade-in">
        <div>
          <div className="p-4 bg-base-200/50 rounded-lg border border-gray-700/50 max-h-48 overflow-y-auto">
            <p className="text-gray-300 whitespace-pre-wrap">{result.analysisText}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-300">Original Image</h3>
                <img src={originalImageUrl} alt="Original" className="rounded-lg shadow-lg w-full h-auto object-contain bg-black/20" />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-300">Generated Tampered Version</h3>
                <div className="relative w-full">
                    <img src={result.tamperedImageUrl} alt="Tampered" className="rounded-lg shadow-lg w-full h-auto object-contain bg-black/20" />
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
                                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.7)'
                                }}
                            >
                              <div 
                                className="absolute top-0 left-0 w-full h-full bg-red-500/0 group-hover:bg-red-500/20 group-hover:scale-105 transition-all duration-200 pointer-events-auto"
                                title={area.description}
                              >
                                  <span className="absolute -top-7 left-0 w-max max-w-xs bg-base-200 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none border border-gray-600">
                                      {area.description}
                                  </span>
                              </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
  );

  return (
    <div className="animate-fade-in w-full flex flex-col h-full">
      <div className="flex border-b border-gray-700/50">
        <TabButton Icon={AnalysisIcon} label="Tampering Analysis" isActive={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
        <TabButton Icon={RobotIcon} label="AI Detection" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        <TabButton Icon={MetadataIcon} label="File Metadata" isActive={activeTab === 'metadata'} onClick={() => setActiveTab('metadata')} />
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeTab === 'analysis' && renderTamperingAnalysis()}
        {activeTab === 'ai' && renderAiAnalysis()}
        {activeTab === 'metadata' && renderMetadata()}
      </div>
      
      <div className="flex-shrink-0 border-t border-gray-700/50 p-4 space-y-4">
         <h3 className="text-sm font-bold uppercase tracking-wider text-center text-gray-400">Next Steps & Tools</h3>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={() => onJumpToTimeline('analysis')}
                className="w-full sm:w-auto text-sm flex items-center justify-center px-4 py-2 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700/80 transition-colors border border-gray-500"
                >
                View 'Analysis' on Timeline
            </button>
            <button
                onClick={() => onFindSimilarCases('tampering')}
                 className="w-full sm:w-auto text-sm flex items-center justify-center px-4 py-2 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700/80 transition-colors border border-gray-500"
                >
                Find Similar Cases
            </button>
             <button
              onClick={onEnhanceImage}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700/80 transition-colors border border-purple-500 disabled:bg-purple-800 disabled:cursor-wait"
              disabled={isEnhancing}
            >
              {isEnhancing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20/20">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enhancing...
                </>
              ) : (
                <><SparklesIcon /> Enhance (Simulated)</>
              )}
            </button>
         </div>
      </div>
    </div>
  );
};

export default AnalysisResultDisplay;