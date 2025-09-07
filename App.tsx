import React, { useState, useCallback, useEffect } from 'react';
import type { AnalysisResult } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResultDisplay from './components/AnalysisResult';
import Loader from './components/Loader';
import ExampleImages from './components/ExampleImages';
import { analyzeImageForTampering, generateTamperedImage } from './services/geminiService';
import { narrateText, stopNarration } from './services/elevenLabsService';
import { enhanceImage } from './services/falService';
import { saveAnalysisResult, loadAnalysisResult, clearAnalysisResult } from './services/storageService';
import { TrashIcon } from './constants';

const exampleImages = [
    { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80', alt: 'Misty mountain landscape' },
    { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', alt: 'Portrait of a man' },
    { src: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&q=80', alt: 'Desktop scene with laptop' },
];

const App: React.FC = () => {
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>("Analyze this image for tampering");
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isNarrating, setIsNarrating] = useState<boolean>(false);
    const [isEnhancing, setIsEnhancing] = useState<boolean>(false);

    useEffect(() => {
        const storedData = loadAnalysisResult();
        if (storedData) {
            setAnalysisResult(storedData.analysisResult);
            setOriginalImageUrl(storedData.originalImageUrl);
            // Re-creating a File object from a data URL is complex and not always needed.
            // For this app, we'll allow viewing the old result but re-analysis requires a fresh upload.
        }
    }, []);

    const handleImageUpload = useCallback((file: File) => {
        setOriginalImageFile(file);
        setAnalysisResult(null);
        setError(null);
        clearAnalysisResult(); // Clear previous saved result on new upload
        const reader = new FileReader();
        reader.onloadend = () => {
            setOriginalImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleExampleImageSelect = useCallback(async (imageUrl: string) => {
        setError(null);
        setAnalysisResult(null);
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

        try {
            const [analysisData, tamperedImageUrl] = await Promise.all([
                analyzeImageForTampering(originalImageFile, prompt),
                generateTamperedImage(originalImageFile)
            ]);
            
            const result = { ...analysisData, tamperedImageUrl };
            setAnalysisResult(result);

            if (originalImageUrl) {
                saveAnalysisResult({ analysisResult: result, originalImageUrl });
            }

            setIsNarrating(true);
            await narrateText(result.analysisText);
            setIsNarrating(false);

        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
            setError(`Analysis Failed: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReplayNarration = useCallback(async () => {
        if (analysisResult?.analysisText) {
            if (isNarrating) {
                stopNarration();
                setIsNarrating(false);
            } else {
                setIsNarrating(true);
                try {
                    await narrateText(analysisResult.analysisText);
                } catch(e) {
                    console.error("Narration failed", e);
                } finally {
                    setIsNarrating(false);
                }
            }
        }
    }, [analysisResult, isNarrating]);

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
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
        setIsNarrating(false);
        setIsEnhancing(false);
        stopNarration();
        clearAnalysisResult();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Column */}
                    <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-xl space-y-6 self-start">
                        <div>
                           <h2 className="text-xl font-semibold mb-2 text-cyan-300">1. Upload Image</h2>
                           <ImageUploader onImageUpload={handleImageUpload} imageUrl={originalImageUrl} />
                        </div>
                        <div className="my-4 border-t border-gray-600"></div>
                        <ExampleImages images={exampleImages} onSelect={handleExampleImageSelect} disabled={isLoading} />
                         <div>
                           <h2 className="text-xl font-semibold mb-2 text-cyan-300">2. Analysis Prompt</h2>
                           <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                            <button
                                onClick={handleAnalyze}
                                disabled={!originalImageFile || isLoading}
                                className="sm:col-span-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                                {isLoading ? 'Analyzing...' : 'Analyze Image'}
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={isLoading || (!originalImageFile && !analysisResult)}
                                title="Clear image and analysis"
                                aria-label="Clear image and analysis"
                                className="sm:col-span-1 w-full flex justify-center items-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-lg border border-gray-700 min-h-[300px] flex items-center justify-center">
                        {isLoading ? (
                            <Loader message="Running Forensic Analysis..." />
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg">Error</h3>
                                <p>{error}</p>
                            </div>
                        ) : analysisResult && originalImageUrl ? (
                            <AnalysisResultDisplay
                                result={analysisResult}
                                originalImageUrl={originalImageUrl}
                                isNarrating={isNarrating}
                                isEnhancing={isEnhancing}
                                onReplayNarration={handleReplayNarration}
                                onEnhanceImage={handleEnhance}
                             />
                        ) : (
                            <div className="text-center text-gray-400">
                                <h2 className="text-2xl font-semibold">Ready for Analysis</h2>
                                <p className="mt-2">Upload an image or select an example to begin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;