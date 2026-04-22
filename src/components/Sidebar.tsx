import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { 
  Home, 
  AlertTriangle, 
  Syringe, 
  Utensils, 
  Apple, 
  Wallet, 
  FileText, 
  LogOut,
  Menu,
  X,
  Heart
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: Home },
  { id: 'emergency', labelKey: 'nav.emergency', icon: AlertTriangle },
  { id: 'vaccination', labelKey: 'nav.vaccination', icon: Syringe },
  { id: 'treatment', labelKey: 'nav.treatment', icon: FileText },
  { id: 'meals', labelKey: 'nav.meals', icon: Utensils },
  { id: 'nutrition', labelKey: 'nav.nutrition', icon: Apple },
  { id: 'funding', labelKey: 'nav.funding', icon: Wallet },
];

const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const { currentUser, logout } = useApp();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileOpen(false);
  };

  const getRoleBadgeColor = () => {
    switch (currentUser?.role) {
      case 'asha': return 'bg-primary text-primary-foreground';
      case 'pregnant': return 'bg-terracotta text-white';
      case 'elderly': return 'bg-sky text-white';
      case 'infant_family': return 'bg-lavender text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = () => {
    switch (currentUser?.role) {
      case 'asha': return t('roles.asha');
      case 'pregnant': return t('roles.pregnant');
      case 'elderly': return t('roles.elderly');
      case 'infant_family': return t('roles.infant_family');
      default: return 'User';
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          <span className="font-heading font-bold text-lg">Maternova</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 pt-16"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-card border-r border-border z-40
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0 pt-16 lg:pt-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-3 p-6 border-b border-border">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">Maternova</h1>
              <p className="text-xs text-muted-foreground">Healthcare App</p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="bg-muted rounded-xl p-4">
              <p className="font-semibold text-foreground truncate">{currentUser?.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                  ID: {currentUser?.patientId}
                </span>
              </div>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                {getRoleLabel()}
              </span>
              <p className="text-xs text-muted-foreground mt-2">{currentUser?.village}</p>
              {currentUser?.loginTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  🕐 Login: {new Date(currentUser.loginTime).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map(({ id, labelKey, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => handleNavClick(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeSection === id
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{t(labelKey)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language Switcher */}
          <div className="p-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
              {t('nav.language')}
            </p>
            <LanguageSwitcher />
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('nav.logout')}</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
