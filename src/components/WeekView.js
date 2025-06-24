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
      {/* Week Header - Mobile optimized */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="grid grid-cols-8 divide-x divide-gray-200 dark:divide-gray-700">
          {/* Time column header */}
          <div className="p-2 sm:p-4">
            <div className="text-sm sm:text-lg font-semibold">
              Week of {weekStart.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: window.innerWidth < 640 ? undefined : 'numeric'
              })}
            </div>
          </div>
          
          {/* Day headers - Mobile optimized */}
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day.toDateString() === today.toDateString();
            const dateKey = day.toISOString().split('T')[0];
            const dayWeather = weatherData[dateKey];
            
            return (
              <div key={index} className={`p-2 sm:p-4 text-center ${isToday ? 'bg-blue-50 dark:bg-blue-900' : ''}`}>
                <div className={`text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {day.toLocaleDateString('en-US', { weekday: window.innerWidth < 640 ? 'short' : 'short' })}
                </div>
                <div className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 ${
                  isToday 
                    ? 'bg-blue-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mx-auto text-sm sm:text-lg' 
                    : ''
                }`}>
                  {day.getDate()}
                </div>
                {dayWeather && (
                  <div className="text-xs opacity-75 hidden sm:block">
                    {getWeatherIcon(dayWeather.condition)} {dayWeather.temp}°
                  </div>
                )}
                <div className="text-xs mt-1 opacity-75">
                  {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week Grid - Mobile optimized */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {/* Hour rows */}
          {hours.map(hour => (
            <div
              key={hour}
              className={`grid grid-cols-8 divide-x divide-gray-200 dark:divide-gray-700 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              } h-12 sm:h-16`}
            >
              {/* Time label - Mobile optimized */}
              <div className={`p-1 sm:p-2 text-right pr-2 sm:pr-4 text-xs sm:text-sm font-medium ${
                isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-50'
              }`}>
                {formatHour(hour)}
              </div>
              
              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const isToday = day.toDateString() === today.toDateString();
                const isCurrentHour = isToday && new Date().getHours() === hour;
                
                return (
                  <div
                    key={dayIndex}
                    className={`relative hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                      isCurrentHour ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                    onClick={() => {
                      const clickDate = new Date(day);
                      clickDate.setHours(hour, 0, 0, 0);
                      onTimeSlotClick && onTimeSlotClick(clickDate);
                    }}
                  >
                    {/* Current time indicator - Mobile optimized */}
                    {isCurrentHour && (
                      <div 
                        className="absolute left-0 right-0 bg-red-500 h-0.5 z-10"
                        style={{ top: `${(new Date().getMinutes() / 60) * 100}%` }}
                      >
                        <div className="absolute -left-0.5 sm:-left-1 -top-0.5 sm:-top-1 w-1 h-1 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Events overlay - Mobile optimized */}
          <div className="absolute inset-0">
            <div className="grid grid-cols-8 h-full">
              {/* Skip time column */}
              <div></div>
              
              {/* Day columns with events */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                
                return (
                  <div key={dayIndex} className="relative">
                    {dayEvents.map((event, eventIndex) => {
                      const position = getEventPosition(event);
                      
                      return (
                        <motion.div
                          key={event.id || eventIndex}
                          className={`absolute left-0.5 sm:left-1 right-0.5 sm:right-1 rounded-lg shadow-md cursor-pointer z-20 overflow-hidden ${
                            event.hasConflict ? 'ring-1 sm:ring-2 ring-orange-400' : ''
                          }`}
                          style={{
                            ...position,
                            backgroundColor: event.isWorkingDayLeave || event.category === 'holiday' 
                              ? '#EF4444' // Red color for leaves
                              : isDarkMode ? `${event.color}90` : `${event.color}`,
                            color: 'white',
                            minHeight: '20px',
                            backgroundImage: (event.isWorkingDayLeave || event.category === 'holiday') 
                              ? "linear-gradient(135deg, rgba(239,68,68,1) 0%, rgba(220,38,38,1) 100%)" 
                              : 'none'
                          }}
                          onClick={() => onEventClick && onEventClick(event)}
                          whileHover={{ scale: window.innerWidth < 640 ? 1.02 : 1.05, zIndex: 30 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: eventIndex * 0.05 }}
                        >
                          {/* Add a subtle pattern for leave events */}
                          {(event.isWorkingDayLeave || event.category === 'holiday') && (
                            <div className="absolute inset-0 opacity-10">
                              <div className="w-full h-full" style={{
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"
                              }}></div>
                            </div>
                          )}
                          
                          <div className="p-1 sm:p-2 h-full">
                            <div className="font-semibold text-xs sm:text-sm mb-1 flex items-center gap-1">
                              {/* Add pulsing effect for conflict indicator */}
                              {event.hasConflict && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                              )}
                              
                              {/* Add icon for leave/holiday */}
                              {(event.isWorkingDayLeave || event.category === 'holiday') && (
                                <span className="text-xs inline-block mr-1">🏢</span>
                              )}
                              
                              <span className="break-words truncate">{event.title}</span>
                              
                              {/* Add badge for leave type */}
                              {(event.isWorkingDayLeave || event.category === 'holiday') && (
                                <span className="ml-auto text-[8px] bg-white bg-opacity-30 px-1 py-0.5 rounded-sm">
                                  {event.leaveType || 'HOLIDAY'}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-xs opacity-90 flex items-center gap-1 mb-1 sm:block hidden">
                              <FaRegClock className="text-[10px]" />
                              <span>
                                {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            
                            {event.location && (
                              <div className="text-xs opacity-90 flex items-center gap-1 truncate sm:block hidden">
                                <FaMapMarkerAlt className="text-[10px]" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            
                            {/* Enhanced indicators for event properties */}
                            <div className="flex items-center gap-1 mt-1 sm:block hidden">
                              {event.isRecurring && (
                                <span className="inline-flex items-center rounded-full bg-white bg-opacity-20 px-1 text-[8px]">
                                  ↻ Recurring
                                </span>
                              )}
                              {event.hasVideoCall && (
                                <span className="inline-flex items-center rounded-full bg-white bg-opacity-20 px-1 text-[8px]">
                                  ▶ Video
                                </span>
                              )}
                              {event.attendees && event.attendees.length > 0 && (
                                <span className="inline-flex items-center rounded-full bg-white bg-opacity-20 px-1 text-[8px]">
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
