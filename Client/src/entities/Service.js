// Service entity
export class Service {
  static async getAll() {
    console.log('Get all services called');
    return [];
  }
  static async getByCategory(category) {
    console.log('Get services by category:', category);
    return [];
  }
  static async getById(id) {
    console.log('Get service by id:', id);
    return null;
  }
  static async create(serviceData) {
    console.log('Create service called:', serviceData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: Date.now(), ...serviceData });
      }, 500);
    });
  }
}
