import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Syringe, 
  Utensils, 
  Apple, 
  Wallet,
  Users,
  Heart,
  Baby,
  Clock,
  TrendingUp
} from 'lucide-react';

interface DashboardProps {
  setActiveSection: (section: string) => void;
}

const Dashboard = ({ setActiveSection }: DashboardProps) => {
  const { 
    currentUser, 
    emergencyAlerts, 
    vaccinationRecords,
    prescribedMeals,
    governmentFunding 
  } = useApp();

  const activeAlerts = emergencyAlerts.filter(a => a.status === 'active').length;
  const totalVaccinations = vaccinationRecords.length;
  const totalFunding = governmentFunding.reduce((sum, f) => 
    f.status === 'disbursed' ? sum + (Number(f.amount_inr) * f.beneficiary_count) : sum, 0
  );

  const quickStats = [
    { 
      label: 'Active Alerts', 
      value: activeAlerts, 
      icon: AlertTriangle, 
      color: 'bg-destructive text-destructive-foreground',
      onClick: () => setActiveSection('emergency')
    },
    { 
      label: 'Vaccinations', 
      value: totalVaccinations, 
      icon: Syringe, 
      color: 'bg-primary text-primary-foreground',
      onClick: () => setActiveSection('vaccination')
    },
    { 
      label: 'Meal Plans', 
      value: prescribedMeals.length, 
      icon: Utensils, 
      color: 'bg-terracotta text-white',
      onClick: () => setActiveSection('meals')
    },
    { 
      label: 'Funding Disbursed', 
      value: `₹${(totalFunding / 100000).toFixed(1)}L`, 
      icon: Wallet, 
      color: 'bg-success text-success-foreground',
      onClick: () => setActiveSection('funding')
    },
  ];

  const recentAlerts = emergencyAlerts.slice(0, 3);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pregnant': return <Heart className="w-4 h-4 text-terracotta" />;
      case 'elderly': return <Users className="w-4 h-4 text-sky" />;
      case 'infant': return <Baby className="w-4 h-4 text-lavender" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="gradient-primary rounded-2xl p-6 md:p-8 text-primary-foreground">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
          Namaste, {currentUser?.name}! 🙏
        </h1>
        <p className="text-primary-foreground/80">
          {currentUser?.role === 'asha' 
            ? 'You have access to all beneficiary records and emergency alerts.'
            : 'Welcome to your healthcare dashboard. Stay healthy, stay happy!'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map(({ label, value, icon: Icon, color, onClick }) => (
          <Card 
            key={label}
            onClick={onClick}
            className="p-4 md:p-6 cursor-pointer hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setActiveSection('emergency')}
            >
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <span className="text-sm">Emergency</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setActiveSection('vaccination')}
            >
              <Syringe className="w-6 h-6 text-primary" />
              <span className="text-sm">Vaccinations</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setActiveSection('meals')}
            >
              <Utensils className="w-6 h-6 text-terracotta" />
              <span className="text-sm">Meal Menu</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setActiveSection('nutrition')}
            >
              <Apple className="w-6 h-6 text-success" />
              <span className="text-sm">Nutrition</span>
            </Button>
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card className="p-6">
          <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            Recent Alerts
          </h2>
          {recentAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent alerts</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.status === 'active' 
                      ? 'border-destructive/30 bg-destructive/5' 
                      : 'border-border bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(alert.user_role)}
                      <span className="font-medium text-sm">{alert.user_name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.status === 'active' 
                        ? 'bg-destructive text-destructive-foreground' 
                        : 'bg-warning text-warning-foreground'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Button 
            variant="ghost" 
            className="w-full mt-4"
            onClick={() => setActiveSection('emergency')}
          >
            View All Alerts
          </Button>
        </Card>
      </div>

      {/* Category Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-heading font-semibold mb-4">Beneficiary Categories</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-terracotta/10 border border-terracotta/20">
            <div className="w-12 h-12 rounded-full bg-terracotta/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Pregnant Women</p>
              <p className="text-sm text-muted-foreground">
                {vaccinationRecords.filter(v => v.beneficiary_type === 'pregnant').length} vaccinations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-sky/10 border border-sky/20">
            <div className="w-12 h-12 rounded-full bg-sky/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-sky" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Elderly</p>
              <p className="text-sm text-muted-foreground">
                {vaccinationRecords.filter(v => v.beneficiary_type === 'elderly').length} vaccinations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-lavender/10 border border-lavender/20">
            <div className="w-12 h-12 rounded-full bg-lavender/20 flex items-center justify-center">
              <Baby className="w-6 h-6 text-lavender" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Infants</p>
              <p className="text-sm text-muted-foreground">
                {vaccinationRecords.filter(v => v.beneficiary_type === 'infant').length} vaccinations
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
