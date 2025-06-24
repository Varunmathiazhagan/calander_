import React from 'react';
import { motion } from 'framer-motion';
import { FaSyncAlt, FaVideo, FaUsers, FaExclamationCircle } from 'react-icons/fa';

const MonthViewEvent = ({ event, isDarkMode, isMobile, onClick, onDragStart }) => {
  // Format the time for display
  const formatEventTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'p' : 'a';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
  };
  
  const startTime = formatEventTime(new Date(event.start));
  const endTime = formatEventTime(new Date(event.end));
  
  const isLeaveEvent = event.isWorkingDayLeave || event.category === 'holiday';
  
  return (
    <motion.div
      className={`text-sm rounded-md px-3 py-2 cursor-pointer transition-all duration-200 ${
        isLeaveEvent 
          ? `
            bg-red-500 text-white font-semibold
            border border-red-600 shadow-sm
            hover:bg-red-600 hover:shadow-md
          `
          : `
            border-l-4 hover:shadow-lg
            ${event.hasConflict ? 'ring-1 ring-orange-400 border-r-2 border-r-orange-400' : ''}
          `
      }`}
      style={isLeaveEvent ? {} : { 
        backgroundColor: isDarkMode ? `${event.color}90` : `${event.color}25`,
        color: isDarkMode ? 'white' : event.color,
        borderLeftColor: event.color
      }}
      onClick={onClick}
      draggable={!isLeaveEvent}
      onDragStart={onDragStart}
      whileHover={{ scale: 1.02, y: -1 }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-2 min-h-[24px]">
        {/* Simple leave event icon */}
        {isLeaveEvent && (
          <span className="text-sm">🏢</span>
        )}

        {/* Regular event icons */}
        {!isLeaveEvent && (
          <>
            {event.hasConflict && <FaExclamationCircle className="text-[12px] flex-shrink-0 text-orange-500" />}
            {event.isRecurring && <FaSyncAlt className="text-[12px] flex-shrink-0 opacity-75" />}
            {event.hasVideoCall && <FaVideo className="text-[12px] flex-shrink-0 opacity-75" />}
            {event.attendees?.length > 0 && <FaUsers className="text-[12px] flex-shrink-0 opacity-75" />}
            
            {/* Category icons */}
            {event.category === 'cultural' && <span className="text-[12px]">🎭</span>}
            {event.category === 'religious' && <span className="text-[12px]">🕉️</span>}
            {event.category === 'entertainment' && <span className="text-[12px]">🎬</span>}
            {event.category === 'social' && <span className="text-[12px]">🎉</span>}
            {event.category === 'training' && <span className="text-[12px]">📚</span>}
            {event.category === 'health' && <span className="text-[12px]">🏥</span>}
            {event.category === 'work' && <span className="text-[12px]">💼</span>}
          </>
        )}
        
        {/* Clean title styling */}
        <span className="break-words flex-1 leading-tight font-semibold text-sm">
          {event.title}
        </span>
      </div>
      
      {/* Time display for regular events */}
      {!isMobile && !isLeaveEvent && (
        <div className="text-[10px] opacity-75 truncate flex items-center mt-1">
          <span className="font-medium">{startTime} - {endTime}</span>
        </div>
      )}

      {/* Clean leave event badge */}
      {isLeaveEvent && (
        <div className="flex items-center justify-center mt-2">
          <span className="text-xs bg-white bg-opacity-30 text-white px-2 py-1 rounded-sm font-medium">
            {event.leaveType?.toUpperCase() || 'OFFICE CLOSED'}
          </span>
        </div>
      )}
      
      {/* Regular event indicators */}
      {!isLeaveEvent && (
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            {event.tags?.includes('tamil-nadu') && (
              <span className="text-[8px] bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-1 rounded font-semibold">
                TN
              </span>
            )}
            
            {event.hasConflict && (
              <span className="text-[8px] bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-1 rounded font-semibold">
                CONFLICT.
              </span>
            )}
          </div>
          
          {event.priority === 'high' && (
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MonthViewEvent;
       