import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, EmergencyAlert, VaccinationRecord, MealMenuItem, NutritionRecommendation, GovernmentFunding, TreatmentRecord, PrescribedMeal } from '@/types/healthcare';
import { mockUsers, mockEmergencyAlerts, mockVaccinationRecords, mockMealMenu, mockNutritionRecommendations, mockGovernmentFunding, mockTreatmentRecords, mockPrescribedMeals } from '@/data/mockData';
import { generatePatientId, initializeCounters } from '@/utils/patientIdGenerator';

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
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  loginRecords: LoginRecord[];
  setLoginRecords: React.Dispatch<React.SetStateAction<LoginRecord[]>>;
  emergencyAlerts: EmergencyAlert[];
  setEmergencyAlerts: React.Dispatch<React.SetStateAction<EmergencyAlert[]>>;
  vaccinationRecords: VaccinationRecord[];
  setVaccinationRecords: React.Dispatch<React.SetStateAction<VaccinationRecord[]>>;
  treatmentRecords: TreatmentRecord[];
  setTreatmentRecords: React.Dispatch<React.SetStateAction<TreatmentRecord[]>>;
  mealMenu: MealMenuItem[];
  setMealMenu: React.Dispatch<React.SetStateAction<MealMenuItem[]>>;
  prescribedMeals: PrescribedMeal[];
  setPrescribedMeals: React.Dispatch<React.SetStateAction<PrescribedMeal[]>>;
  nutritionRecommendations: NutritionRecommendation[];
  setNutritionRecommendations: React.Dispatch<React.SetStateAction<NutritionRecommendation[]>>;
  governmentFunding: GovernmentFunding[];
  setGovernmentFunding: React.Dispatch<React.SetStateAction<GovernmentFunding[]>>;
  triggerEmergencyAlert: (alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => void;
  loginUser: (user: User) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initialize counters from existing mock data
initializeCounters(mockUsers.map(u => u.patientId));

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(mockEmergencyAlerts);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>(mockVaccinationRecords);
  const [treatmentRecords, setTreatmentRecords] = useState<TreatmentRecord[]>(mockTreatmentRecords);
  const [mealMenu, setMealMenu] = useState<MealMenuItem[]>(mockMealMenu);
  const [prescribedMeals, setPrescribedMeals] = useState<PrescribedMeal[]>(mockPrescribedMeals);
  const [nutritionRecommendations, setNutritionRecommendations] = useState<NutritionRecommendation[]>(mockNutritionRecommendations);
  const [governmentFunding, setGovernmentFunding] = useState<GovernmentFunding[]>(mockGovernmentFunding);

  const triggerEmergencyAlert = (alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => {
    const newAlert: EmergencyAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'active',
    };
    setEmergencyAlerts(prev => [newAlert, ...prev]);
  };

  const loginUser = (user: User) => {
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
      users,
      setUsers,
      loginRecords,
      setLoginRecords,
      emergencyAlerts,
      setEmergencyAlerts,
      vaccinationRecords,
      setVaccinationRecords,
      treatmentRecords,
      setTreatmentRecords,
      mealMenu,
      setMealMenu,
      prescribedMeals,
      setPrescribedMeals,
      nutritionRecommendations,
      setNutritionRecommendations,
      governmentFunding,
      setGovernmentFunding,
      triggerEmergencyAlert,
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
