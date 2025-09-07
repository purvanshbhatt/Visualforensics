import React from 'react';
import type { Case } from '../types';

interface CaseModalProps {
  caseData: Case;
  onClose: () => void;
}

const CaseModal: React.FC<CaseModalProps> = ({ caseData, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-base-100 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-cyan-400/20 p-6 space-y-4"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-cyan-400">{caseData.title}</h2>
                <span className="text-sm font-semibold text-white bg-cyan-600/50 px-2 py-1 rounded">{caseData.incidentType}</span>
            </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close case details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
            <h3 className="font-semibold text-lg text-gray-300 border-b border-gray-600/50 pb-1 mb-2">Summary</h3>
            <p className="text-gray-400">{caseData.summary}</p>
        </div>
        <div>
            <h3 className="font-semibold text-lg text-gray-300 border-b border-gray-600/50 pb-1 mb-2">Outcome</h3>
            <p className="text-gray-400">{caseData.outcome}</p>
        </div>
        <div>
            <h3 className="font-semibold text-lg text-gray-300 border-b border-gray-600/50 pb-1 mb-2">Details</h3>
            <p className="text-gray-400">{caseData.details}</p>
        </div>

        <div>
            <h3 className="font-semibold text-lg text-gray-300 border-b border-gray-600/50 pb-1 mb-2">Forensic Workflow</h3>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
                {caseData.workflow.map(step => <li key={step}>{step}</li>)}
            </ul>
        </div>
        <div>
            <h3 className="font-semibold text-lg text-gray-300 border-b border-gray-600/50 pb-1 mb-2">Tools Used</h3>
            <div className="flex flex-wrap gap-2">
                {caseData.tools.map(tool => (
                    <span key={tool} className="text-xs font-mono bg-gray-700 text-cyan-300 px-2 py-1 rounded">{tool}</span>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default CaseModal;