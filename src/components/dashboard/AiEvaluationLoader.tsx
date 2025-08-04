import React from 'react';

export const AiEvaluationLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
    <div className="relative flex items-center justify-center mb-4">
      <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
      <span className="absolute text-3xl text-blue-500 font-bold animate-pulse">🤖</span>
    </div>
    <div className="text-lg font-semibold text-blue-700 mb-1">AI is evaluating your paper...</div>
    <div className="text-sm text-blue-400">Please wait while we generate your detailed report.</div>
  </div>
);

export default AiEvaluationLoader;
