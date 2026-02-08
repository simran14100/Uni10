import { useEffect } from 'react';

export const useButtonActiveStateFix = () => {
  useEffect(() => {
    const resetCarouselButtons = () => {
      // Target all possible carousel button selectors
      const carouselButtons = document.querySelectorAll(
        'button[data-slot="carousel-previous"], ' +
        'button[data-slot="carousel-next"], ' +
        '.carousel-previous, ' +
        '.carousel-next, ' +
        'button[class*="carousel"], ' +
        'button[class*="CarouselPrevious"], ' +
        'button[class*="CarouselNext"]'
      );
      
      carouselButtons.forEach(button => {
        const element = button as HTMLElement;
        element.blur();
        element.style.backgroundColor = 'white';
        element.style.borderColor = '#d1d5db';
        element.style.color = '#374151';
        element.style.transform = 'none';
        element.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
        element.classList.remove('active', 'focus', 'hover');
      });
    };

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
        element.style.removeProperty('box-shadow');
        element.classList.remove('active', 'focus', 'hover');
        
        // Force reset for all carousel buttons
        if (
          element.getAttribute('data-slot')?.includes('carousel') ||
          element.className.includes('carousel') ||
          element.className.includes('Carousel')
        ) {
          element.style.backgroundColor = 'white';
          element.style.borderColor = '#d1d5db';
          element.style.color = '#374151';
        }
      });
      
      // Additional timeout reset to catch any delayed stuck states
      setTimeout(resetCarouselButtons, 50);
      setTimeout(resetCarouselButtons, 100);
      setTimeout(resetCarouselButtons, 200);
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Clear any active states from all buttons when mouse up
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const element = button as HTMLElement;
        element.blur();
        
        // Force reset for all carousel buttons
        if (
          element.getAttribute('data-slot')?.includes('carousel') ||
          element.className.includes('carousel') ||
          element.className.includes('Carousel')
        ) {
          element.style.backgroundColor = 'white';
          element.style.borderColor = '#d1d5db';
          element.style.color = '#374151';
        }
      });
      
      // Additional timeout reset to catch any delayed stuck states
      setTimeout(resetCarouselButtons, 50);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Clear active states when finger moves away from button
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.tagName !== 'BUTTON') {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          const btn = button as HTMLElement;
          btn.blur();
        });
      }
    };

    // Periodic reset to catch any stuck states
    const intervalReset = setInterval(resetCarouselButtons, 1000);

    // Add event listeners with passive option for better performance
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Cleanup
    return () => {
      clearInterval(intervalReset);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
};
