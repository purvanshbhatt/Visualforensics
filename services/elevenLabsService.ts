export const narrateText = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error("Browser does not support Speech Synthesis."));
            return;
        }

        // Cancel any previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        
        utterance.onend = () => {
            resolve();
        };

        utterance.onerror = (event) => {
            reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        window.speechSynthesis.speak(utterance);
    });
};

export const stopNarration = () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};
