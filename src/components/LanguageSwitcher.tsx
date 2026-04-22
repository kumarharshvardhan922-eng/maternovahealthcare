import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { supportedLanguages } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'light';
}

const LanguageSwitcher = ({ variant = 'default' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    const rtl = ['ur', 'ks', 'sd'].includes(code);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  const triggerClasses =
    variant === 'light'
      ? 'h-9 w-auto min-w-[140px] bg-white/20 border-white/30 text-white backdrop-blur-sm hover:bg-white/30'
      : variant === 'compact'
      ? 'h-9 w-auto min-w-[120px]'
      : 'h-10 w-full';

  return (
    <Select value={i18n.language} onValueChange={handleChange}>
      <SelectTrigger className={triggerClasses} aria-label="Select language">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 shrink-0" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-80 z-[100] bg-popover">
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span className="font-medium">{lang.native}</span>
              <span className="text-xs text-muted-foreground">({lang.name})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
