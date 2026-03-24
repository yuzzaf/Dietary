import { useState, useEffect } from 'react';

const TypewriterText = ({ text, delay = 30, className = '' }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse inline-block w-[3px] h-[1em] bg-blue-600 ml-1 align-middle opacity-70"></span>
    </span>
  );
};

export default TypewriterText;
