/**
 * Time Utilities - Convert raw timestamps into semantic time buckets
 * 
 * Transforms clock time into cognitive categories that ML models can use
 */

/**
 * Get semantic time bucket from timestamp
 * @param {Date} timestamp - The timestamp to analyze
 * @returns {Object} Time bucket information
 */
export function getTimeBucket(timestamp = new Date()) {
  const hour = timestamp.getHours();
  const dayOfWeek = timestamp.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Determine time of day bucket
  let timeOfDay;
  let energyLevel;
  
  if (hour >= 5 && hour < 9) {
    timeOfDay = 'early_morning';
    energyLevel = 0.6;
  } else if (hour >= 9 && hour < 12) {
    timeOfDay = 'morning';
    energyLevel = 0.9;
  } else if (hour >= 12 && hour < 14) {
    timeOfDay = 'midday';
    energyLevel = 0.7;
  } else if (hour >= 14 && hour < 17) {
    timeOfDay = 'afternoon';
    energyLevel = 0.8;
  } else if (hour >= 17 && hour < 20) {
    timeOfDay = 'evening';
    energyLevel = 0.7;
  } else if (hour >= 20 && hour < 23) {
    timeOfDay = 'night';
    energyLevel = 0.5;
  } else {
    timeOfDay = 'late_night';
    energyLevel = 0.3;
  }

  // Determine work context
  let workContext;
  if (isWeekend) {
    workContext = 'weekend';
  } else if (hour >= 9 && hour < 17) {
    workContext = 'work_hours';
  } else {
    workContext = 'off_hours';
  }

  return {
    timeOfDay,
    hour,
    isWeekend,
    workContext,
    energyLevel,
    dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek],
  };
}

/**
 * Adjust time bucket based on user chronotype
 * @param {Object} timeBucket - Base time bucket
 * @param {string} chronotype - User's chronotype (morning/evening/neutral)
 * @returns {Object} Adjusted time bucket with chronotype consideration
 */
export function adjustForChronotype(timeBucket, chronotype = 'neutral') {
  const adjusted = { ...timeBucket };

  if (chronotype === 'morning') {
    // Morning people have higher energy in early hours
    if (timeBucket.timeOfDay === 'early_morning' || timeBucket.timeOfDay === 'morning') {
      adjusted.energyLevel = Math.min(1.0, timeBucket.energyLevel + 0.2);
    }
    if (timeBucket.timeOfDay === 'night' || timeBucket.timeOfDay === 'late_night') {
      adjusted.energyLevel = Math.max(0.1, timeBucket.energyLevel - 0.2);
    }
  } else if (chronotype === 'evening') {
    // Evening people have higher energy in later hours
    if (timeBucket.timeOfDay === 'evening' || timeBucket.timeOfDay === 'night') {
      adjusted.energyLevel = Math.min(1.0, timeBucket.energyLevel + 0.2);
    }
    if (timeBucket.timeOfDay === 'early_morning') {
      adjusted.energyLevel = Math.max(0.1, timeBucket.energyLevel - 0.2);
    }
  }

  adjusted.chronotypeAdjusted = chronotype !== 'neutral';
  
  return adjusted;
}
