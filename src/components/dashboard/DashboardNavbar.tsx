import React from 'react';

interface DashboardNavbarProps {
  activeTab: 'slides' | 'reassessment';
  onTabChange: (tab: 'slides' | 'reassessment') => void;
}

const tabStyles = (active: boolean) =>
  `px-6 py-2 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none ${
    active
      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg scale-105'
      : 'bg-white/70 text-blue-700 hover:bg-blue-100 hover:scale-105'
  }`;

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ activeTab, onTabChange }) => (
  <nav className="flex justify-center gap-6 my-8">
    <button
      className={tabStyles(activeTab === 'slides')}
      onClick={() => onTabChange('slides')}
      aria-current={activeTab === 'slides' ? 'page' : undefined}
    >
      Upload Slide
    </button>
    <button
      className={tabStyles(activeTab === 'reassessment')}
      onClick={() => onTabChange('reassessment')}
      aria-current={activeTab === 'reassessment' ? 'page' : undefined}
    >
      Upload Paper for Checking
    </button>
  </nav>
);

export default DashboardNavbar;
