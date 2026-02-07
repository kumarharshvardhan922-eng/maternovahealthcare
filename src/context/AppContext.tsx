import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/types/healthcare';
import { generatePatientId, initializeCounters } from '@/utils/patientIdGenerator';
import { useProfiles, Profile } from '@/hooks/useProfiles';
import { useEmergencyAlerts, EmergencyAlert } from '@/hooks/useEmergencyAlerts';
import { useVaccinationRecords, VaccinationRecord } from '@/hooks/useVaccinationRecords';
import { useTreatmentRecords, TreatmentRecord } from '@/hooks/useTreatmentRecords';
import { usePrescribedMeals, PrescribedMeal } from '@/hooks/usePrescribedMeals';
import { useNutritionRecommendations, NutritionRecommendation } from '@/hooks/useNutritionRecommendations';
import { useGovernmentFunding, GovernmentFunding } from '@/hooks/useGovernmentFunding';

export interface User {
  id: string;
  patientId: string;
  name: string;
  role: UserRole;
  phone: string;
  village?: string;
  assignedAshaId?: string;
  loginTime?: Date;
}

interface LoginRecord {
  id: string;
  patientId: string;
  userName: string;
  userRole: UserRole;
  loginTime: Date;
  village?: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Profiles (Users)
  profiles: Profile[];
  profilesLoading: boolean;
  addProfile: (profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => Promise<Profile | null>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<Profile | null>;
  
  // Emergency Alerts
  emergencyAlerts: EmergencyAlert[];
  alertsLoading: boolean;
  addEmergencyAlert: (alert: Omit<EmergencyAlert, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<EmergencyAlert | null>;
  updateEmergencyAlert: (id: string, updates: Partial<EmergencyAlert>) => Promise<EmergencyAlert | null>;
  deleteEmergencyAlert: (id: string) => Promise<void>;
  
  // Vaccination Records
  vaccinationRecords: VaccinationRecord[];
  vaccinationsLoading: boolean;
  addVaccinationRecord: (record: Omit<VaccinationRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<VaccinationRecord | null>;
  updateVaccinationRecord: (id: string, updates: Partial<VaccinationRecord>) => Promise<VaccinationRecord | null>;
  deleteVaccinationRecord: (id: string) => Promise<void>;
  
  // Treatment Records
  treatmentRecords: TreatmentRecord[];
  treatmentsLoading: boolean;
  addTreatmentRecord: (record: Omit<TreatmentRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<TreatmentRecord | null>;
  updateTreatmentRecord: (id: string, updates: Partial<TreatmentRecord>) => Promise<TreatmentRecord | null>;
  deleteTreatmentRecord: (id: string) => Promise<void>;
  
  // Prescribed Meals
  prescribedMeals: PrescribedMeal[];
  mealsLoading: boolean;
  addPrescribedMeal: (meal: Omit<PrescribedMeal, 'id' | 'created_at' | 'updated_at'>) => Promise<PrescribedMeal | null>;
  updatePrescribedMeal: (id: string, updates: Partial<PrescribedMeal>) => Promise<PrescribedMeal | null>;
  deletePrescribedMeal: (id: string) => Promise<void>;
  
  // Nutrition Recommendations
  nutritionRecommendations: NutritionRecommendation[];
  nutritionLoading: boolean;
  addNutritionRecommendation: (recommendation: Omit<NutritionRecommendation, 'id' | 'created_at' | 'updated_at'>) => Promise<NutritionRecommendation | null>;
  updateNutritionRecommendation: (id: string, updates: Partial<NutritionRecommendation>) => Promise<NutritionRecommendation | null>;
  deleteNutritionRecommendation: (id: string) => Promise<void>;
  
  // Government Funding
  governmentFunding: GovernmentFunding[];
  fundingLoading: boolean;
  addGovernmentFunding: (funding: Omit<GovernmentFunding, 'id' | 'created_at' | 'updated_at'>) => Promise<GovernmentFunding | null>;
  updateGovernmentFunding: (id: string, updates: Partial<GovernmentFunding>) => Promise<GovernmentFunding | null>;
  deleteGovernmentFunding: (id: string) => Promise<void>;
  
  // Login Records (kept in state for session)
  loginRecords: LoginRecord[];
  
  // Actions
  loginUser: (user: User) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);

  // Database hooks
  const { 
    profiles, 
    loading: profilesLoading, 
    addProfile, 
    updateProfile 
  } = useProfiles();
  
  const { 
    alerts: emergencyAlerts, 
    loading: alertsLoading, 
    addAlert: addEmergencyAlert, 
    updateAlert: updateEmergencyAlert, 
    deleteAlert: deleteEmergencyAlert 
  } = useEmergencyAlerts();
  
  const { 
    records: vaccinationRecords, 
    loading: vaccinationsLoading, 
    addRecord: addVaccinationRecord, 
    updateRecord: updateVaccinationRecord, 
    deleteRecord: deleteVaccinationRecord 
  } = useVaccinationRecords();
  
  const { 
    records: treatmentRecords, 
    loading: treatmentsLoading, 
    addRecord: addTreatmentRecord, 
    updateRecord: updateTreatmentRecord, 
    deleteRecord: deleteTreatmentRecord 
  } = useTreatmentRecords();
  
  const { 
    meals: prescribedMeals, 
    loading: mealsLoading, 
    addMeal: addPrescribedMeal, 
    updateMeal: updatePrescribedMeal, 
    deleteMeal: deletePrescribedMeal 
  } = usePrescribedMeals();
  
  const { 
    recommendations: nutritionRecommendations, 
    loading: nutritionLoading, 
    addRecommendation: addNutritionRecommendation, 
    updateRecommendation: updateNutritionRecommendation, 
    deleteRecommendation: deleteNutritionRecommendation 
  } = useNutritionRecommendations();
  
  const { 
    funding: governmentFunding, 
    loading: fundingLoading, 
    addFunding: addGovernmentFunding, 
    updateFunding: updateGovernmentFunding, 
    deleteFunding: deleteGovernmentFunding 
  } = useGovernmentFunding();

  // Initialize counters from existing profiles
  React.useEffect(() => {
    if (profiles.length > 0) {
      initializeCounters(profiles.map(p => p.patient_id));
    }
  }, [profiles]);

  const loginUser = async (user: User) => {
    const loginTime = new Date();
    const userWithLoginTime = { ...user, loginTime };
    
    // Create login record
    const loginRecord: LoginRecord = {
      id: Date.now().toString(),
      patientId: user.patientId,
      userName: user.name,
      userRole: user.role,
      loginTime,
      village: user.village,
    };
    
    setLoginRecords(prev => [loginRecord, ...prev]);
    setCurrentUser(userWithLoginTime);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      
      profiles,
      profilesLoading,
      addProfile,
      updateProfile,
      
      emergencyAlerts,
      alertsLoading,
      addEmergencyAlert,
      updateEmergencyAlert,
      deleteEmergencyAlert,
      
      vaccinationRecords,
      vaccinationsLoading,
      addVaccinationRecord,
      updateVaccinationRecord,
      deleteVaccinationRecord,
      
      treatmentRecords,
      treatmentsLoading,
      addTreatmentRecord,
      updateTreatmentRecord,
      deleteTreatmentRecord,
      
      prescribedMeals,
      mealsLoading,
      addPrescribedMeal,
      updatePrescribedMeal,
      deletePrescribedMeal,
      
      nutritionRecommendations,
      nutritionLoading,
      addNutritionRecommendation,
      updateNutritionRecommendation,
      deleteNutritionRecommendation,
      
      governmentFunding,
      fundingLoading,
      addGovernmentFunding,
      updateGovernmentFunding,
      deleteGovernmentFunding,
      
      loginRecords,
      loginUser,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
