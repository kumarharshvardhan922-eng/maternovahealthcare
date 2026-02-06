import { UserRole } from '@/types/healthcare';

// Counter to track assigned IDs (in real app, this would be persisted)
let pregnantCounter = 0;
let elderlyCounter = 0;
let infantCounter = 0;

export const generatePatientId = (role: UserRole): string => {
  let prefix: number;
  let counter: number;

  switch (role) {
    case 'pregnant':
      pregnantCounter++;
      prefix = 1;
      counter = pregnantCounter;
      break;
    case 'elderly':
      elderlyCounter++;
      prefix = 2;
      counter = elderlyCounter;
      break;
    case 'infant_family':
      infantCounter++;
      prefix = 3;
      counter = infantCounter;
      break;
    case 'asha':
      // ASHA workers get special prefix 0
      return `0${String(Date.now()).slice(-5)}`;
    default:
      prefix = 9;
      counter = Date.now() % 100000;
  }

  // Generate 6-digit ID: prefix + 5 digit number
  const idNumber = String(counter).padStart(5, '0');
  return `${prefix}${idNumber}`;
};

export const getPatientIdPrefix = (role: UserRole): string => {
  switch (role) {
    case 'pregnant': return '1';
    case 'elderly': return '2';
    case 'infant_family': return '3';
    case 'asha': return '0';
    default: return '9';
  }
};

export const getRoleFromPatientId = (patientId: string): 'pregnant' | 'elderly' | 'infant' | 'asha' | 'unknown' => {
  const prefix = patientId.charAt(0);
  switch (prefix) {
    case '1': return 'pregnant';
    case '2': return 'elderly';
    case '3': return 'infant';
    case '0': return 'asha';
    default: return 'unknown';
  }
};

// Initialize counters from existing users
export const initializeCounters = (existingPatientIds: string[]) => {
  existingPatientIds.forEach(id => {
    const prefix = id.charAt(0);
    const counter = parseInt(id.slice(1), 10);
    
    switch (prefix) {
      case '1':
        pregnantCounter = Math.max(pregnantCounter, counter);
        break;
      case '2':
        elderlyCounter = Math.max(elderlyCounter, counter);
        break;
      case '3':
        infantCounter = Math.max(infantCounter, counter);
        break;
    }
  });
};
