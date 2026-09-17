import React, { type ButtonHTMLAttributes } from 'react';
import { soundManager } from '../../utils/audio';
import './Button.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'purple' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  sound?: 'pop' | 'tap' | 'none';
  bounce?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  sound = 'pop',
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (sound === 'pop') {
      soundManager.playPop();
    } else if (sound === 'tap') {
      soundManager.playLetterTap();
    }
    onClick?.(e);
  };

  const variantClass = {
    primary: 'btn-blue',
    secondary: 'btn-white',
    success: 'btn-green',
    warning: 'btn-yellow',
    purple: 'btn-purple',
    ghost: 'btn-ghost',
    icon: 'btn-white'
  }[variant];

  return (
    <button
      className={`btn-fun size-${size} ${variantClass} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

