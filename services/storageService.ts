import type { AnalysisResult } from '../types';

const STORAGE_KEY = 'visualForensicsTutor_lastAnalysis';

interface StoredData {
    analysisResult: AnalysisResult;
    originalImageUrl: string;
}

export const saveAnalysisResult = (data: StoredData): void => {
    try {
        const dataString = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, dataString);
    } catch (error) {
        console.error("Failed to save analysis result to localStorage:", error);
    }
};

export const loadAnalysisResult = (): StoredData | null => {
    try {
        const dataString = localStorage.getItem(STORAGE_KEY);
        if (dataString) {
            return JSON.parse(dataString) as StoredData;
        }
        return null;
    } catch (error) {
        console.error("Failed to load analysis result from localStorage:", error);
        return null;
    }
};

export const clearAnalysisResult = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Failed to clear analysis result from localStorage:", error);
    }
};
