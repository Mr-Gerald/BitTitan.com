
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-basetitan-light border border-basetitan-border rounded-lg shadow-md p-4 md:p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </div>
  );
};

export default Card;
