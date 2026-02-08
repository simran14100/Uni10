import { useEffect } from 'react';

export const useButtonActiveStateFix = () => {
  useEffect(() => {
    const handleTouchEnd = (e: TouchEvent) => {
      // Clear any active states from all buttons when touch ends
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const element = button as HTMLElement;
        element.blur();
        // Remove any stuck visual states
        element.style.removeProperty('background-color');
        element.style.removeProperty('border-color');
        element.style.removeProperty('color');
        element.style.removeProperty('transform');
        element.classList.remove('active', 'focus', 'hover');
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Clear any active states from all buttons when mouse up
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const element = button as HTMLElement;
        element.blur();
      });
    };

    // Add event listeners with passive option for better performance
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
};
