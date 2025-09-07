let currentUtterance: SpeechSynthesisUtterance | null = null;

export const narrateText = (text: string, volume: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error("Browser does not support Speech Synthesis."));
            return;
        }

        // Cancel any previous speech to start fresh
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        currentUtterance = utterance; // Store reference to the current utterance

        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.volume = volume; // Set volume (0 to 1)
        
        utterance.onend = () => {
            currentUtterance = null; // Clear reference on end
            resolve();
        };

        utterance.onerror = (event) => {
            currentUtterance = null; // Clear reference on error
            reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        window.speechSynthesis.speak(utterance);
    });
};

export const pauseNarration = (): void => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
    }
};

export const resumeNarration = (): void => {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
};

export const stopNarration = (): void => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
    }
};

export const setNarrationVolume = (volume: number): void => {
    if (currentUtterance) {
        // Clamp volume between 0 and 1
        currentUtterance.volume = Math.max(0, Math.min(1, volume));
    }
};