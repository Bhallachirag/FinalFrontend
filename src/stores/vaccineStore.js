import { create } from 'zustand';

const transformVaccineData = (apiResponse) => {
  if (!apiResponse.success || !apiResponse.data) return [];
  
  const vaccines = [];
  apiResponse.data.forEach(vaccine => {
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

export const useVaccineStore = create((set, get) => ({
  vaccines: [],
  filteredVaccines: [],
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchVaccines: async () => {
    set({ loading: true, error: null });
    try {
      const VACCINE_SERVICE_PATH = import.meta.env.VITE_VACCINE_SERVICE_PATH || "http://localhost:4000";
      const response = await fetch(`${VACCINE_SERVICE_PATH}/api/v1/vaccines-with-inventory`);
      
      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.success) {
          const transformedVaccines = transformVaccineData(apiResponse);
          set({ 
            vaccines: transformedVaccines, 
            filteredVaccines: transformedVaccines,
            loading: false 
          });
        } else {
          throw new Error(apiResponse.message || 'API returned error');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      set({ 
        error: `API Error: ${error.message}`, 
        vaccines: [], 
        filteredVaccines: [],
        loading: false 
      });
    }
  },

  searchVaccines: async (searchTerm) => {
    const { vaccines } = get();
    if (!searchTerm.trim()) {
      set({ filteredVaccines: vaccines });
      return;
    }
    
    try {
      const VACCINE_SERVICE_PATH = "http://localhost:4000";
      const response = await fetch(
        `${VACCINE_SERVICE_PATH}/api/v1/vaccines-with-inventory?name=${encodeURIComponent(searchTerm)}`
      );
      
      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.success) {
          const transformedData = transformVaccineData(apiResponse);
          set({ filteredVaccines: transformedData });
          return;
        }
      }
    } catch (error) {
      console.warn('Search API failed, using client-side search:', error);
    }
    
    // Fallback to client-side search
    const filtered = vaccines.filter((vaccine) =>
      vaccine.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    set({ filteredVaccines: filtered });
  },

  filterVaccines: (filterType, value) => {
    const { vaccines } = get();
    let filtered = [...vaccines];

    if (filterType === "priceRange" && value) {
      if (value === "0-1000") {
        filtered = filtered.filter((v) => v.inventory.price <= 1000);
      } else if (value === "1000-3000") {
        filtered = filtered.filter((v) => v.inventory.price > 1000 && v.inventory.price <= 3000);
      } else if (value === "3000-5000") {
        filtered = filtered.filter((v) => v.inventory.price > 3000 && v.inventory.price <= 5000);
      } else if (value === "5000+") {
        filtered = filtered.filter((v) => v.inventory.price > 5000);
      }
    }

    if (filterType === "availability" && value) {
      if (value === "inStock") {
        filtered = filtered.filter((v) => v.inventory.quantity > 10);
      } else if (value === "lowStock") {
        filtered = filtered.filter((v) => v.inventory.quantity > 0 && v.inventory.quantity <= 10);
      }
    }

    if (filterType === "sortBy" && value) {
      if (value === "priceLowToHigh") {
        filtered.sort((a, b) => a.inventory.price - b.inventory.price);
      } else if (value === "priceHighToLow") {
        filtered.sort((a, b) => b.inventory.price - a.inventory.price);
      } else if (value === "nameAZ") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    set({ filteredVaccines: filtered });
  }
}));
