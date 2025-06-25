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
      className={`text-sm rounded-md px-2 py-1.5 cursor-pointer shadow-sm transition-all duration-200 ${
        isLeaveEvent 
          ? `
            bg-gradient-to-r from-red-400 to-red-500 text-white font-bold
            border border-red-500 bg-stripe-pattern
            hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5
          `
          : `
            border-l-4 hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5
            ${event.hasConflict ? 'ring-1 ring-orange-400 border-r-2 border-r-orange-400' : ''}
          `
      }`}
      style={isLeaveEvent ? { textShadow: '0 1px 4px rgba(0,0,0,0.7)' } : { 
        backgroundColor: isDarkMode ? `${event.color}90` : `${event.color}15`,
        color: isDarkMode ? 'white' : event.color,
        borderLeftColor: event.color
      }}
      onClick={onClick}
      draggable={!isLeaveEvent}
      onDragStart={onDragStart}
      whileHover={{ scale: 1.02, y: -1 }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-1 min-h-[20px]">
        {/* Leave event icon with pulse animation */}
        {isLeaveEvent && (
          <span className="text-xs animate-pulse">🏢</span>
        )}

        {/* Regular event icons */}
        {!isLeaveEvent && (
          <>
            {event.hasConflict && (
              <span className="flex h-2 w-2 relative mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            )}
            {event.isRecurring && <FaSyncAlt className="text-[10px] flex-shrink-0 opacity-75" />}
            {event.hasVideoCall && <FaVideo className="text-[10px] flex-shrink-0 opacity-75" />}
            {event.attendees?.length > 0 && <FaUsers className="text-[10px] flex-shrink-0 opacity-75" />}
            
            {/* Enhanced category icons */}
            {event.category === 'cultural' && <span className="text-[10px]">🎭</span>}
            {event.category === 'religious' && <span className="text-[10px]">🕉️</span>}
            {event.category === 'entertainment' && <span className="text-[10px]">🎬</span>}
            {event.category === 'social' && <span className="text-[10px]">🎉</span>}
            {event.category === 'training' && <span className="text-[10px]">📚</span>}
            {event.category === 'health' && <span className="text-[10px]">🏥</span>}
            {event.category === 'work' && <span className="text-[10px]">💼</span>}
          </>
        )}
        
        {/* Enhanced title styling with truncation for mobile */}
        <span className={`break-words flex-1 leading-tight font-medium text-xs`}>
          {event.title}
        </span>
      </div>
      
      {/* Time display with conditional rendering for mobile */}
      {!isLeaveEvent && (
        <div className="text-[9px] opacity-75 mt-0.5 flex items-center">
          <svg className="w-1.5 h-1.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{startTime} - {endTime}</span>
        </div>
      )}

      {/* Enhanced leave event badge with gradient */}
      {isLeaveEvent && (
        <div className="flex items-center justify-center mt-1">
          <span className="text-[9px] bg-white bg-opacity-30 text-gray-900 px-1 py-0.5 rounded-sm font-bold backdrop-blur-sm">
            {event.leaveType?.toUpperCase() || 'OFFICE CLOSED'}
          </span>
        </div>
      )}
      
      {/* Enhanced indicators for regular events */}
      {!isLeaveEvent && (
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-0.5">
            {event.tags?.includes('tamil-nadu') && (
              <span className="text-[7px] bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-0.5 rounded font-semibold">
                TN
              </span>
            )}
            
            {event.hasConflict && (
              <span className="text-[7px] bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-0.5 rounded font-semibold animate-pulse">
                !
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {event.priority === 'high' && (
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" title="High Priority"></div>
            )}
            {event.priority === 'medium' && (
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" title="Medium Priority"></div>
            )}
            {event.priority === 'low' && (
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Low Priority"></div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MonthViewEvent;
