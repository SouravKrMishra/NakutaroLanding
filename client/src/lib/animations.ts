export const fadeIn = (direction: string, type: string, delay: number, duration: number) => {
  return {
    hidden: {
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        delay: Math.min(0.3, delay * 0.5), // Cap delay at 0.3s for better responsiveness
        duration: Math.min(0.7, duration * 0.8), // Slightly faster animations
        ease: 'easeOut',
      },
    },
  };
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

export const zoomIn = (delay: number, duration: number) => {
  return {
    hidden: {
      scale: 0.9,
      opacity: 0,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'tween',
        delay: Math.min(0.2, delay * 0.6),
        duration: Math.min(0.6, duration * 0.7),
        ease: 'easeOut',
      },
    },
  };
};

export const slideIn = (direction: string, type: string, delay: number, duration: number) => {
  return {
    hidden: {
      x: direction === 'left' ? '-50%' : direction === 'right' ? '50%' : 0,
      y: direction === 'up' ? '50%' : direction === 'down' ? '50%' : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        delay: Math.min(0.2, delay * 0.6),
        duration: Math.min(0.5, duration * 0.7),
        ease: 'easeOut',
      },
    },
  };
};

export const textVariant = (delay: number) => {
  return {
    hidden: {
      y: 20,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        duration: 0.6,
        delay: Math.min(0.2, delay * 0.6),
        ease: 'easeOut',
      },
    },
  };
};
