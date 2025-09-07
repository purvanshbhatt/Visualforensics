import type { AnalysisResult, FileMetadata } from '../types';

const STORAGE_KEY = 'visualForensicsTutor_lastAnalysis';

interface StoredData {
    analysisResult: AnalysisResult;
    originalImageUrl: string;
    uploadDate: string;
    fileMetadata: FileMetadata | null;
}

export const saveAnalysisResult = (data: Omit<StoredData, 'uploadDate'>): void => {
    try {
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const dataToStore: StoredData = {
            ...data,
            uploadDate: formattedDate,
        };
        const dataString = JSON.stringify(dataToStore);
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