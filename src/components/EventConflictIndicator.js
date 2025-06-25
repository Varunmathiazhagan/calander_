import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * Component to display a visual indicator for conflicting events
 */
const EventConflictIndicator = ({ events, isDarkMode, onEventClick }) => {
  if (!events || events.length <= 1) return null;
  
  // Only show if we have 2+ events with conflicts
  const conflictingEvents = events.filter(event => event.hasConflict);
  if (conflictingEvents.length <= 1) return null;
  
  return (
    <motion.div 
      className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md cursor-pointer ${
        isDarkMode ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
      }`}
      onClick={onEventClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <FaExclamationTriangle className="text-lg" />
      <span className="text-lg">{conflictingEvents.length} overlapping events</span>
    </motion.div>
  );
};

export default EventConflictIndicator;
