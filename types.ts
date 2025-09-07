export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    description: string;
}

export interface AnalysisResult {
  analysisText: string;
  tamperedImageUrl: string;
  manipulatedAreas?: BoundingBox[];
}