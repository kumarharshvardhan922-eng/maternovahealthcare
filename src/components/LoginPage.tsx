import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types/healthcare';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Users, Baby, UserCheck, Stethoscope, Clock, Hash } from 'lucide-react';
import { generatePatientId } from '@/utils/patientIdGenerator';
import { format } from 'date-fns';
import heroBg from '@/assets/hero-bg.jpg';

const roleOptions: { role: UserRole; label: string; icon: React.ReactNode; description: string; idPrefix: string }[] = [
  { role: 'asha', label: 'ASHA Worker', icon: <Stethoscope className="w-8 h-8" />, description: 'Community Health Worker', idPrefix: '0XXXXX' },
  { role: 'pregnant', label: 'Pregnant Woman', icon: <Heart className="w-8 h-8" />, description: 'Expecting Mother', idPrefix: '1XXXXX' },
  { role: 'elderly', label: 'Elderly Person', icon: <Users className="w-8 h-8" />, description: 'Senior Citizen', idPrefix: '2XXXXX' },
  { role: 'infant_family', label: 'Infant Family', icon: <Baby className="w-8 h-8" />, description: 'Parent/Guardian of Infant', idPrefix: '3XXXXX' },
];

const LoginPage = () => {
  const { loginUser, users, setUsers } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentTime] = useState(new Date());

  const handleLogin = () => {
    if (!selectedRole || !name.trim()) return;

    // Find existing user or create new one
    let user = users.find(u => u.role === selectedRole && u.name.toLowerCase() === name.toLowerCase());
    
    if (!user) {
      const patientId = generatePatientId(selectedRole);
      user = {
        id: Date.now().toString(),
        patientId,
        name: name.trim(),
        role: selectedRole,
        phone: phone || '9999999999',
        village: 'Rampur',
        assignedAshaId: selectedRole !== 'asha' ? '1' : undefined,
      };
      // Add new user to users list
      setUsers(prev => [...prev, user!]);
    }

    loginUser(user);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-elevated">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-2 drop-shadow-lg">
            Maternova
          </h1>
          <p className="text-xl text-white/90 font-medium">
            Caring for Every Life, Every Stage
          </p>
          <p className="text-white/70 mt-2">
            Healthcare for Pregnant Women, Elderly & Infants
          </p>
          {/* Current Time Display */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-white text-sm">
              {format(currentTime, 'dd MMM yyyy, hh:mm a')}
            </span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-md shadow-elevated border-0 p-8 rounded-2xl">
          <h2 className="text-2xl font-heading font-semibold text-foreground text-center mb-6">
            Select Your Role to Login
          </h2>

          {/* Role Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {roleOptions.map(({ role, label, icon, description, idPrefix }) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                  selectedRole === role
                    ? 'border-primary bg-primary/10 shadow-soft'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className={`mb-2 flex justify-center ${selectedRole === role ? 'text-primary' : 'text-muted-foreground'}`}>
                  {icon}
                </div>
                <p className={`font-semibold text-sm ${selectedRole === role ? 'text-primary' : 'text-foreground'}`}>
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Hash className="w-3 h-3" />
                  <span>ID: {idPrefix}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Login Form */}
          {selectedRole && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground text-center">
                <Hash className="w-4 h-4 inline mr-1" />
                Your unique 6-digit Patient ID will be generated starting with{' '}
                <span className="font-bold text-primary">
                  {roleOptions.find(r => r.role === selectedRole)?.idPrefix.charAt(0)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button
                onClick={handleLogin}
                disabled={!name.trim()}
                className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                <UserCheck className="w-5 h-5 mr-2" />
                Login as {roleOptions.find(r => r.role === selectedRole)?.label}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                <Clock className="w-3 h-3 inline mr-1" />
                Login time will be recorded: {format(new Date(), 'hh:mm:ss a')}
              </p>
            </div>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          A healthcare initiative for rural India
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
