import { useEffect, useState } from 'react';
import { animate } from 'motion/react';

interface AnimatedNumberProps {
  value: string | number;
  decimals?: number;
}

export function AnimatedNumber({ value, decimals = 2 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState<string>(Number(value).toFixed(decimals));

  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
      setDisplayValue(value.toString());
      return;
    }

    const currentDisplayValue = parseFloat(displayValue) || 0;
    
    const controls = animate(currentDisplayValue, numericValue, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(latest.toFixed(decimals));
      }
    });

    return () => controls.stop();
  }, [value, decimals]);

  return <span>{displayValue}</span>;
}
