import React, { useState, useMemo, useEffect, useRef } from 'react';
import { timelineSteps, cases } from '../data/forensicsData';
import type { Case } from '../types';
import CaseModal from './CaseModal';
import { ChevronDownIcon, SearchIcon } from '../constants';

interface ForensicsHubProps {
    jumpToTimeline: string | null;
    findCaseTerm: string | null;
}

const ForensicsHub: React.FC<ForensicsHubProps> = ({ jumpToTimeline, findCaseTerm }) => {
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);
    const caseLibraryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (jumpToTimeline) {
            setExpandedStep(jumpToTimeline);
            const index = timelineSteps.findIndex(s => s.id === jumpToTimeline);
            if (timelineRefs.current[index]) {
                timelineRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [jumpToTimeline]);
    
    useEffect(() => {
        if (findCaseTerm) {
            setSearchTerm('tampering'); // a broad term to match multiple cases
            setFilterType('All');
            caseLibraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [findCaseTerm]);

    const incidentTypes = useMemo(() => ['All', ...new Set(cases.map(c => c.incidentType))], []);

    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const matchesType = filterType === 'All' || c.incidentType === filterType;
            const matchesSearch = searchTerm.trim() === '' || 
                                  c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  c.tools.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [searchTerm, filterType]);

    return (
        <div className="space-y-12">
            {/* Timeline Section */}
            <div id="timeline">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-200 font-mono">Digital Forensics Workflow</h2>
                <div className="relative max-w-2xl mx-auto border-l-2 border-cyan-600/30 pl-8 space-y-8">
                    {timelineSteps.map((step, index) => (
                        // FIX: The ref callback function should not return a value. Wrapping the assignment in curly braces makes it a statement and returns undefined.
                        <div key={step.id} ref={el => { timelineRefs.current[index] = el; }} className="relative">
                            <div className="absolute -left-[44px] top-2 h-7 w-7 bg-base-200 border-2 border-cyan-500 rounded-md transform rotate-45"></div>
                            <button
                                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                                className="w-full text-left flex justify-between items-center p-4 bg-base-100/80 rounded-lg hover:bg-base-100 border border-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <step.Icon className="w-8 h-8 text-cyan-400" />
                                    <h3 className="text-xl font-semibold text-gray-200">{step.title}</h3>
                                </div>
                                <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform ${expandedStep === step.id ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedStep === step.id && (
                                <div className="mt-2 p-4 bg-base-100/70 border-l-2 border-cyan-600 rounded-r-lg space-y-3 animate-fade-in-down">
                                    <p className="text-gray-300">{step.explanation}</p>
                                    <div className="p-3 bg-base-200/50 rounded">
                                        <p><strong className="text-cyan-300">Scenario:</strong> <span className="text-gray-400">{step.scenario}</span></p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {step.tools.map(tool => <span key={tool} className="text-xs font-mono bg-gray-700 text-cyan-300 px-2 py-1 rounded">{tool}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Case Library Section */}
            <div id="case-library" ref={caseLibraryRef}>
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-200 font-mono">Case Library</h2>
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-100/80 rounded-lg border border-gray-700/50">
                        <div className="md:col-span-2 relative">
                            <input
                                type="text"
                                placeholder="Search cases by title, summary, or tool..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-10 bg-base-200 text-gray-300 border border-gray-600/80 rounded-md focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="w-full p-2 bg-base-200 text-gray-300 border border-gray-600/80 rounded-md focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
                        >
                            {incidentTypes.map(type => <option key={type} value={type} className="bg-base-200">Type: {type}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCases.map(c => (
                            <div key={c.id} onClick={() => setSelectedCase(c)} className="bg-base-100 p-4 rounded-lg border border-gray-700/50 hover:border-cyan-400/70 cursor-pointer transition-all space-y-2 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                <h4 className="font-bold text-lg text-cyan-300">{c.title}</h4>
                                <span className="text-xs font-semibold text-white bg-cyan-600/50 px-2 py-1 rounded">{c.incidentType}</span>
                                <p className="text-sm text-gray-400 line-clamp-3">{c.summary}</p>
                            </div>
                        ))}
                         {filteredCases.length === 0 && <p className="text-gray-500 md:col-span-3 text-center">No cases found matching your criteria.</p>}
                    </div>
                </div>
            </div>
            
            {selectedCase && <CaseModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />}
        </div>
    );
};

export default ForensicsHub;