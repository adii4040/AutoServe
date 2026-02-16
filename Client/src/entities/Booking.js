// Booking entity - This is a stub implementation
// Replace with actual API calls when backend is ready

export class Booking {
  static async create(bookingData) {
    console.log('Create booking called:', bookingData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: Date.now(), ...bookingData });
      }, 500);
    });
  }

  static async getAll() {
    console.log('Get all bookings called');
    return [];
  }

  static async filter(filters, sortBy) {
    console.log('Filter bookings called:', filters, sortBy);
    return [];
  }

  static async getById(id) {
    console.log('Get booking by id:', id);
    return null;
  }

  static async update(id, data) {
    console.log('Update booking:', id, data);
    return { id, ...data };
  }
}
