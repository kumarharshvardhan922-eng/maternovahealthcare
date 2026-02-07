export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      emergency_alerts: {
        Row: {
          assigned_asha_id: string | null
          created_at: string
          id: string
          location: string | null
          message: string
          photo_url: string | null
          status: Database["public"]["Enums"]["alert_status"]
          type: Database["public"]["Enums"]["alert_type"]
          updated_at: string
          user_id: string
          user_name: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          assigned_asha_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          message: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          type?: Database["public"]["Enums"]["alert_type"]
          updated_at?: string
          user_id: string
          user_name: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          assigned_asha_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          message?: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          type?: Database["public"]["Enums"]["alert_type"]
          updated_at?: string
          user_id?: string
          user_name?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "emergency_alerts_assigned_asha_id_fkey"
            columns: ["assigned_asha_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      government_funding: {
        Row: {
          amount_inr: number
          beneficiary_count: number
          created_at: string
          description: string | null
          disbursement_date: string | null
          eligibility: Database["public"]["Enums"]["funding_eligibility"]
          id: string
          notes: string | null
          scheme_name: string
          status: Database["public"]["Enums"]["funding_status"]
          updated_at: string
        }
        Insert: {
          amount_inr?: number
          beneficiary_count?: number
          created_at?: string
          description?: string | null
          disbursement_date?: string | null
          eligibility?: Database["public"]["Enums"]["funding_eligibility"]
          id?: string
          notes?: string | null
          scheme_name: string
          status?: Database["public"]["Enums"]["funding_status"]
          updated_at?: string
        }
        Update: {
          amount_inr?: number
          beneficiary_count?: number
          created_at?: string
          description?: string | null
          disbursement_date?: string | null
          eligibility?: Database["public"]["Enums"]["funding_eligibility"]
          id?: string
          notes?: string | null
          scheme_name?: string
          status?: Database["public"]["Enums"]["funding_status"]
          updated_at?: string
        }
        Relationships: []
      }
      nutrition_recommendations: {
        Row: {
          category: Database["public"]["Enums"]["beneficiary_type"]
          created_at: string
          daily_requirement: string
          id: string
          importance: string | null
          nutrient_name: string
          sources: string[] | null
          unit: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["beneficiary_type"]
          created_at?: string
          daily_requirement: string
          id?: string
          importance?: string | null
          nutrient_name: string
          sources?: string[] | null
          unit: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["beneficiary_type"]
          created_at?: string
          daily_requirement?: string
          id?: string
          importance?: string | null
          nutrient_name?: string
          sources?: string[] | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      prescribed_meals: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          description: string | null
          fat: number
          id: string
          ingredients: string[] | null
          meal_type: Database["public"]["Enums"]["meal_type"]
          name: string
          patient_id: string
          patient_name: string
          patient_type: Database["public"]["Enums"]["beneficiary_type"]
          prescribed_by: string
          prescribed_date: string
          protein: number
          special_instructions: string | null
          updated_at: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          description?: string | null
          fat?: number
          id?: string
          ingredients?: string[] | null
          meal_type: Database["public"]["Enums"]["meal_type"]
          name: string
          patient_id: string
          patient_name: string
          patient_type: Database["public"]["Enums"]["beneficiary_type"]
          prescribed_by: string
          prescribed_date?: string
          protein?: number
          special_instructions?: string | null
          updated_at?: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          description?: string | null
          fat?: number
          id?: string
          ingredients?: string[] | null
          meal_type?: Database["public"]["Enums"]["meal_type"]
          name?: string
          patient_id?: string
          patient_name?: string
          patient_type?: Database["public"]["Enums"]["beneficiary_type"]
          prescribed_by?: string
          prescribed_date?: string
          protein?: number
          special_instructions?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assigned_asha_id: string | null
          created_at: string
          id: string
          login_time: string | null
          name: string
          patient_id: string
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string | null
          village: string | null
        }
        Insert: {
          assigned_asha_id?: string | null
          created_at?: string
          id?: string
          login_time?: string | null
          name: string
          patient_id: string
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string | null
          village?: string | null
        }
        Update: {
          assigned_asha_id?: string | null
          created_at?: string
          id?: string
          login_time?: string | null
          name?: string
          patient_id?: string
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string | null
          village?: string | null
        }
        Relationships: []
      }
      treatment_records: {
        Row: {
          beneficiary_id: string
          beneficiary_name: string
          beneficiary_type: Database["public"]["Enums"]["beneficiary_type"]
          created_at: string
          date_given: string
          diagnosis: string
          doctor_name: string
          documents: string[] | null
          id: string
          notes: string | null
          photo_url: string | null
          prescription: string
          treatment_type: string
          updated_at: string
        }
        Insert: {
          beneficiary_id: string
          beneficiary_name: string
          beneficiary_type: Database["public"]["Enums"]["beneficiary_type"]
          created_at?: string
          date_given: string
          diagnosis: string
          doctor_name: string
          documents?: string[] | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          prescription: string
          treatment_type: string
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string
          beneficiary_name?: string
          beneficiary_type?: Database["public"]["Enums"]["beneficiary_type"]
          created_at?: string
          date_given?: string
          diagnosis?: string
          doctor_name?: string
          documents?: string[] | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          prescription?: string
          treatment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_records_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccination_records: {
        Row: {
          administered_by: string
          beneficiary_id: string
          beneficiary_name: string
          beneficiary_type: Database["public"]["Enums"]["beneficiary_type"]
          created_at: string
          date_given: string
          dose_number: number
          id: string
          next_due_date: string | null
          notes: string | null
          updated_at: string
          vaccine_name: string
        }
        Insert: {
          administered_by: string
          beneficiary_id: string
          beneficiary_name: string
          beneficiary_type: Database["public"]["Enums"]["beneficiary_type"]
          created_at?: string
          date_given: string
          dose_number?: number
          id?: string
          next_due_date?: string | null
          notes?: string | null
          updated_at?: string
          vaccine_name: string
        }
        Update: {
          administered_by?: string
          beneficiary_id?: string
          beneficiary_name?: string
          beneficiary_type?: Database["public"]["Enums"]["beneficiary_type"]
          created_at?: string
          date_given?: string
          dose_number?: number
          id?: string
          next_due_date?: string | null
          notes?: string | null
          updated_at?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_records_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_status: "active" | "acknowledged" | "resolved"
      alert_type: "medical" | "urgent" | "general"
      beneficiary_type: "pregnant" | "elderly" | "infant"
      funding_eligibility: "pregnant" | "elderly" | "infant" | "all"
      funding_status: "pending" | "approved" | "disbursed"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
      user_role: "asha" | "pregnant" | "elderly" | "infant_family"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_status: ["active", "acknowledged", "resolved"],
      alert_type: ["medical", "urgent", "general"],
      beneficiary_type: ["pregnant", "elderly", "infant"],
      funding_eligibility: ["pregnant", "elderly", "infant", "all"],
      funding_status: ["pending", "approved", "disbursed"],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
      user_role: ["asha", "pregnant", "elderly", "infant_family"],
    },
  },
} as const
