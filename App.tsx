import React, { useState, useCallback, useEffect } from 'react';
import type { AnalysisResult, ChatMessage, FileMetadata } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResultDisplay from './components/AnalysisResult';
import Loader from './components/Loader';
import ExampleImages from './components/ExampleImages';
import ForensicsHub from './components/ForensicsHub';
import ChatTutor from './components/ChatTutor';
import { analyzeImageForTampering, generateTamperedImage, sendMessageToTutor } from './services/geminiService';
import { narrateText, stopNarration, pauseNarration, resumeNarration, setNarrationVolume } from './services/elevenLabsService';
import { enhanceImage } from './services/falService';
import { saveAnalysisResult, loadAnalysisResult, clearAnalysisResult } from './services/storageService';
import { TrashIcon } from './constants';

const exampleImages = [
    { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80', alt: 'Misty mountain landscape' },
    { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', alt: 'Portrait of a man' },
    { src: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&q=80', alt: 'Desktop scene with laptop' },
];

// Helper to generate a fake hash for visual purposes
const createFakeHash = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const App: React.FC = () => {
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
    const [prompt, setPrompt] = useState<string>("Perform forensic triage. Focus on cloning, splicing, and compression artifacts.");
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [uploadDate, setUploadDate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
    
    // Narration State
    const [narrationState, setNarrationState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
    const [narrationVolume, setNarrationVolume] = useState<number>(1);

    // State for integration with ForensicsHub
    const [jumpToTimeline, setJumpToTimeline] = useState<string | null>(null);
    const [findCaseTerm, setFindCaseTerm] = useState<string | null>(null);

    // Chat Tutor State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hello! I'm the Visual Forensics Tutor. Ask me about a forensic concept, a case study, or how to perform an investigation." }
    ]);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

    useEffect(() => {
        const storedData = loadAnalysisResult();
        if (storedData) {
            setAnalysisResult(storedData.analysisResult);
            setOriginalImageUrl(storedData.originalImageUrl);
            setUploadDate(storedData.uploadDate);
            // We can't restore the file object, but we can restore metadata if saved
            if (storedData.fileMetadata) {
                setFileMetadata(storedData.fileMetadata);
            }
        }
    }, []);

    const handleImageUpload = useCallback((file: File) => {
        setOriginalImageFile(file);
        setAnalysisResult(null);
        setError(null);
        setUploadDate(null);
        setFileMetadata(null);
        clearAnalysisResult(); // Clear previous saved result on new upload
        const reader = new FileReader();
        reader.onloadend = () => {
            const resultUrl = reader.result as string;
            setOriginalImageUrl(resultUrl);
            const img = new Image();
            img.onload = async () => {
                const hash = await createFakeHash(resultUrl.split(',')[1]);
                setFileMetadata({
                    name: file.name,
                    size: file.size,
                    dimensions: `${img.naturalWidth} x ${img.naturalHeight}px`,
                    hash: hash,
                });
            };
            img.src = resultUrl;
        };
        reader.readAsDataURL(file);
    }, []);

    const handleExampleImageSelect = useCallback(async (imageUrl: string) => {
        setError(null);
        setAnalysisResult(null);
        setUploadDate(null);
        clearAnalysisResult();
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            const blob = await response.blob();
            const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1).split('?')[0] || 'example.jpg';
            const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
            handleImageUpload(file);
        } catch (e) {
            console.error("Failed to fetch example image:", e);
            setError("Could not load the example image due to browser security (CORS) or network issues. Please upload an image manually.");
        }
    }, [handleImageUpload]);


    const handleAnalyze = async () => {
        if (!originalImageFile) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        stopNarration();
        setNarrationState('stopped');

        try {
            const [analysisData, tamperedImageUrl] = await Promise.all([
                analyzeImageForTampering(originalImageFile, prompt),
                generateTamperedImage(originalImageFile)
            ]);
            
            const result = { ...analysisData, tamperedImageUrl };
            setAnalysisResult(result);

            if (originalImageUrl) {
                const storedData = { analysisResult: result, originalImageUrl, fileMetadata };
                saveAnalysisResult(storedData);
                const loadedData = loadAnalysisResult(); // a bit inefficient but ensures we have the date
                if(loadedData) setUploadDate(loadedData.uploadDate);
            }
            
            try {
                setNarrationState('playing');
                await narrateText(result.analysisText, narrationVolume);
            } catch (err) {
                console.error("Narration failed on startup", err);
            } finally {
                setNarrationState('stopped');
            }

        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
            setError(`Analysis Failed: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePlayPauseNarration = useCallback(async () => {
        if (!analysisResult?.analysisText) return;

        if (narrationState === 'playing') {
            pauseNarration();
            setNarrationState('paused');
        } else if (narrationState === 'paused') {
            resumeNarration();
            setNarrationState('playing');
        } else { // 'stopped'
            try {
                setNarrationState('playing');
                await narrateText(analysisResult.analysisText, narrationVolume);
            } catch (e) {
                console.error("Narration failed", e);
            } finally {
                setNarrationState('stopped');
            }
        }
    }, [analysisResult, narrationState, narrationVolume]);

    const handleStopNarration = useCallback(() => {
        stopNarration();
        setNarrationState('stopped');
    }, []);

    const handleVolumeChange = useCallback((volume: number) => {
        setNarrationVolume(volume);
        setNarrationVolume(volume);
    }, []);

    const handleEnhance = useCallback(async () => {
        if (!analysisResult?.tamperedImageUrl) return;

        setIsEnhancing(true);
        try {
            const enhancedUrl = await enhanceImage(analysisResult.tamperedImageUrl);
            setAnalysisResult(prev => prev ? { ...prev, tamperedImageUrl: enhancedUrl } : null);
        } catch(err) {
            console.error("Enhancement failed", err);
            setError("Image enhancement failed.");
        } finally {
            setIsEnhancing(false);
        }
    }, [analysisResult]);
    
    const handleReset = useCallback(() => {
        setOriginalImageFile(null);
        setOriginalImageUrl(null);
        setFileMetadata(null);
        setAnalysisResult(null);
        setError(null);
        setUploadDate(null);
        setIsLoading(false);
        setNarrationState('stopped');
        setIsEnhancing(false);
        stopNarration();
        clearAnalysisResult();
    }, []);
    
    const handleJumpToTimeline = useCallback((stepId: string) => {
        setJumpToTimeline(stepId);
        setTimeout(() => setJumpToTimeline(null), 500); // Reset after a moment
    }, []);
    
    const handleFindSimilarCases = useCallback((term: string) => {
        setFindCaseTerm(term);
        setTimeout(() => setFindCaseTerm(null), 500); // Reset after a moment
    }, []);

    const handleSendChatMessage = async (message: string) => {
        const newUserMessage: ChatMessage = { role: 'user', content: message };
        setChatMessages(prev => [...prev, newUserMessage]);
        setIsChatLoading(true);

        try {
            const responseContent = await sendMessageToTutor(message);
            const newModelMessage: ChatMessage = { role: 'model', content: responseContent };
            setChatMessages(prev => [...prev, newModelMessage]);
        } catch (err) {
            console.error("Chat error:", err);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Column */}
                    <div className="lg:col-span-1 bg-base-100/80 p-6 rounded-lg border border-gray-700/50 shadow-2xl backdrop-blur-sm space-y-6 self-start">
                        <div>
                           <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-400/20 pb-2 mb-4">1. Upload Evidence</h2>
                           <ImageUploader onImageUpload={handleImageUpload} imageUrl={originalImageUrl} />
                        </div>
                        
                        <ExampleImages images={exampleImages} onSelect={handleExampleImageSelect} disabled={isLoading} />
                         <div>
                           <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-400/20 pb-2 mb-4">2. Analysis Parameters</h2>
                           <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full p-2 bg-base-200 text-gray-300 border border-gray-600/80 rounded-md focus:ring-2 focus:ring-cyan-500/50 focus:outline-none transition-shadow"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-gray-700/50">
                            <button
                                onClick={handleAnalyze}
                                disabled={!originalImageFile || isLoading}
                                className="sm:col-span-4 w-full bg-cyan-500/80 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-all border border-cyan-400/50 shadow-md hover:shadow-cyan-400/20 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:border-gray-600"
                            >
                                {isLoading ? 'Executing...' : 'Execute Triage'}
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={isLoading || (!originalImageFile && !analysisResult)}
                                title="Clear image and analysis"
                                aria-label="Clear image and analysis"
                                className="sm:col-span-1 w-full flex justify-center items-center bg-gray-700/80 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all border border-gray-600/50 shadow-md hover:shadow-gray-500/20 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:shadow-none disabled:text-gray-500"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-2 bg-base-100/80 p-1 rounded-lg border border-gray-700/50 shadow-2xl backdrop-blur-sm min-h-[500px] flex flex-col items-center justify-center">
                        {isLoading ? (
                            <Loader message="Executing Forensic Triage..." />
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg border border-red-700/50">
                                <h3 className="font-bold text-lg">Error</h3>
                                <p>{error}</p>
                            </div>
                        ) : analysisResult && originalImageUrl ? (
                            <AnalysisResultDisplay
                                result={analysisResult}
                                originalImageUrl={originalImageUrl}
                                fileMetadata={fileMetadata}
                                narrationState={narrationState}
                                narrationVolume={narrationVolume}
                                isEnhancing={isEnhancing}
                                uploadDate={uploadDate}
                                onPlayPauseNarration={handlePlayPauseNarration}
                                onStopNarration={handleStopNarration}
                                onVolumeChange={handleVolumeChange}
                                onEnhanceImage={handleEnhance}
                                onJumpToTimeline={handleJumpToTimeline}
                                onFindSimilarCases={handleFindSimilarCases}
                             />
                        ) : (
                            <div className="text-center text-gray-500">
                                <h2 className="text-2xl font-semibold">Awaiting Evidence</h2>
                                <p className="mt-2">Upload an image or select a case file to begin triage.</p>
                            </div>

                        )}
                    </div>
                </div>

                {/* Forensics Hub Section */}
                <div className="mt-12">
                   <ForensicsHub jumpToTimeline={jumpToTimeline} findCaseTerm={findCaseTerm} />
                </div>
            </main>
            <ChatTutor 
                messages={chatMessages}
                isLoading={isChatLoading}
                onSendMessage={handleSendChatMessage}
            />
        </div>
    );
};

export default App;