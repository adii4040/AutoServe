// Provider entity
export class Provider {
  static async getAll() {
    console.log('Get all providers called');
    return [];
  }
  static async getById(id) {
    console.log('Get provider by id:', id);
    return null;
  }
  static async getNearby(latitude, longitude, radius) {
    console.log('Get nearby providers called:', { latitude, longitude, radius });
    return [];
  }
  static async create(providerData) {
    console.log('Create provider called:', providerData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: Date.now(), ...providerData });
      }, 500);
    });
  }
  static async update(id, data) {
    console.log('Update provider:', id, data);
    return { id, ...data };
  }
}
