
import React from 'react';

interface IconProps {
  children: React.ReactNode;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ children, className = 'w-6 h-6' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {children}
    </svg>
  );
};

export default Icon;
