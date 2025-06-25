import React from 'react';
import { motion } from 'framer-motion';
import { FaRegClock, FaMapMarkerAlt } from 'react-icons/fa';

const WeekView = ({ date, events = [], isDarkMode, onEventClick, onTimeSlotClick, weatherData = {} }) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Invalid date provided</p>
      </div>
    );
  }

  // Get week start (Sunday)
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  
  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getEventsForDay = (day) => {
    // Filter events for the day and ensure uniqueness
    const dayEvents = events.filter((event, index, self) => 
      new Date(event.start).toDateString() === day.toDateString() &&
      index === self.findIndex(e => e.id === event.id)
    );
    
    // Return original events with conflict detection
    return checkEventConflicts(dayEvents);
  };

  // Fix conflict detection function to avoid duplicates
  const checkEventConflicts = (events) => {
    if (events.length <= 1) return events;
    
    // Ensure we have unique events first
    const uniqueEvents = events.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );
    
    const conflictMap = new Map();
    
    for (let i = 0; i < uniqueEvents.length; i++) {
      const event = uniqueEvents[i];
      let hasConflict = false;
      
      for (let j = 0; j < uniqueEvents.length; j++) {
        if (i === j) continue;
        
        const otherEvent = uniqueEvents[j];
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const otherStart = new Date(otherEvent.start);
        const otherEnd = new Date(otherEvent.end);
        
        if (eventStart < otherEnd && eventEnd > otherStart) {
          hasConflict = true;
          break;
        }
      }
      
      conflictMap.set(event.id, hasConflict);
    }
    
    return uniqueEvents.map(event => ({
      ...event,
      hasConflict: conflictMap.get(event.id) || false
    }));
  };

  const getWeatherIcon = (condition) => {
    switch(condition) {
      case 'sunny': return '☀️';
      case 'hot': return '🌞';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'partly-cloudy': return '⛅';
      default: return '🌤️';
    }
  };

  const getEventPosition = (event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    // Calculate top position based on start hour and minutes
    const startHour = startDate.getHours();
    const startMinutes = startDate.getMinutes();
    const top = (startHour * 64) + (startMinutes / 60 * 64); // 64px per hour (h-16 = 4rem = 64px)
    
    // Calculate height based on duration
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const height = Math.max(24, durationHours * 64); // Minimum 24px height
    
    return {
      top: `${top}px`,
      height: `${height}px`
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Week Header with responsive design */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="grid grid-cols-8 divide-x divide-gray-200 dark:divide-gray-700 min-w-[700px] md:min-w-full">
          {/* Time column header with gradient background */}
          <div className={`p-2 md:p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-sm md:text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Week of</span> {weekStart.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
          
          {/* Enhanced day headers with weather and event count */}
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day.toDateString() === today.toDateString();
            const dateKey = day.toISOString().split('T')[0];
            const dayWeather = weatherData[dateKey];
            
            return (
              <div 
                key={index} 
                className={`p-2 md:p-4 text-center transition-colors ${
                  isToday 
                    ? isDarkMode 
                      ? 'bg-blue-900 bg-opacity-30' 
                      : 'bg-blue-50'
                    : ''
                } hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <div className={`text-xs md:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-base md:text-lg font-bold mb-2 ${
                  isToday 
                    ? 'bg-blue-500 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center mx-auto text-sm md:text-base shadow-md' 
                    : ''
                }`}>
                  {day.getDate()}
                </div>
                {dayWeather && (
                  <div className="text-xs opacity-75 block">
                    {getWeatherIcon(dayWeather.condition)} <span className="hidden sm:inline">{dayWeather.temp}°</span>
                  </div>
                )}
                <div className={`text-[10px] md:text-xs mt-1 ${
                  dayEvents.length > 0 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full inline-block'
                    : 'opacity-50'
                }`}>
                  {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Week Grid with improved event display */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative min-w-[700px] md:min-w-full">
          {/* Hour rows with improved styling */}
          {hours.map(hour => (
            <div
              key={hour}
              className={`grid grid-cols-8 divide-x divide-gray-200 dark:divide-gray-700 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              } h-16`}
            >
              {/* Enhanced time label with gradient */}
              <div className={`p-2 text-right pr-2 md:pr-4 text-xs md:text-sm font-medium ${
                isDarkMode 
                  ? 'text-gray-400 bg-gradient-to-r from-gray-800 to-gray-750' 
                  : 'text-gray-500 bg-gradient-to-r from-gray-50 to-white'
              }`}>
                {formatHour(hour)}
              </div>
              
              {/* Enhanced day columns with better hover effects */}
              {weekDays.map((day, dayIndex) => {
                const isToday = day.toDateString() === today.toDateString();
                const isCurrentHour = isToday && new Date().getHours() === hour;
                
                return (
                  <div
                    key={dayIndex}
                    className={`relative transition-colors cursor-pointer ${
                      isCurrentHour 
                        ? isDarkMode 
                          ? 'bg-blue-900 bg-opacity-20' 
                          : 'bg-blue-50'
                        : ''
                    } hover:bg-gray-50 dark:hover:bg-gray-800`}
                    onClick={() => {
                      const clickDate = new Date(day);
                      clickDate.setHours(hour, 0, 0, 0);
                      onTimeSlotClick && onTimeSlotClick(clickDate);
                    }}
                  >
                    {/* Enhanced current time indicator with animation */}
                    {isCurrentHour && (
                      <div 
                        className="absolute left-0 right-0 bg-red-500 h-0.5 z-10 shadow-sm"
                        style={{ top: `${(new Date().getMinutes() / 60) * 100}%` }}
                      >
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Enhanced Events overlay with better animation and styling */}
          <div className="absolute inset-0">
            <div className="grid grid-cols-8 h-full min-w-[700px] md:min-w-full">
              {/* Skip time column */}
              <div></div>
              
              {/* Day columns with enhanced event cards */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                
                return (
                  <div key={dayIndex} className="relative">
                    {dayEvents.map((event, eventIndex) => {
                      const position = getEventPosition(event);
                      const isLeaveEvent = event.isWorkingDayLeave || event.category === 'holiday';
                      
                      return (
                        <motion.div
                          key={event.id || eventIndex}
                          className={`absolute left-1 right-1 rounded-lg shadow-md cursor-pointer z-20 overflow-hidden ${
                            isLeaveEvent
                              ? 'border border-red-500 bg-stripe-pattern'
                              : event.hasConflict 
                                ? 'ring-2 ring-orange-400' 
                                : ''
                          }`}
                          style={{
                            ...position,
                            backgroundColor: isLeaveEvent
                              ? '#F87171' // Red-400 for leaves
                              : isDarkMode ? `${event.color}90` : `${event.color}`,
                            color: 'white',
                            minHeight: '20px',
                            backgroundImage: isLeaveEvent
                              ? "linear-gradient(135deg, rgba(248, 113, 113, 1) 0%, rgba(239, 68, 68, 1) 100%)" 
                              : 'none',
                            textShadow: isLeaveEvent ? '0 1px 4px rgba(0,0,0,0.7)' : 'none'
                          }}
                          onClick={() => onEventClick && onEventClick(event)}
                          whileHover={{ 
                            scale: 1.03, 
                            zIndex: 30,
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                          }}
                          initial={{ opacity: 0, scale: 0.9, x: -5 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ delay: eventIndex * 0.05, duration: 0.2 }}
                        >
                          {/* Subtle pattern for leave events */}
                          {isLeaveEvent && (
                            <div className="absolute inset-0 opacity-10">
                              <div className="w-full h-full" style={{
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"
                              }}></div>
                            </div>
                          )}
                          
                          {/* Enhanced event content with better spacing */}
                          <div className="p-2 h-full flex flex-col">
                            <div className="font-semibold text-xs truncate mb-0.5 flex items-center gap-1">
                              {/* Enhanced conflict indicator */}
                              {event.hasConflict && !isLeaveEvent && (
                                <span className="flex h-1.5 w-1.5 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                                </span>
                              )}
                              
                              {/* Icon for leave/holiday */}
                              {isLeaveEvent && (
                                <span className="text-[10px] inline-block mr-0.5">🏢</span>
                              )}
                              
                              <span className="truncate">{event.title}</span>
                              
                              {/* Badge for leave type */}
                              {isLeaveEvent && (
                                <span className="ml-auto text-[8px] bg-white bg-opacity-30 px-1 py-0.5 rounded-sm text-gray-900 font-bold">
                                  {event.leaveType || 'HOLIDAY'}
                                </span>
                              )}
                            </div>
                            
                            {/* Time display - hide on very small heights */}
                            <div className="text-[8px] opacity-90 flex items-center gap-0.5 mb-0.5 block">
                              <FaRegClock className="text-[8px]" />
                              <span>
                                {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            
                            {/* Location with truncation */}
                            {event.location && (
                              <div className="text-[8px] opacity-90 flex items-center gap-0.5 truncate block">
                                <FaMapMarkerAlt className="text-[8px]" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            
                            {/* Enhanced event indicators */}
                            <div className="flex items-center gap-1 mt-auto block">
                              {event.priority === 'high' && (
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" title="High Priority"></span>
                              )}
                              {event.priority === 'medium' && (
                                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Medium Priority"></span>
                              )}
                              {event.priority === 'low' && (
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" title="Low Priority"></span>
                              )}
                              {event.isRecurring && (
                                <span className="inline-flex items-center rounded-full bg-white bg-opacity-20 px-1 text-[7px]">
                                  ↻
                                </span>
                              )}
                              {event.hasVideoCall && (
                                <span className="inline-flex items-center rounded-full bg-white bg-opacity-20 px-1 text-[7px]">
                                  ▶
                                </span>
                              )}
                              {event.attendees && event.attendees.length > 0 && (
                                <span className="inline-flex items-center rounded-full bg-white bg-opacity-20 px-1 text-[7px]">
                                  👥 {event.attendees.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
