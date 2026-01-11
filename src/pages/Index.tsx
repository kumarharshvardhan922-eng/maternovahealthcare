import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import EmergencySection from '@/components/EmergencySection';
import VaccinationSection from '@/components/VaccinationSection';
import TreatmentSection from '@/components/TreatmentSection';
import MealMenuSection from '@/components/MealMenuSection';
import NutritionSection from '@/components/NutritionSection';
import FundingSection from '@/components/FundingSection';

const Index = () => {
  const { currentUser } = useApp();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard setActiveSection={setActiveSection} />;
      case 'emergency':
        return <EmergencySection />;
      case 'vaccination':
        return <VaccinationSection />;
      case 'treatment':
        return <TreatmentSection />;
      case 'meals':
        return <MealMenuSection />;
      case 'nutrition':
        return <NutritionSection />;
      case 'funding':
        return <FundingSection />;
      default:
        return <Dashboard setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
