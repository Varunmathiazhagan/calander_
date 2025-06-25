import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, 
  FaVideo, FaSyncAlt, FaBell, FaPalette, FaSave, FaTrash,
  FaPlus, FaMinus, FaGlobe, FaFileAlt, FaTags, FaExclamationTriangle
} from 'react-icons/fa';

const EventModal = ({ 
  isOpen, 
  onClose, 
  event, 
  onSave, 
  onDelete, 
  isDarkMode,
  allEvents = []
}) => {
  const [formData, setFormData] = useState({
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
    reminders: [{ time: 30, unit: 'minutes' }],
    hasVideoCall: false,
    category: 'work',
    priority: 'medium',
    tags: [],
    url: '',
    notes: ''
  });

  const [newAttendee, setNewAttendee] = useState('');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);

  const colorOptions = [
    '#6366F1', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6',
    '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#84CC16'
  ];

  const categoryOptions = [
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'social', label: 'Social', icon: '🎉' },
    { value: 'training', label: 'Training', icon: '📚' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'holiday', label: 'Holiday', icon: '🏛️' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' }
  ];

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        attendees: event.attendees || [],
        reminders: event.reminders || [{ time: 30, unit: 'minutes' }],
        category: event.category || 'work',
        priority: event.priority || 'medium',
        tags: event.tags || [],
        url: event.url || '',
        notes: event.notes || ''
      });
    } else {
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        start: now,
        end: endTime
      }));
    }
  }, [event]);

  useEffect(() => {
    checkConflicts();
  }, [formData.start, formData.end, allEvents]);

  const checkConflicts = () => {
    const eventConflicts = allEvents.filter(existingEvent => {
      if (existingEvent.id === formData.id) return false;
      
      const existingStart = new Date(existingEvent.start);
      const existingEnd = new Date(existingEvent.end);
      
      return (
        (formData.start < existingEnd && formData.end > existingStart)
      );
    });
    
    setConflicts(eventConflicts);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.start >= formData.end) {
      newErrors.time = 'End time must be after start time';
    }
    
    if (formData.attendees.some(email => !email.includes('@'))) {
      newErrors.attendees = 'Please enter valid email addresses';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addAttendee = () => {
    if (newAttendee.trim() && newAttendee.includes('@')) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()]
      }));
      setNewAttendee('');
    }
  };

  const removeAttendee = (index) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { time: 15, unit: 'minutes' }]
    }));
  };

  const updateReminder = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map((reminder, i) => 
        i === index ? { ...reminder, [field]: value } : reminder
      )
    }));
  };

  const removeReminder = (index) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Enhanced backdrop with blur effect */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Enhanced modal with improved mobile layout */}
        <motion.div
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Enhanced header with gradient background */}
          <div className={`flex items-center justify-between p-6 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700' 
              : 'bg-gradient-to-r from-white to-gray-50 border-b border-gray-200'
          }`}>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaCalendarAlt className={isDarkMode ? "text-blue-400" : "text-blue-500"} />
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Enhanced conflicts warning with animation */}
          {conflicts.length > 0 && (
            <motion.div 
              className="p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <FaExclamationTriangle className="animate-pulse" />
                <span className="font-medium">Schedule Conflict Detected</span>
              </div>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>This event overlaps with {conflicts.length} other event(s):</p>
                <ul className="mt-1 ml-4 space-y-1">
                  {conflicts.map(conflict => (
                    <li key={conflict.id} className="flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-yellow-500 rounded-full"></span>
                      <span>{conflict.title} ({new Date(conflict.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(conflict.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Form with improved mobile layout */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title and Category - Responsive grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  <FaFileAlt className="inline mr-2" />
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } ${errors.title ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Enter event title..."
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaTags className="inline mr-2" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time - Responsive layout */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaClock className="inline mr-2" />
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.start.toISOString().slice(0, 16)}
                  onChange={(e) => handleInputChange('start', new Date(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaClock className="inline mr-2" />
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end.toISOString().slice(0, 16)}
                  onChange={(e) => handleInputChange('end', new Date(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } ${errors.time ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Description with responsive height */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                placeholder="Event description..."
              />
            </div>

            {/* Location and URL - Responsive layout */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Event location..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaGlobe className="inline mr-2" />
                  URL/Link
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Enhanced color selector with animation */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FaPalette className="inline mr-2" />
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map(color => (
                  <motion.button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange('color', color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                      scale: formData.color === color ? 1.1 : 1,
                      boxShadow: formData.color === color ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Actions - Responsive layout */}
            <div className="flex flex-wrap justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
              <div>
                {event && (
                  <motion.button
                    type="button"
                    onClick={() => onDelete(event.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaTrash className="text-sm" /> 
                    <span>Delete</span>
                  </motion.button>
                )}
              </div>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaSave className="text-sm" /> 
                  <span>Save Event</span>
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;
