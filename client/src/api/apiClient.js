// Mock API Client for MediFlow
// This replaces base44 with a simple localStorage-based mock

const STORAGE_KEY = 'mediflow_data';
const AUTH_KEY = 'mediflow_auth';

// Initialize mock data
const initData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      hospitals: [],
      staff: [],
      patients: [],
      appointments: [],
      prescriptions: [],
      medicalRecords: []
    }));
  }
};

initData();

// Helper functions
const getData = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
const saveData = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock API Client
export const apiClient = {
  auth: {
    isAuthenticated: () => {
      return !!localStorage.getItem(AUTH_KEY);
    },
    
    me: async () => {
      const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
      return auth.user || { email: 'admin@demo.com' };
    },
    
    login: async ({ email, password }) => {
      // Mock login - accepts any email/password
      const data = getData();
      
      // Find staff by email
      const staff = data.staff.find(s => s.user_email === email);
      
      if (!staff) {
        throw new Error('User not found. Please register your hospital first.');
      }
      
      const authData = {
        user: { email, id: generateId() },
        token: generateId(),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      return authData;
    },
    
    logout: () => {
      localStorage.removeItem(AUTH_KEY);
      window.location.href = '/';
    }
  },
  
  entities: {
    Hospital: {
      filter: async (query) => {
        const data = getData();
        let results = data.hospitals || [];
        
        if (query.id) {
          results = results.filter(h => h.id === query.id);
        }
        if (query.license_number) {
          results = results.filter(h => h.license_number === query.license_number);
        }
        
        return results;
      },
      
      create: async (hospitalData) => {
        const data = getData();
        const newHospital = {
          ...hospitalData,
          id: generateId(),
          created_date: new Date().toISOString()
        };
        data.hospitals.push(newHospital);
        saveData(data);
        return newHospital;
      },
      
      update: async (id, updates) => {
        const data = getData();
        const index = data.hospitals.findIndex(h => h.id === id);
        if (index !== -1) {
          data.hospitals[index] = { ...data.hospitals[index], ...updates };
          saveData(data);
          return data.hospitals[index];
        }
        throw new Error('Hospital not found');
      }
    },
    
    HospitalStaff: {
      filter: async (query) => {
        const data = getData();
        let results = data.staff || [];
        
        if (query.user_email) {
          results = results.filter(s => s.user_email === query.user_email);
        }
        if (query.hospital_id) {
          results = results.filter(s => s.hospital_id === query.hospital_id);
        }
        if (query.role) {
          results = results.filter(s => s.role === query.role);
        }
        
        return results;
      },
      
      create: async (staffData) => {
        const data = getData();
        const newStaff = {
          ...staffData,
          id: generateId(),
          created_date: new Date().toISOString()
        };
        data.staff.push(newStaff);
        saveData(data);
        return newStaff;
      },
      
      update: async (id, updates) => {
        const data = getData();
        const index = data.staff.findIndex(s => s.id === id);
        if (index !== -1) {
          data.staff[index] = { ...data.staff[index], ...updates };
          saveData(data);
          return data.staff[index];
        }
        throw new Error('Staff not found');
      }
    },
    
    Patient: {
      filter: async (query) => {
        const data = getData();
        let results = data.patients || [];
        
        if (query.hospital_id) {
          results = results.filter(p => p.hospital_id === query.hospital_id);
        }
        if (query.pan_number) {
          results = results.filter(p => p.pan_number === query.pan_number);
        }
        if (query.aadhaar_number) {
          results = results.filter(p => p.aadhaar_number === query.aadhaar_number);
        }
        
        return results;
      },
      
      create: async (patientData) => {
        const data = getData();
        const newPatient = {
          ...patientData,
          id: generateId(),
          created_date: new Date().toISOString()
        };
        data.patients.push(newPatient);
        saveData(data);
        return newPatient;
      },
      
      update: async (id, updates) => {
        const data = getData();
        const index = data.patients.findIndex(p => p.id === id);
        if (index !== -1) {
          data.patients[index] = { ...data.patients[index], ...updates };
          saveData(data);
          return data.patients[index];
        }
        throw new Error('Patient not found');
      }
    },
    
    Appointment: {
      filter: async (query) => {
        const data = getData();
        let results = data.appointments || [];
        
        if (query.hospital_id) {
          results = results.filter(a => a.hospital_id === query.hospital_id);
        }
        
        return results;
      },
      
      create: async (appointmentData) => {
        const data = getData();
        const newAppointment = {
          ...appointmentData,
          id: generateId(),
          created_date: new Date().toISOString()
        };
        data.appointments.push(newAppointment);
        saveData(data);
        return newAppointment;
      },
      
      update: async (id, updates) => {
        const data = getData();
        const index = data.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
          data.appointments[index] = { ...data.appointments[index], ...updates };
          saveData(data);
          return data.appointments[index];
        }
        throw new Error('Appointment not found');
      }
    },
    
    Prescription: {
      filter: async (query) => {
        const data = getData();
        let results = data.prescriptions || [];
        
        if (query.hospital_id) {
          results = results.filter(p => p.hospital_id === query.hospital_id);
        }
        
        return results;
      },
      
      create: async (prescriptionData) => {
        const data = getData();
        const newPrescription = {
          ...prescriptionData,
          id: generateId(),
          created_date: new Date().toISOString()
        };
        data.prescriptions.push(newPrescription);
        saveData(data);
        return newPrescription;
      },
      
      update: async (id, updates) => {
        const data = getData();
        const index = data.prescriptions.findIndex(p => p.id === id);
        if (index !== -1) {
          data.prescriptions[index] = { ...data.prescriptions[index], ...updates };
          saveData(data);
          return data.prescriptions[index];
        }
        throw new Error('Prescription not found');
      }
    },
    
    MedicalRecord: {
      filter: async (query) => {
        const data = getData();
        let results = data.medicalRecords || [];
        
        if (query.patient_pan) {
          results = results.filter(r => r.patient_pan === query.patient_pan);
        }
        if (query.patient_aadhaar) {
          results = results.filter(r => r.patient_aadhaar === query.patient_aadhaar);
        }
        
        return results;
      },
      
      create: async (recordData) => {
        const data = getData();
        const newRecord = {
          ...recordData,
          id: generateId(),
          created_date: new Date().toISOString()
        };
        data.medicalRecords.push(newRecord);
        saveData(data);
        return newRecord;
      }
    }
  },
  
  integrations: {
    Core: {
      SendEmail: async (emailData) => {
        console.log('Email would be sent:', emailData);
        return { success: true };
      }
    }
  }
};