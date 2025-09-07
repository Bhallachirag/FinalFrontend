import { API_ENDPOINTS } from '../utils/constants.js';

class VaccineService {
  constructor() {
    this.baseURL = API_ENDPOINTS.VACCINE_SERVICE;
  }

  async fetchVaccines() {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/vaccines-with-inventory`);
      
      if (response.ok) {
        const apiResponse = await response.json();
        return apiResponse;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('API fetch failed:', error.message);
      throw error;
    }
  }

  async searchVaccines(searchTerm) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/v1/vaccines-with-inventory?name=${encodeURIComponent(searchTerm)}`
      );
      
      if (response.ok) {
        const apiResponse = await response.json();
        return apiResponse;
      }
      throw new Error('Search failed');
    } catch (error) {
      console.warn('Search API failed:', error);
      throw error;
    }
  }

  async addVaccine(vaccineData, token) {
    try {
      //Create the vaccine
      const vaccineResponse = await fetch(`${this.baseURL}/api/v1/vaccine`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: vaccineData.name,
          ageGroup: vaccineData.ageGroup,
          description: vaccineData.description
        })
      });
      
      if (!vaccineResponse.ok) {
        throw new Error(`Failed to create vaccine: ${vaccineResponse.status}`);
      }
      
      const vaccineResult = await vaccineResponse.json();
      const newVaccine = vaccineResult.data;
      
      //Create inventory for the vaccine
      const inventoryResponse = await fetch(`${this.baseURL}/api/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vaccineId: newVaccine.id,
          quantity: parseInt(vaccineData.quantity),
          price: parseFloat(vaccineData.price),
          batchNumber: vaccineData.batchNumber,
          expiryDate: vaccineData.expiryDate,
          manufacturedDate: vaccineData.manufacturedDate,
          manufacturer: vaccineData.manufacturer
        })
      });
      
      if (!inventoryResponse.ok) {
        console.error('Failed to create inventory, but vaccine was created');
        throw new Error(`Failed to create inventory: ${inventoryResponse.status}`);
      }
      
      const inventoryResult = await inventoryResponse.json();
      
      // Return the vaccine with inventory
      return {
        ...newVaccine,
        Inventories: [inventoryResult.data]
      };
    } catch (error) {
      console.error('Error adding vaccine:', error);
      throw error;
    }
  }

  async updateVaccine(vaccineId, updatedData, token) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/vaccine/${vaccineId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating vaccine:', error);
      throw error;
    }
  }

  async updateInventory(inventoryId, updatedData, token) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/inventory/${inventoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  async deleteVaccine(vaccineId, token) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/vaccine/${vaccineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting vaccine:', error);
      throw error;
    }
  }
}

export default new VaccineService();