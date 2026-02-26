import React, { useState } from 'react';
import { getVersionInfo, getVersionShort } from '../utils/version';

interface VersionDisplayProps {
  variant?: 'short' | 'full';
  className?: string;
}

const VersionDisplay: React.FC<VersionDisplayProps> = ({ variant = 'short', className = '' }) => {
  const [showFull, setShowFull] = useState(false);

  if (variant === 'full') {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        {getVersionInfo()}
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setShowFull(true)}
      onMouseLeave={() => setShowFull(false)}
    >
      <span className="text-xs text-gray-500 cursor-default">{getVersionShort()}</span>
      {showFull && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-50">
          {getVersionInfo()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionDisplay;
