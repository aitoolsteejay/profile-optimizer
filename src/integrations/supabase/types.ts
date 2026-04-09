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
      leads: {
        Row: {
          company_description: string
          company_name: string
          company_website: string
          created_at: string
          custom_icp: string | null
          email: string
          id: string
          linkedin_url: string
          name: string
          role: string
          selected_tones: string[]
          target_icp: string
        }
        Insert: {
          company_description: string
          company_name: string
          company_website?: string
          created_at?: string
          custom_icp?: string | null
          email: string
          id?: string
          linkedin_url?: string
          name: string
          role: string
          selected_tones?: string[]
          target_icp: string
        }
        Update: {
          company_description?: string
          company_name?: string
          company_website?: string
          created_at?: string
          custom_icp?: string | null
          email?: string
          id?: string
          linkedin_url?: string
          name?: string
          role?: string
          selected_tones?: string[]
          target_icp?: string
        }
        Relationships: []
      }
      profile_optimizations: {
        Row: {
          current_about: string
          current_headline: string
          custom_icp_if_any: string | null
          data_source: string | null
          detected_keywords: string[] | null
          icp_relevance_score: number | null
          id: string
          linkedin_url: string | null
          missing_keywords: string[] | null
          optimized_about: string | null
          optimized_headlines: Json | null
          positioning_angles: Json | null
          profile_clarity_score: number | null
          quoted_issues: Json | null
          role: string | null
          scraped_about: string | null
          scraped_headline: string | null
          selected_tones: string[]
          target_icp: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          current_about: string
          current_headline: string
          custom_icp_if_any?: string | null
          data_source?: string | null
          detected_keywords?: string[] | null
          icp_relevance_score?: number | null
          id?: string
          linkedin_url?: string | null
          missing_keywords?: string[] | null
          optimized_about?: string | null
          optimized_headlines?: Json | null
          positioning_angles?: Json | null
          profile_clarity_score?: number | null
          quoted_issues?: Json | null
          role?: string | null
          scraped_about?: string | null
          scraped_headline?: string | null
          selected_tones: string[]
          target_icp?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          current_about?: string
          current_headline?: string
          custom_icp_if_any?: string | null
          data_source?: string | null
          detected_keywords?: string[] | null
          icp_relevance_score?: number | null
          id?: string
          linkedin_url?: string | null
          missing_keywords?: string[] | null
          optimized_about?: string | null
          optimized_headlines?: Json | null
          positioning_angles?: Json | null
          profile_clarity_score?: number | null
          quoted_issues?: Json | null
          role?: string | null
          scraped_about?: string | null
          scraped_headline?: string | null
          selected_tones?: string[]
          target_icp?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
