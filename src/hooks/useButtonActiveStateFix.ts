import { useEffect } from 'react';

export const useButtonActiveStateFix = () => {
  useEffect(() => {
    const resetAllButtons = () => {
      // Target ALL buttons on the page
      const allButtons = document.querySelectorAll('button');
      
      allButtons.forEach(button => {
        const element = button as HTMLElement;
        element.blur();
        
        // Reset all possible stuck states
        element.style.removeProperty('background-color');
        element.style.removeProperty('border-color');
        element.style.removeProperty('color');
        element.style.removeProperty('transform');
        element.style.removeProperty('box-shadow');
        element.style.removeProperty('outline');
        element.classList.remove('active', 'focus', 'hover');
        
        // Force reset to default for mobile carousel buttons
        if (window.innerWidth <= 640) {
          element.style.backgroundColor = 'white';
          element.style.borderColor = '#d1d5db';
          element.style.color = '#374151';
          element.style.transform = 'none';
          element.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
          element.style.outline = 'none';
        }
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Immediately reset all buttons when touch ends
      resetAllButtons();
      
      // Additional timeout resets to catch any delayed stuck states
      setTimeout(resetAllButtons, 10);
      setTimeout(resetAllButtons, 50);
      setTimeout(resetAllButtons, 100);
      setTimeout(resetAllButtons, 200);
      setTimeout(resetAllButtons, 500);
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Reset all buttons when mouse up
      resetAllButtons();
      
      // Additional timeout reset
      setTimeout(resetAllButtons, 50);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Reset buttons when finger moves away
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.tagName !== 'BUTTON') {
        resetAllButtons();
      }
    };

    const handleClick = (e: Event) => {
      // Reset buttons after any click
      setTimeout(resetAllButtons, 100);
    };

    const handleScroll = () => {
      // Reset buttons on scroll to catch any stuck states
      resetAllButtons();
    };

    // Periodic reset to catch any stuck states
    const intervalReset = setInterval(resetAllButtons, 500);

    // Add event listeners with passive option for better performance
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    // Initial reset
    setTimeout(resetAllButtons, 100);

    // Cleanup
    return () => {
      clearInterval(intervalReset);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);
};
