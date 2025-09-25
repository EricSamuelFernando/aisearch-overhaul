import React, { useState, useRef, useEffect } from 'react';

interface FloatingPosition {
  top: number;
  left: number;
}

interface TransitionProps {
  duration: number;
  transition: string;
}

type TooltipProps = {
  arrowOffset?: number;
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right';
  arrowRadius?: number;
  arrowSize?: number;
  children: React.ReactNode;
  closeDelay?: number;
  color?: string;
  disabled?: boolean;
  events?: { hover?: boolean; focus?: boolean; touch?: boolean };
  floatingStrategy?: 'absolute';
  inline?: boolean;
  keepMounted?: boolean;
  label: React.ReactNode;
  multiline?: boolean;
  offset?: number;
  onPositionChange?: (position: FloatingPosition) => void;
  openDelay?: number;
  opened?: boolean;
  position?: FloatingPosition;
  positionDependencies?: any[];
  radius?: string;
  refProp?: string;
  transitionProps?: TransitionProps;
  withArrow?: boolean;
  withinPortal?: boolean;
  zIndex?: string | number;
};

const CustomTooltip: React.FC<TooltipProps> = ({
  arrowPosition = 'top',
  arrowSize = 4,
  children,
  closeDelay = 0,
  color = 'gray',
  disabled = false,
  events = { hover: true, focus: false, touch: false },
  inline = false,
  label,
  offset = 5,
  onPositionChange,
  openDelay = 0,
  opened: controlledOpened,
  position,
  radius = 'default',
  transitionProps = { duration: 100, transition: 'fade' },
  zIndex = 300,
}) => {
  const [opened, setOpened] = useState<boolean>(false);
  const [positionStyle, setPositionStyle] = useState<FloatingPosition>({
    top: 0,
    left: 0,
  });
  const targetRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!controlledOpened) return;

    setOpened(controlledOpened);
  }, [controlledOpened]);

  useEffect(() => {
    if (!targetRef.current || !tooltipRef.current || disabled) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let newPosition: FloatingPosition = { top: 0, left: 0 };

    if (position) {
      newPosition = position;
    } else {
      switch (arrowPosition) {
        case 'top':
          newPosition = {
            top: targetRect.top - tooltipRect.height - offset - arrowSize,
            left:
              targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
          };
          break;
        case 'bottom':
          newPosition = {
            top: targetRect.bottom + offset + arrowSize,
            left:
              targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
          };
          break;
        case 'left':
          newPosition = {
            top:
              targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
            left: targetRect.left - tooltipRect.width - offset - arrowSize,
          };
          break;
        case 'right':
          newPosition = {
            top:
              targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
            left: targetRect.right + offset + arrowSize,
          };
          break;
        default:
          break;
      }
    }

    setPositionStyle(newPosition);
    if (onPositionChange) onPositionChange(newPosition);
  }, [arrowPosition, offset, position, onPositionChange, disabled]);

  const handleMouseEnter = () => {
    if (events?.hover && !disabled) {
      setTimeout(() => {
        setOpened(true);
      }, openDelay);
    }
  };

  const handleMouseLeave = () => {
    if (events?.hover && !disabled) {
      setTimeout(() => {
        setOpened(false);
      }, closeDelay);
    }
  };

  return (
    <div
      ref={(el) => {
        targetRef.current = el;
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      style={{
        position: 'relative',
        display: inline ? 'inline' : 'inline-block',
      }}
    >
      {children}

      {opened && (
        <div
          ref={tooltipRef}
          className={`absolute bg-${color} rounded px-4 py-2 text-white ${radius} z-${zIndex}`}
          style={{
            ...positionStyle,
            transition: `opacity ${transitionProps.duration}ms ${transitionProps.transition}`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;
