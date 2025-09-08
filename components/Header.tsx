import React from 'react';
import { ForensicIcon } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6 border-b border-cyan-400/20">
      <div className="flex items-center justify-center gap-4">
        <ForensicIcon className="w-10 h-10 text-cyan-400" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 font-mono tracking-wider">
            Forensic Triage Tool
          </h1>
          <p className="text-md text-gray-400 mt-1">
            Rapid, AI-driven analysis for suspected image manipulation.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;