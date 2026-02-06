export type UserRole = 'asha' | 'pregnant' | 'elderly' | 'infant_family';

export interface User {
  id: string;
  patientId: string; // 6-digit unique ID starting with 1 (pregnant), 2 (elderly), 3 (infant)
  name: string;
  role: UserRole;
  phone: string;
  village?: string;
  assignedAshaId?: string;
  loginTime?: Date;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  type: 'medical' | 'urgent' | 'general';
  message: string;
  photoUrl?: string;
  location?: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedAshaId?: string;
}

export interface VaccinationRecord {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryType: 'pregnant' | 'elderly' | 'infant';
  vaccineName: string;
  doseNumber: number;
  dateGiven: Date;
  nextDueDate?: Date;
  administeredBy: string;
  notes?: string;
}

export interface TreatmentRecord {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryType: 'pregnant' | 'elderly' | 'infant';
  treatmentType: string;
  diagnosis: string;
  prescription: string;
  dateGiven: Date;
  doctorName: string;
  notes?: string;
  photoUrl?: string;
  documents?: string[];
}

export interface PrescribedMeal {
  id: string;
  patientId: string; // Links to user's 6-digit patientId
  patientName: string;
  patientType: 'pregnant' | 'elderly' | 'infant';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  prescribedBy: string; // Doctor name
  prescribedDate: Date;
  specialInstructions?: string;
}

export interface MealMenuItem {
  id: string;
  category: 'pregnant' | 'elderly' | 'infant';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
}

export interface NutritionRecommendation {
  id: string;
  category: 'pregnant' | 'elderly' | 'infant';
  nutrientName: string;
  dailyRequirement: string;
  unit: string;
  sources: string[];
  importance: string;
}

export interface GovernmentFunding {
  id: string;
  schemeName: string;
  description: string;
  eligibility: 'pregnant' | 'elderly' | 'infant' | 'all';
  amountINR: number;
  disbursementDate?: Date;
  status: 'pending' | 'approved' | 'disbursed';
  beneficiaryCount: number;
  notes?: string;
}
