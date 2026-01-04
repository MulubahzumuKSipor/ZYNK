
import React from 'react';
import styles from '../styles/TimeRangeSelector.module.css';

type Range = 'Today' | '7d' | '30d' | 'Custom';

interface TimeRangeSelectorProps {
  currentRange: Range;
  onRangeChange: (newRange: Range) => void;
}

const ranges: Range[] = ['Today', '7d', '30d', 'Custom'];

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ currentRange, onRangeChange }) => {
  return (
    <div className={styles.selectorContainer}>
      {ranges.map((range) => (
        <button
          key={range}
          className={`${styles.rangeButton} ${currentRange === range ? styles.active : ''}`}
          onClick={() => onRangeChange(range)}
        >
          {range}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;