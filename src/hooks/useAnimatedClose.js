// hooks/useAnimatedClose.js
import { useState } from 'react';

export const useAnimatedClose = (onClose, duration = 300) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, duration);
  };

  const getAnimationClass = (enterClass = 'animate-slideUp', exitClass = 'animate-slideDown') => {
    return isClosing ? exitClass : enterClass;
  };

  return { isClosing, handleClose, getAnimationClass };
};