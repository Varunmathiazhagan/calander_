import React from 'react';
import { motion } from 'framer-motion';
import { FaRegClock, FaMapMarkerAlt, FaVideo, FaSyncAlt, FaUsers } from 'react-icons/fa';

const DayView = ({ 
  date, 
  events = [], 
  isDarkMode, 
  onEventClick, 
  onTimeSlotClick, 
  weatherData = {},
  today = new Date()
}) => {
  // Check date validity
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Invalid date provided</p>
      </div>
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dateKey = date.toISOString().split('T')[0];
  const dayWeather = weatherData[dateKey];

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

  const getWeatherDescription = (condition, humidity) => {
    const descriptions = {
      'sunny': 'Clear and bright',
      'hot': 'Hot and sunny',
      'cloudy': 'Overcast',
      'rainy': 'Monsoon showers',
      'partly-cloudy': 'Partly cloudy'
    };
    
    const humidityDesc = {
      'low': 'Low humidity',
      'medium': 'Moderate humidity', 
      'high': 'High humidity',
      'very-high': 'Very humid'
    };
    
    return `${descriptions[condition] || condition} • ${humidityDesc[humidity] || ''}`;
  };

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getEventPosition = (event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    const startHour = startDate.getHours();
    const startMinutes = startDate.getMinutes();
    const endHour = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    
    const startPercentage = (startHour + startMinutes / 60) * (100 / 24);
    const duration = (endHour + endMinutes / 60) - (startHour + startMinutes / 60);
    const heightPercentage = duration * (100 / 24);
    
    return {
      top: `${startPercentage}%`,
      height: `${Math.max(heightPercentage, 4)}%`
    };
  };

  const formatEventTime = (startDate, endDate) => {
    const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };
    
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
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

  // Process events with conflict detection and ensure uniqueness
  const processedEvents = checkEventConflicts(events.filter((event, index, self) => 
    index === self.findIndex(e => e.id === event.id)
  ));

  return (
    <div className="h-full flex flex-col relative">
      {/* Enhanced Day Header with responsive design */}
      <div className={`p-4 md:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
        isDarkMode ? 'from-gray-800 to-gray-750' : 'from-white to-gray-50'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-base md:text-lg opacity-75">
              {events.length} event{events.length !== 1 ? 's' : ''} scheduled
              {events.filter(e => e.isWorkingDayLeave || e.category === 'holiday').length > 0 && 
                ` • ${events.filter(e => e.isWorkingDayLeave || e.category === 'holiday').length} holiday(s)`
              }
            </p>
          </div>
          
          {/* Enhanced weather card with animation */}
          {dayWeather && (
            <motion.div 
              className={`p-2 md:p-4 rounded-xl ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              } shadow-sm border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center">
                <div className="text-2xl md:text-3xl mb-2 animate-pulse">
                  {getWeatherIcon(dayWeather.condition)}
                </div>
                <div className="text-lg md:text-xl font-bold">{dayWeather.temp}°C</div>
                <div className="text-xs md:text-sm opacity-75 block">
                  {getWeatherDescription(dayWeather.condition, dayWeather.humidity)}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Enhanced Timeline with better spacing */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {/* Hour grid with improved hover effects */}
          {hours.map(hour => (
            <div
              key={hour}
              className={`relative h-20 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              } last:border-b-0 transition-colors cursor-pointer ${
                date.toDateString() === today.toDateString() && today.getHours() === hour
                  ? isDarkMode ? 'bg-blue-900 bg-opacity-10' : 'bg-blue-50'
                  : ''
              } hover:bg-gray-50 dark:hover:bg-gray-800`}
              onClick={() => {
                const clickDate = new Date(date);
                clickDate.setHours(hour, 0, 0, 0);
                onTimeSlotClick && onTimeSlotClick(clickDate);
              }}
            >
              {/* Enhanced time column with gradient */}
              <div className={`absolute left-0 top-0 w-16 md:w-20 h-full flex items-start justify-center pt-2 ${
                isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-50'
              } text-xs md:text-sm font-medium border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {formatHour(hour)}
              </div>
              
              {/* Enhanced current time indicator with better animation */}
              {date.toDateString() === today.toDateString() && 
               today.getHours() === hour && (
                <div 
                  className="absolute left-16 md:left-20 right-0 bg-red-500 h-0.5 z-30 shadow-lg"
                  style={{ 
                    top: `${(today.getMinutes() / 60) * 100}%`
                  }}
                >
                  <div className="absolute -left-2 -top-1.5 w-4 h-4 bg-red-500 rounded-full shadow-md flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute right-2 -top-6 bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg font-medium">
                    {today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Enhanced Events overlay with better animation and styling */}
          <div className="absolute inset-0 left-16 md:left-20 right-0">
            {processedEvents.map((event, index) => {
              const position = getEventPosition(event);
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);
              const isLeaveEvent = event.isWorkingDayLeave || event.category === 'holiday';
              
              return (
                <motion.div
                  key={event.id || index}
                  className={`absolute left-2 md:left-4 right-2 md:right-4 rounded-lg shadow-md cursor-pointer z-20 overflow-hidden ${
                    isLeaveEvent
                      ? 'bg-gradient-to-r from-red-400 to-red-500 text-white border border-red-500 shadow-lg bg-stripe-pattern'
                      : `border-l-4 ${event.hasConflict ? 'ring-2 ring-orange-400' : ''}`
                  }`}
                  style={isLeaveEvent ? { ...position, minHeight: '48px', textShadow: '0 1px 4px rgba(0,0,0,0.7)' } : {
                    ...position,
                    backgroundColor: isDarkMode ? `${event.color}15` : `${event.color}10`,
                    borderLeftColor: event.color,
                    color: isDarkMode ? 'white' : event.color,
                    minHeight: '48px'
                  }}
                  onClick={() => onEventClick && onEventClick(event)}
                  whileHover={{ scale: 1.01, x: 2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  {/* Subtle pattern for leave events */}
                  {isLeaveEvent && (
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-full h-full" style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"
                      }}></div>
                    </div>
                  )}
                  
                  <div className="p-2 md:p-4 h-full">
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1 min-w-0">
                        {/* Enhanced event title with animation for holidays */}
                        <h4 className={`mb-2 flex items-center gap-2 text-sm md:text-base ${
                          isLeaveEvent
                            ? 'font-bold text-base text-white'
                            : 'font-bold text-base'
                        }`} style={isLeaveEvent ? {} : { color: event.color }}>
                          {event.hasConflict && !isLeaveEvent && (
                            <span className="flex h-2 w-2 relative mr-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                          )}
                          
                          {/* Enhanced leave icon with animation */}
                          {isLeaveEvent && (
                            <span className="text-base inline-block animate-pulse">🏢</span>
                          )}
                          
                          <span className="break-words truncate">{event.title}</span>
                          
                          {/* Enhanced badge for leave type */}
                          {isLeaveEvent && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white bg-opacity-25 text-gray-900 backdrop-blur-sm">
                              {event.leaveType || 'Holiday'}
                            </span>
                          )}
                        </h4>
                        
                        {/* Enhanced time and details for regular events */}
                        {!isLeaveEvent && (
                          <>
                            <div className="flex items-center gap-3 mb-2 text-xs opacity-80">
                              <span className="flex items-center gap-1">
                                <FaRegClock className="text-xs" />
                                {formatEventTime(startDate, endDate)}
                              </span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center gap-2 mb-2 text-xs opacity-80">
                                <FaMapMarkerAlt className="text-xs" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            
                            {event.description && (
                              <p className="text-xs opacity-75 mb-2 line-clamp-2 md:line-clamp-3">
                                {event.description}
                              </p>
                            )}
                          </>
                        )}

                        {/* Enhanced leave day content with improved styling */}
                        {isLeaveEvent && (
                          <div className="mt-3">
                            <div className="text-white text-sm font-semibold mb-2 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3" />
                              </svg>
                              Office Closed - Paid Holiday
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="bg-white bg-opacity-30 text-gray-900 px-2 py-0.5 rounded-md text-xs font-bold backdrop-blur-sm">
                                {event.leaveType?.toUpperCase() || 'NATIONAL HOLIDAY'}
                              </span>
                              <span className="bg-white bg-opacity-30 text-gray-900 px-2 py-0.5 rounded-md text-xs font-bold backdrop-blur-sm">
                                PAID LEAVE
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-white text-xs opacity-90 border-l-2 border-white border-opacity-50 pl-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Enhanced icons for regular events */}
                      {!isLeaveEvent && (
                        <div className="flex flex-col items-end gap-2 ml-2">
                          <div className="flex flex-col gap-1">
                            {event.isRecurring && (
                              <FaSyncAlt className="text-xs opacity-75" style={{ color: event.color }} />
                            )}
                            {event.hasVideoCall && (
                              <FaVideo className="text-xs opacity-75" style={{ color: event.color }} />
                            )}
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FaUsers className="text-xs opacity-75" style={{ color: event.color }} />
                                <span className="text-xs opacity-75" style={{ color: event.color }}>
                                  {event.attendees.length}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Priority indicator */}
                          {event.priority === 'high' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-1" title="High Priority"></div>
                          )}
                          {event.priority === 'medium' && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1" title="Medium Priority"></div>
                          )}
                          {event.priority === 'low' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1" title="Low Priority"></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced current time floating indicator with animations */}
      {date.toDateString() === today.toDateString() && (
        <motion.div
          className="absolute right-2 md:right-8 top-1/2 transform -translate-y-1/2 z-50 hidden md:block"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring", damping: 20 }}
        >
          <motion.div 
            className={`p-4 rounded-xl shadow-xl border ${
              isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            animate={{ 
              boxShadow: ["0px 0px 0px rgba(0,0,0,0.1)", "0px 4px 20px rgba(0,0,0,0.15)", "0px 0px 0px rgba(0,0,0,0.1)"],
              y: [0, -3, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 2 
            }}
          >
            <div className="text-center">
              <div className="text-xs font-medium opacity-75 mb-1">Current Time</div>
              <div className="text-xl md:text-2xl font-bold text-red-500 mb-1">
                {today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs opacity-75">
                {today.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="mt-2 w-8 h-1 bg-red-500 rounded-full mx-auto animate-pulse"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DayView;
