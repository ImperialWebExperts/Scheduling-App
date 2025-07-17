// src/app/lib/formatTime.ts
export const formatToPacificTime = (date: Date | string, options?: {
  includeSeconds?: boolean;
  dateOnly?: boolean;
  timeOnly?: boolean;
}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (options?.dateOnly) {
    return dateObj.toLocaleDateString('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  if (options?.timeOnly) {
    return dateObj.toLocaleTimeString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: '2-digit',
      minute: '2-digit',
      ...(options.includeSeconds && { second: '2-digit' })
    });
  }
  
  return dateObj.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(options?.includeSeconds && { second: '2-digit' })
  });
};

// More flexible function for different timezones
export const formatToTimezone = (
  date: Date | string, 
  timezone: string = 'America/Los_Angeles',
  options?: {
    includeSeconds?: boolean;
    dateOnly?: boolean;
    timeOnly?: boolean;
    format?: 'short' | 'long' | 'full';
  }
) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const baseOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
  };
  
  if (options?.dateOnly) {
    return dateObj.toLocaleDateString('en-US', {
      ...baseOptions,
      year: 'numeric',
      month: options.format === 'long' ? 'long' : '2-digit',
      day: '2-digit'
    });
  }
  
  if (options?.timeOnly) {
    return dateObj.toLocaleTimeString('en-US', {
      ...baseOptions,
      hour: '2-digit',
      minute: '2-digit',
      ...(options.includeSeconds && { second: '2-digit' })
    });
  }
  
  return dateObj.toLocaleString('en-US', {
    ...baseOptions,
    year: 'numeric',
    month: options?.format === 'long' ? 'long' : '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(options?.includeSeconds && { second: '2-digit' })
  });
};

// Helper for relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: Date | string, timezone: string = 'America/Los_Angeles') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  // Fall back to formatted date for older items
  return formatToTimezone(dateObj, timezone, { format: 'short' });
};