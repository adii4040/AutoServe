// Fault entity
export class Fault {
  static async getAll() {
    console.log('Get all faults called');
    return [];
  }
  static async getById(id) {
    console.log('Get fault by id:', id);
    return null;
  }
  static async create(faultData) {
    console.log('Create fault called:', faultData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: Date.now(), ...faultData });
      }, 500);
    });
  }
  static async update(id, data) {
    console.log('Update fault:', id, data);
    return { id, ...data };
  }
  static async delete(id) {
    console.log('Delete fault:', id);
    return true;
  }
}
