import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaTrash, 
         FaRegClock, FaMapMarkerAlt, FaVideo, FaSyncAlt, FaCalendarDay } from 'react-icons/fa';
import eventData from '../data/events.json';
import currentEventsData from '../data/currentEvents.json';
import DayView from './DayView';
import WeekView from './WeekView';
import YearView from './YearView';

const Calendar = forwardRef(function Calendar({ isDarkMode }, ref) {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day', 'year'
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    id: '',
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    color: '#6366F1',
    location: '',
    isRecurring: false,
    recurrencePattern: 'daily',
    attendees: [],
    reminders: [{time: 30, unit: 'minutes'}],
    hasVideoCall: false,
    category: 'work',
    priority: 'medium',
    tags: [],
    url: '',
    notes: ''
  });
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showEventsList, setShowEventsList] = useState(false);
  
  useEffect(() => {
    // Load event data and convert date strings to Date objects
    const currentYear = 2025;
    
    const formattedEvents = [...eventData, ...currentEventsData].map(event => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      startDate.setFullYear(currentYear);
      endDate.setFullYear(currentYear);
      
      return {
        ...event,
        start: startDate,
        end: endDate,
        category: event.category || 'work',
        priority: event.priority || 'medium',
        tags: event.tags || [],
        notes: event.notes || ''
      };
    });
    
    // Remove duplicates based on title and date combination
    const uniqueEvents = formattedEvents.filter((event, index, self) => {
      const eventKey = `${event.title}_${event.start.toDateString()}`;
      return index === self.findIndex(e => `${e.title}_${e.start.toDateString()}` === eventKey);
    });
    
    // Sort events by start time
    uniqueEvents.sort((a, b) => a.start - b.start);
    
    setEvents(uniqueEvents);
    
    // Handle responsiveness
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Generate weather data for Tamil Nadu climate
    setTimeout(() => {
      const currentYear = 2025; // Update weather data year
      const mockWeather = {};
      
      // Tamil Nadu weather patterns by month
      const tamilNaduWeather = {
        0: { baseTemp: 26, conditions: ['sunny', 'partly-cloudy'], humidity: 'high' }, // January
        1: { baseTemp: 28, conditions: ['sunny', 'partly-cloudy'], humidity: 'high' }, // February  
        2: { baseTemp: 31, conditions: ['hot', 'sunny'], humidity: 'medium' }, // March
        3: { baseTemp: 34, conditions: ['hot', 'sunny'], humidity: 'medium' }, // April
        4: { baseTemp: 36, conditions: ['hot', 'partly-cloudy'], humidity: 'high' }, // May
        5: { baseTemp: 35, conditions: ['rainy', 'cloudy', 'partly-cloudy'], humidity: 'very-high' }, // June
        6: { baseTemp: 33, conditions: ['rainy', 'cloudy'], humidity: 'very-high' }, // July
        7: { baseTemp: 32, conditions: ['rainy', 'cloudy'], humidity: 'very-high' }, // August
        8: { baseTemp: 33, conditions: ['rainy', 'partly-cloudy'], humidity: 'high' }, // September
        9: { baseTemp: 31, conditions: ['rainy', 'partly-cloudy', 'cloudy'], humidity: 'high' }, // October
        10: { baseTemp: 28, conditions: ['partly-cloudy', 'cloudy'], humidity: 'high' }, // November
        11: { baseTemp: 26, conditions: ['sunny', 'partly-cloudy'], humidity: 'medium' } // December
      };
      
      // Generate weather for all months in 2025
      for (let month = 0; month < 12; month++) {
        const monthWeather = tamilNaduWeather[month];
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear, month, day);
          const dateKey = date.toISOString().split('T')[0];
          
          // Add some randomness to base temperature
          const tempVariation = Math.floor(Math.random() * 6) - 3; // -3 to +3
          const temperature = monthWeather.baseTemp + tempVariation;
          
          // Select random condition from month's typical conditions
          const condition = monthWeather.conditions[Math.floor(Math.random() * monthWeather.conditions.length)];
          
          mockWeather[dateKey] = {
            temp: temperature,
            condition: condition,
            humidity: monthWeather.humidity
          };
        }
      }
      
      // Special weather for today (June 24, 2025)
      const today = new Date(2025, 5, 24); // June 24, 2025
      const todayKey = today.toISOString().split('T')[0];
      mockWeather[todayKey] = { temp: 35, condition: 'hot', humidity: 'high' };
      
      setWeatherData(mockWeather);
      setIsLoading(false);
    }, 1000);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Navigation functions
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (viewMode === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    } else if (viewMode === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    }
  };

  const handleEventClick = (event) => {
    setCurrentEvent(event);
    
    if (event.showEventModal) {
      setShowEventModal(true);
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (viewMode === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    } else if (viewMode === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    }
  };
  
  const goToToday = () => {
    const today = new Date(2025, 5, 24); // Set to June 24, 2025
    setCurrentDate(today);
    setSelectedDate(today);
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
  
  const handleDateClick = (date) => {
    setSelectedDate(date);
    
    // Get unique events for the selected date
    const dateEvents = events.filter((event, index, self) => 
      new Date(event.start).toDateString() === date.toDateString() &&
      index === self.findIndex(e => 
        e.id === event.id || 
        (e.title === event.title && new Date(e.start).toDateString() === new Date(event.start).toDateString())
      )
    );
    
    setSelectedDateEvents(dateEvents);
    
    if (dateEvents.length > 0 && isMobile) {
      setShowEventsList(true);
    } else if (viewMode === 'month') {
      setCurrentDate(date);
      setViewMode('day');
    }
  };
  
  const openNewEventModal = (date) => {
    const startTime = new Date(date);
    startTime.setHours(startTime.getHours(), 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    setCurrentEvent({
      id: '',
      title: '',
      description: '',
      start: startTime,
      end: endTime,
      color: '#6366F1',
      location: '',
      isRecurring: false,
      recurrencePattern: 'daily',
      attendees: [],
      reminders: [{time: 30, unit: 'minutes'}],
      hasVideoCall: false,
      category: 'work',
      priority: 'medium',
      tags: [],
      url: '',
      notes: ''
    });
    
    setShowEventModal(true);
  };
  
  const saveEvent = (eventData) => {
    if (!eventData.title) return;
    
    if (eventData.id) {
      setEvents(events.map(event => 
        event.id === eventData.id ? eventData : event
      ));
    } else {
      const newEvent = {
        ...eventData,
        id: Date.now().toString()
      };
      setEvents([...events, newEvent]);
    }
    
    setShowEventModal(false);
  };
  
  const deleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
    setShowEventModal(false);
  };
  
  const handleDrop = (date) => {
    if (!draggedEvent) return;
    
    const timeDiff = draggedEvent.end - draggedEvent.start;
    const newStart = new Date(date);
    newStart.setHours(draggedEvent.start.getHours(), draggedEvent.start.getMinutes());
    
    const newEnd = new Date(newStart);
    newEnd.setTime(newStart.getTime() + timeDiff);
    
    const updatedEvent = {
      ...draggedEvent,
      start: newStart,
      end: newEnd
    };
    
    setEvents(events.map(event => 
      event.id === draggedEvent.id ? updatedEvent : event
    ));
    
    setDraggedEvent(null);
  };

  const checkEventConflicts = (events) => {
    if (events.length <= 1) return events;
    
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
  
  const getEventTimeLabel = (event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const endHour = end.getHours();
    const endMin = end.getMinutes();
    
    const startTime = `${startHour === 0 ? '12' : startHour > 12 ? startHour - 12 : startHour}:${startMin.toString().padStart(2, '0')}${startHour >= 12 ? 'p' : 'a'}`;
    const endTime = `${endHour === 0 ? '12' : endHour > 12 ? endHour - 12 : endHour}:${endMin.toString().padStart(2, '0')}${endHour >= 12 ? 'p' : 'a'}`;
    
    return `${startTime} - ${endTime}`;
  };
  
  // View rendering functions
  const renderMonthView = () => {
    const displayDate = new Date(currentDate);
    const days = [];
    const monthStart = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const totalDaysInMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
    const startDayOfWeek = monthStart.getDay();
    
    // Add previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(monthStart);
      day.setDate(day.getDate() - i);
      days.push(day);
    }
    
    // Add current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const day = new Date(displayDate.getFullYear(), displayDate.getMonth(), i);
      days.push(day);
    }
    
    // Add next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, i);
      days.push(day);
    }
    
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    // Count total events for the month for analytics
    const eventCountByDay = {};
    events.forEach(event => {
      const dateKey = new Date(event.start).toDateString();
      eventCountByDay[dateKey] = (eventCountByDay[dateKey] || 0) + 1;
    });
    
    const today = new Date();
    
    return (
      <div className="flex flex-col h-full">
        <div className={`grid grid-cols-7 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${isDarkMode ? 'from-gray-800 to-gray-700' : 'from-blue-50 to-indigo-50'}`}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div 
              key={day} 
              className={`py-3 text-center text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${isMobile ? 'px-1' : 'px-2'} tracking-wider`}
            >
              {isMobile ? day.charAt(0) : day}
            </div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-rows-6 divide-y divide-gray-200 dark:divide-gray-700">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-700 h-full">
              {week.map((day, dayIndex) => {
                const isCurrentMonth = day.getMonth() === displayDate.getMonth();
                const isToday = day.toDateString() === today.toDateString();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isSelected = day.toDateString() === selectedDate.toDateString();
                
                // Get events for this day and process them - ensure uniqueness by title and date
                const dayEvents = events.filter((event, index, self) => 
                  day.toDateString() === new Date(event.start).toDateString() &&
                  index === self.findIndex(e => 
                    e.id === event.id || 
                    (e.title === event.title && new Date(e.start).toDateString() === new Date(event.start).toDateString())
                  )
                );
                
                const processedEvents = checkEventConflicts(dayEvents);
                const dateKey = day.toISOString().split('T')[0];
                const dayWeather = weatherData[dateKey];
                
                // Check for holidays and working day leaves
                const hasHoliday = dayEvents.some(event => event.category === 'holiday');
                const hasWorkingDayLeave = dayEvents.some(event => event.isWorkingDayLeave);
                const isLeaveDay = hasHoliday || hasWorkingDayLeave;
                
                // Enhanced leave day styling
                const leaveGradient = isDarkMode 
                  ? 'bg-gradient-to-br from-red-900 to-red-800 dark:from-red-800 dark:to-red-900'
                  : 'bg-gradient-to-br from-red-50 to-red-100';
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`relative p-2 transition-all duration-200 cursor-pointer group overflow-hidden ${
                      isCurrentMonth 
                        ? isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50' 
                        : isDarkMode ? 'bg-gray-900 text-gray-600' : 'bg-gray-50 text-gray-400'
                    } ${isToday ? isDarkMode ? 'bg-blue-900 bg-opacity-40 ring-2 ring-blue-500' : 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : ''}
                    ${isSelected ? isDarkMode ? 'ring-2 ring-purple-500' : 'ring-2 ring-purple-400' : ''}
                    ${isLeaveDay ? `${leaveGradient} shadow-md` : ''}
                    ${dayEvents.length > 0 && !isLeaveDay ? 'shadow-sm' : ''}`}
                    onClick={() => handleDateClick(day)}
                    onDoubleClick={() => openNewEventModal(day)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(day)}
                  >
                    {/* Enhanced visual indicator for leaves */}
                    {isLeaveDay && (
                      <div className="absolute -right-6 -top-6 w-12 h-12 rotate-45 bg-red-500 shadow-md"></div>
                    )}
                    
                    <div className="flex items-center justify-between h-8 relative z-10">
                      <div className={`flex items-center justify-center transition-all ${
                        isToday 
                          ? 'h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-md' 
                          : isLeaveDay
                          ? 'h-8 w-8 rounded-full bg-red-500 text-white font-bold shadow-sm'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full h-7 w-7'
                      }`}>
                        <span className={`text-sm font-medium ${
                          isWeekend && isCurrentMonth && !isToday && !isLeaveDay
                            ? isDarkMode ? 'text-red-300' : 'text-red-500' 
                            : isLeaveDay ? 'text-white' : ''
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>
                      
                      {/* Weather display with enhanced styling */}
                      {dayWeather && isCurrentMonth && !isMobile && (
                        <span className="text-xs opacity-75 group-hover:opacity-100 transition-opacity bg-opacity-50 px-1 py-0.5 rounded backdrop-blur-sm">
                          {getWeatherIcon(dayWeather.condition)} {dayWeather.temp}°
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 space-y-1 max-h-[calc(100%-2.5rem)] overflow-hidden relative z-10">
                      {/* Enhanced event styling */}
                      {processedEvents.slice(0, 1).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs rounded-md px-2 py-1.5 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                            event.isWorkingDayLeave || event.category === 'holiday' 
                              ? `
                                bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold
                                border border-red-600 shadow-sm
                                hover:from-red-600 hover:to-red-700
                              `
                              : `
                                border-l-4 hover:shadow-lg hover:translate-x-0.5 hover:-translate-y-0.5
                                ${event.hasConflict ? 'ring-1 ring-orange-400 border-r-2 border-r-orange-400' : ''}
                              `
                          }`}
                          style={event.isWorkingDayLeave || event.category === 'holiday' ? {} : { 
                            backgroundColor: isDarkMode ? `${event.color}90` : `${event.color}25`,
                            color: isDarkMode ? 'white' : event.color,
                            borderLeftColor: event.color
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          <div className="flex items-center gap-1 min-h-[16px]">
                            {/* Enhanced leave indicator with animation */}
                            {(event.isWorkingDayLeave || event.category === 'holiday') && (
                              <span className="text-xs animate-pulse">🏢</span>
                            )}
                            
                            {/* Enhanced event category icons */}
                            {!event.isWorkingDayLeave && event.category !== 'holiday' && (
                              <>
                                {event.category === 'cultural' && <span className="text-[10px]">🎭</span>}
                                {event.category === 'religious' && <span className="text-[10px]">🕉️</span>}
                                {event.category === 'entertainment' && <span className="text-[10px]">🎬</span>}
                                {event.category === 'social' && <span className="text-[10px]">🎉</span>}
                                {event.category === 'health' && <span className="text-[10px]">🏥</span>}
                                {event.category === 'work' && <span className="text-[10px]">💼</span>}
                              </>
                            )}
                            
                            {/* Enhanced title styling */}
                            <span className={`leading-tight break-words flex-1 ${
                              event.isWorkingDayLeave || event.category === 'holiday'
                                ? 'font-semibold text-xs'
                                : 'font-semibold text-xs'
                            }`}>
                              {event.title}
                            </span>
                          </div>
                          
                          {/* Enhanced time display */}
                          {!isMobile && !event.isWorkingDayLeave && event.category !== 'holiday' && (
                            <div className="text-[10px] opacity-75 mt-1 flex items-center">
                              <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          )}
                          
                          {/* Enhanced leave day badge */}
                          {(event.isWorkingDayLeave || event.category === 'holiday') && (
                            <div className="flex items-center justify-center mt-1">
                              <span className="text-[10px] bg-white bg-opacity-30 text-white px-2 py-0.5 rounded-sm font-medium backdrop-blur-sm">
                                {event.leaveType?.toUpperCase() || 'HOLIDAY'}
                              </span>
                            </div>
                          )}
                          
                          {/* Enhanced event indicators with better styling */}
                          {!event.isWorkingDayLeave && event.category !== 'holiday' && (
                            <div className="flex items-center gap-1 mt-1">
                              {event.isRecurring && (
                                <span className="text-[8px] bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1 rounded-full">
                                  ↻
                                </span>
                              )}
                              {event.hasConflict && (
                                <span className="text-[8px] bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-1 rounded-full animate-pulse">
                                  !
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Enhanced "more events" indicator */}
                      {dayEvents.length > 1 && (
                        <motion.div 
                          className={`text-xs cursor-pointer flex items-center justify-between rounded-md px-2 py-1 transition-all ${
                            isDarkMode ? 'text-blue-400 bg-blue-500 bg-opacity-20 hover:bg-opacity-30' : 'text-blue-600 bg-blue-100 hover:bg-blue-200'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(day);
                            setSelectedDateEvents(dayEvents);
                            setShowEventsList(true);
                          }}
                          whileHover={{ scale: 1.05 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span className="font-medium">+{dayEvents.length - 1} more</span>
                          <span className={`text-[10px] h-4 w-4 inline-flex items-center justify-center rounded-full ${
                            isDarkMode ? 'bg-blue-500 bg-opacity-40 text-white' : 'bg-blue-200 text-blue-700'
                          } font-bold`}>
                            {dayEvents.length}
                          </span>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Enhanced leave day indicator */}
                    {isLeaveDay && (
                      <div className="absolute top-1 right-1 z-20">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full shadow-md">
                          L
                        </span>
                      </div>
                    )}
                    
                    {/* Enhanced event count indicator */}
                    {dayEvents.length > 3 && !isLeaveDay && (
                      <div className="absolute bottom-1 right-1 z-20">
                        <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full shadow-md ${
                          isDarkMode ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white' : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white'
                        }`}>
                          {dayEvents.length}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter((event, index, self) => 
      new Date(event.start).toDateString() === currentDate.toDateString() &&
      index === self.findIndex(e => 
        e.id === event.id || 
        (e.title === event.title && new Date(e.start).toDateString() === new Date(event.start).toDateString())
      )
    );
    
    return (
      <DayView
        date={currentDate}
        events={dayEvents}
        isDarkMode={isDarkMode}
        onEventClick={handleEventClick}
        onTimeSlotClick={openNewEventModal}
        weatherData={weatherData}
      />
    );
  };

  const renderWeekView = () => {
    const uniqueEvents = events.filter((event, index, self) => 
      index === self.findIndex(e => 
        e.id === event.id || 
        (e.title === event.title && new Date(e.start).toDateString() === new Date(event.start).toDateString())
      )
    );
    
    return (
      <WeekView
        date={currentDate}
        events={uniqueEvents}
        isDarkMode={isDarkMode}
        onEventClick={handleEventClick}
        onTimeSlotClick={openNewEventModal}
        weatherData={weatherData}
      />
    );
  };

  const renderYearView = () => {
    const uniqueEvents = events.filter((event, index, self) => 
      index === self.findIndex(e => 
        e.id === event.id || 
        (e.title === event.title && new Date(e.start).toDateString() === new Date(event.start).toDateString())
      )
    );
    
    return (
      <YearView
        date={currentDate}
        events={uniqueEvents}
        isDarkMode={isDarkMode}
        onDateClick={(date) => {
          setCurrentDate(date);
          setSelectedDate(date);
          setViewMode('day');
        }}
        onMonthClick={(date) => {
          setCurrentDate(date);
          setViewMode('month');
        }}
        weatherData={weatherData}
      />
    );
  };

  // Events List Modal for mobile
  const EventsListModal = () => (
    <AnimatePresence>
      {showEventsList && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEventsList(false)}
          />
          
          <motion.div
            className={`relative w-full max-w-md max-h-[70vh] overflow-y-auto rounded-t-xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
          >
            <div className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className="text-lg font-semibold">
                Events for {selectedDate.toLocaleDateString()}
              </h3>
              <button
                onClick={() => setShowEventsList(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {selectedDateEvents.map(event => (
                <motion.div
                  key={event.id}
                  className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{ borderLeftColor: event.color }}
                  onClick={() => {
                    setCurrentEvent(event);
                    setShowEventsList(false);
                    setShowEventModal(true);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm opacity-75 flex items-center mt-1">
                    <FaRegClock className="mr-1" />
                    {getEventTimeLabel(event)}
                  </div>
                  {event.location && (
                    <div className="text-sm opacity-75 flex items-center mt-1">
                      <FaMapMarkerAlt className="mr-1" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    {event.isRecurring && (
                      <span className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        <FaSyncAlt />
                        Recurring
                      </span>
                    )}
                    {event.hasVideoCall && (
                      <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        <FaVideo />
                        Video
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Event modal
  const EventModal = () => (
    <AnimatePresence>
      {showEventModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEventModal(false)}
          />
          
          <motion.div
            className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className="text-xl font-bold">
                {currentEvent.id ? 'Edit Event' : 'New Event'}
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Event Title</label>
                <input
                  type="text"
                  value={currentEvent.title}
                  onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter event title..."
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start</label>
                  <input
                    type="datetime-local"
                    value={currentEvent.start.toISOString().slice(0, 16)}
                    onChange={(e) => setCurrentEvent({...currentEvent, start: new Date(e.target.value)})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End</label>
                  <input
                    type="datetime-local"
                    value={currentEvent.end.toISOString().slice(0, 16)}
                    onChange={(e) => setCurrentEvent({...currentEvent, end: new Date(e.target.value)})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={currentEvent.description}
                  onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Event description..."
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2">
                  {['#6366F1', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCurrentEvent({...currentEvent, color})}
                      className={`w-8 h-8 rounded-full border-2 ${
                        currentEvent.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                      } transition-transform`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex justify-between p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                {currentEvent.id && (
                  <button
                    onClick={() => deleteEvent(currentEvent.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEventModal(false)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Event
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  useImperativeHandle(ref, () => ({
    goToToday,
    setViewMode,
    getCurrentDate: () => currentDate,
    getEvents: () => events,
    createNewEvent: (eventTemplate) => {
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 60 * 1000);
      
      setCurrentEvent({
        id: '',
        title: eventTemplate?.title || '',
        description: eventTemplate?.description || '',
        start: eventTemplate?.start || now,
        end: eventTemplate?.end || endTime,
        color: eventTemplate?.color || '#6366F1',
        location: eventTemplate?.location || '',
        isRecurring: eventTemplate?.isRecurring || false,
        recurrencePattern: eventTemplate?.recurrencePattern || 'daily',
        attendees: eventTemplate?.attendees || [],
        reminders: eventTemplate?.reminders || [{time: 30, unit: 'minutes'}],
        hasVideoCall: eventTemplate?.hasVideoCall || false,
        category: eventTemplate?.category || 'work',
        priority: eventTemplate?.priority || 'medium',
        tags: eventTemplate?.tags || [],
        url: eventTemplate?.url || '',
        notes: eventTemplate?.notes || ''
      });
      
      setShowEventModal(true);
    }
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-2 sm:p-4 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold truncate">
            {viewMode === 'month' 
              ? currentDate.toLocaleString('default', { 
                  month: window.innerWidth < 640 ? 'short' : 'long', 
                  year: 'numeric' 
                })
              : viewMode === 'week'
              ? `Week of ${currentDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: window.innerWidth < 640 ? undefined : 'numeric' 
                })}`
              : viewMode === 'day'
              ? currentDate.toLocaleDateString('en-US', { 
                  weekday: window.innerWidth < 640 ? 'short' : 'long', 
                  month: 'short', 
                  day: 'numeric', 
                  year: window.innerWidth < 640 ? undefined : 'numeric' 
                })
              : `${currentDate.getFullYear()}`
            }
          </h1>
          <button
            onClick={goToToday}
            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* View toggle - Mobile optimized */}
          <div className={`flex rounded-lg overflow-hidden ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setViewMode('year')}
              className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm transition-colors ${
                viewMode === 'year'
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">Year</span>
              <span className="sm:hidden">Y</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm transition-colors ${
                viewMode === 'month'
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">Month</span>
              <span className="sm:hidden">M</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm transition-colors ${
                viewMode === 'week'
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">Week</span>
              <span className="sm:hidden">W</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm transition-colors ${
                viewMode === 'day'
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaCalendarDay className="sm:mr-1" />
              <span className="hidden sm:inline">Day</span>
            </button>
          </div>

          {/* Navigation - Mobile optimized */}
          <div className="flex items-center space-x-1">
            <button
              onClick={goToPrevious}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              onClick={goToNext}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>

        
          <button
            onClick={() => openNewEventModal(selectedDate)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            <FaPlus className="text-sm" />
          </button>
        </div>
      </div>

    
      <div className="flex-1 overflow-hidden">
        {viewMode === 'year' && renderYearView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      <EventModal />
      <EventsListModal />
    </div>
  );
});

export default Calendar;
       
