export const getVaccinePrice = (vaccine) => {
  if (vaccine.price) return vaccine.price;
  if (vaccine.Inventories && vaccine.Inventories.length > 0) {
    return vaccine.Inventories[0].price;
  }
  return 'N/A';
};

// Extract vaccine quantity from vaccine data
export const getVaccineQuantity = (vaccine) => {
  if (vaccine.quantity) return vaccine.quantity;
  if (vaccine.Inventories && vaccine.Inventories.length > 0) {
    return vaccine.Inventories.reduce((total, inv) => total + (inv.quantity || 0), 0);
  }
  return 'N/A';
};

// Get inventory details
export const getInventoryDetails = (vaccine) => {
  if (vaccine.Inventories && vaccine.Inventories.length > 0) {
    return vaccine.Inventories[0];
  }
  return null;
};

// Extract user name from user data
export const extractUserName = (userData) => {
  if (!userData) return 'Unknown User';
  
  if (userData.email && userData.email.includes('@')) {
    const namePart = userData.email.split('@')[0];
    return namePart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return `User ${userData.id}`;
};

// Extract vaccine name from booking
export const extractVaccineName = (booking) => {
  return booking.vaccineName || booking.vaccine || 'N/A';
};

// Format date and time from createdAt
export const extractDateTimeFromCreatedAt = (createdAt) => {
  if (!createdAt) return { date: 'N/A', time: 'N/A', dateObj: null };
  
  try {
    const dateObj = new Date(createdAt);
    const date = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const time = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return { date, time, dateObj };
  } catch (error) {
    console.error('Date parsing error:', error);
    return { date: 'N/A', time: 'N/A', dateObj: null };
  }
};

// Format date for grouping
export const formatDateForGrouping = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return 'Unknown Date';
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const bookingDate = new Date(dateObj);
  bookingDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  
  if (bookingDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (bookingDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Group bookings by date
export const groupBookingsByDate = (bookings) => {
  const grouped = {};
  
  if (!Array.isArray(bookings)) {
    return { grouped: {}, sortedDateKeys: [] };
  }
  
  bookings.forEach(booking => {
    const { dateObj } = extractDateTimeFromCreatedAt(booking.createdAt);
    const dateKey = formatDateForGrouping(dateObj);
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(booking);
  });
  
  // Sort each group by time (latest first)
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  });
  
  // Sort date keys (latest dates first)
  const sortedDateKeys = Object.keys(grouped).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday' && b !== 'Today') return -1;
    if (b === 'Yesterday' && a !== 'Today') return 1;
    
    // For other dates, try to parse and compare
    try {
      const dateA = new Date(a);
      const dateB = new Date(b);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateB - dateA;
      }
    } catch (error) {
      console.error('Date sorting error:', error);
    }
    
    return a.localeCompare(b);
  });
  
  return { grouped, sortedDateKeys };
};

// Transform database response to frontend format
export const transformVaccineData = (apiResponse) => {
  if (!apiResponse.success || !apiResponse.data) {
    return [];
  }

  const vaccines = [];
  
  apiResponse.data.forEach(vaccine => {
    // Handle vaccines with multiple inventory entries
    if (vaccine.Inventories && vaccine.Inventories.length > 0) {
      vaccine.Inventories.forEach(inventory => {
        vaccines.push({
          id: `${vaccine.id}-${inventory.id}`,
          vaccineId: vaccine.id,
          name: vaccine.name,
          mrp: vaccine.mrp || inventory.price,
          imageUrl: vaccine.imageUrl,
          createdAt: vaccine.createdAt,
          updatedAt: vaccine.updatedAt,
          inventory: {
            id: inventory.id,
            batchNumber: inventory.batchNumber,
            quantity: inventory.quantity,
            expiryDate: inventory.expiryDate,
            price: inventory.price,
            vaccineId: inventory.vaccineId,
            createdAt: inventory.createdAt,
            updatedAt: inventory.updatedAt,
          }
        });
      });
    }
  });
  
  return vaccines;
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format price
export const formatPrice = (price) => {
  if (!price) return '0.00';
  return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
};