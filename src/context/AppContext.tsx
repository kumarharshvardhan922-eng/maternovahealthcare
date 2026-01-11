import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, EmergencyAlert, VaccinationRecord, MealMenuItem, NutritionRecommendation, GovernmentFunding, TreatmentRecord } from '@/types/healthcare';
import { mockUsers, mockEmergencyAlerts, mockVaccinationRecords, mockMealMenu, mockNutritionRecommendations, mockGovernmentFunding, mockTreatmentRecords } from '@/data/mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  emergencyAlerts: EmergencyAlert[];
  setEmergencyAlerts: React.Dispatch<React.SetStateAction<EmergencyAlert[]>>;
  vaccinationRecords: VaccinationRecord[];
  setVaccinationRecords: React.Dispatch<React.SetStateAction<VaccinationRecord[]>>;
  treatmentRecords: TreatmentRecord[];
  setTreatmentRecords: React.Dispatch<React.SetStateAction<TreatmentRecord[]>>;
  mealMenu: MealMenuItem[];
  setMealMenu: React.Dispatch<React.SetStateAction<MealMenuItem[]>>;
  nutritionRecommendations: NutritionRecommendation[];
  setNutritionRecommendations: React.Dispatch<React.SetStateAction<NutritionRecommendation[]>>;
  governmentFunding: GovernmentFunding[];
  setGovernmentFunding: React.Dispatch<React.SetStateAction<GovernmentFunding[]>>;
  triggerEmergencyAlert: (alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(mockEmergencyAlerts);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>(mockVaccinationRecords);
  const [treatmentRecords, setTreatmentRecords] = useState<TreatmentRecord[]>(mockTreatmentRecords);
  const [mealMenu, setMealMenu] = useState<MealMenuItem[]>(mockMealMenu);
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

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      setUsers,
      emergencyAlerts,
      setEmergencyAlerts,
      vaccinationRecords,
      setVaccinationRecords,
      treatmentRecords,
      setTreatmentRecords,
      mealMenu,
      setMealMenu,
      nutritionRecommendations,
      setNutritionRecommendations,
      governmentFunding,
      setGovernmentFunding,
      triggerEmergencyAlert,
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
