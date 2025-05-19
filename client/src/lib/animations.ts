export const fadeIn = (direction: string, type: string, delay: number, duration: number) => {
  return {
    hidden: {
      x: direction === 'left' ? 10 : direction === 'right' ? -10 : 0,
      y: direction === 'up' ? 10 : direction === 'down' ? -10 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        delay: 0,
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0,
      delayChildren: 0,
    },
  },
};

export const zoomIn = (delay: number, duration: number) => {
  return {
    hidden: {
      scale: 0.95,
      opacity: 0,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'tween',
        delay: 0,
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };
};

export const slideIn = (direction: string, type: string, delay: number, duration: number) => {
  return {
    hidden: {
      x: direction === 'left' ? '-10%' : direction === 'right' ? '10%' : 0,
      y: direction === 'up' ? '10%' : direction === 'down' ? '10%' : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        delay: 0,
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };
};

export const textVariant = (delay: number) => {
  return {
    hidden: {
      y: 10,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        duration: 0.3,
        delay: 0,
        ease: 'easeOut',
      },
    },
  };
};
