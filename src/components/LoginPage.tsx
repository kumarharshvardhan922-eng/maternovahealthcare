import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types/healthcare';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Users, Baby, UserCheck, Stethoscope, Clock, Hash, AlertCircle } from 'lucide-react';
import { generatePatientId } from '@/utils/patientIdGenerator';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import heroBg from '@/assets/hero-bg.jpg';

// Validation rules
// Name: only letters, spaces, dots, hyphens, apostrophes; 2-50 chars; must contain at least one vowel
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/;
const VOWEL_REGEX = /[aeiouAEIOU]/;
// Phone: exactly 10 digits, starting with 6-9 (Indian mobile numbers)
const PHONE_REGEX = /^[6-9]\d{9}$/;

const validateName = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return 'Please enter your name';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 50) return 'Name must be less than 50 characters';
  if (!NAME_REGEX.test(trimmed)) return 'Name can only contain letters, spaces, . - \'';
  if (!VOWEL_REGEX.test(trimmed)) return 'Please enter a valid name';
  // Reject 3+ same letters in a row (e.g. "aaaa", "xxxxx")
  if (/(.)\1{2,}/.test(trimmed)) return 'Please enter a valid name';
  return null;
};

const validatePhone = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return 'Please enter your phone number';
  if (!/^\d+$/.test(trimmed)) return 'Phone number can only contain digits';
  if (trimmed.length !== 10) return 'Phone number must be exactly 10 digits';
  if (!PHONE_REGEX.test(trimmed)) return 'Enter a valid Indian mobile number (starts with 6-9)';
  return null;
};

const roleOptionsBase: { role: UserRole; labelKey: string; icon: React.ReactNode; descKey: string; idPrefix: string }[] = [
  { role: 'asha', labelKey: 'roles.asha', icon: <Stethoscope className="w-8 h-8" />, descKey: 'login.ashaDesc', idPrefix: '0XXXXX' },
  { role: 'pregnant', labelKey: 'roles.pregnant', icon: <Heart className="w-8 h-8" />, descKey: 'login.pregnantDesc', idPrefix: '1XXXXX' },
  { role: 'elderly', labelKey: 'roles.elderly', icon: <Users className="w-8 h-8" />, descKey: 'login.elderlyDesc', idPrefix: '2XXXXX' },
  { role: 'infant_family', labelKey: 'roles.infant_family', icon: <Baby className="w-8 h-8" />, descKey: 'login.infantDesc', idPrefix: '3XXXXX' },
];

const LoginPage = () => {
  const { loginUser, profiles, addProfile } = useApp();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [currentTime] = useState(new Date());
  const roleOptions = roleOptionsBase.map(r => ({
    ...r,
    label: t(r.labelKey),
    description: t(r.descKey),
  }));

  const handleNameChange = (value: string) => {
    const filtered = value.replace(/[^A-Za-z\s.'-]/g, '');
    setName(filtered);
    if (touched.name) setNameError(validateName(filtered));
  };

  const handlePhoneChange = (value: string) => {
    const filtered = value.replace(/\D/g, '').slice(0, 10);
    setPhone(filtered);
    if (touched.phone) setPhoneError(validatePhone(filtered));
  };

  const isFormValid = !validateName(name) && !validatePhone(phone);

  const handleLogin = async () => {
    if (!selectedRole) return;

    const nErr = validateName(name);
    const pErr = validatePhone(phone);
    setNameError(nErr);
    setPhoneError(pErr);
    setTouched({ name: true, phone: true });

    if (nErr || pErr) {
      toast({
        title: 'Invalid input',
        description: nErr || pErr || 'Please correct the highlighted fields.',
        variant: 'destructive',
      });
      return;
    }

    let profile = profiles.find(p => p.role === selectedRole && p.name.toLowerCase() === name.trim().toLowerCase());

    if (!profile) {
      const patientId = generatePatientId(selectedRole);
      const newProfile = await addProfile({
        user_id: null,
        patient_id: patientId,
        name: name.trim(),
        role: selectedRole,
        phone: phone.trim(),
        village: 'Rampur',
        assigned_asha_id: null,
        login_time: new Date().toISOString(),
      });

      if (newProfile) {
        loginUser({
          id: newProfile.id,
          patientId: newProfile.patient_id,
          name: newProfile.name,
          role: newProfile.role,
          phone: newProfile.phone,
          village: newProfile.village || undefined,
        });
      }
    } else {
      loginUser({
        id: profile.id,
        patientId: profile.patient_id,
        name: profile.name,
        role: profile.role,
        phone: profile.phone,
        village: profile.village || undefined,
      });
    }
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
            {t('app.name')}
          </h1>
          <p className="text-xl text-white/90 font-medium">
            {t('app.tagline')}
          </p>
          <p className="text-white/70 mt-2">
            {t('app.subtitle')}
          </p>
          {/* Current Time Display */}
          <div className="mt-4 inline-flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white text-sm">
                {format(currentTime, 'dd MMM yyyy, hh:mm a')}
              </span>
            </div>
            <LanguageSwitcher variant="light" />
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-md shadow-elevated border-0 p-8 rounded-2xl">
          <h2 className="text-2xl font-heading font-semibold text-foreground text-center mb-6">
            {t('login.selectRole')}
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
                {t('login.idHint')}{' '}
                <span className="font-bold text-primary">
                  {roleOptions.find(r => r.role === selectedRole)?.idPrefix.charAt(0)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('login.name')}
                </label>
                <Input
                  type="text"
                  placeholder={t('login.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('login.phone')}
                </label>
                <Input
                  type="tel"
                  placeholder={t('login.phonePlaceholder')}
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
                {t('login.loginAs')} {roleOptions.find(r => r.role === selectedRole)?.label}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                <Clock className="w-3 h-3 inline mr-1" />
                {t('login.loginTime')}: {format(new Date(), 'hh:mm:ss a')}
              </p>
            </div>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          {t('app.footer')}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
