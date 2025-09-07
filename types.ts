export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    description: string;
}

export interface AiDetectionResult {
    isAiGenerated: boolean;
    reasoning: string;
}

export interface AnalysisResult {
  analysisText: string;
  tamperedImageUrl: string;
  manipulatedAreas?: BoundingBox[];
  aiDetection?: AiDetectionResult;
}

export interface FileMetadata {
    name: string;
    size: number;
    dimensions: string;
    hash?: string; // Simulated SHA-256 hash
}

export interface TimelineStep {
    id: string;
    title: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    explanation: string;
    scenario: string;
    tools: string[];
}

export interface Case {
    id: string;
    title: string;
    incidentType: 'Phishing' | 'Malware' | 'Insider Threat' | 'Mobile Device' | 'Data Breach';
    summary: string;
    outcome: string;
    details: string;
    workflow: string[];
    tools: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}