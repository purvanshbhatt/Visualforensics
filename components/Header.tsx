import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6 border-b border-gray-700">
      <h1 className="text-3xl md:text-4xl font-bold text-cyan-400">
        Visual Forensics Tutor
      </h1>
      <p className="text-md text-gray-400 mt-2">
        Learn to spot tampered images with the power of AI analysis.
      </p>
    </header>
  );
};

export default Header;
