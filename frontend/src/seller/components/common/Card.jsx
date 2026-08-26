import React from 'react';

export const Card = ({
  children,
  className = '',
  style = {},
  onClick,
  hoverable = true,
  ...props
}) => {
  return (
    <div
      className={`card apple-card ${hoverable ? 'hoverable' : ''} ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
