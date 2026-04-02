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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_usage_log: {
        Row: {
          contributor_id: string | null
          cost_usd: number
          created_at: string
          id: string
          model: string
          requirement_id: string | null
          tokens_input: number
          tokens_output: number
        }
        Insert: {
          contributor_id?: string | null
          cost_usd?: number
          created_at?: string
          id?: string
          model: string
          requirement_id?: string | null
          tokens_input?: number
          tokens_output?: number
        }
        Update: {
          contributor_id?: string | null
          cost_usd?: number
          created_at?: string
          id?: string
          model?: string
          requirement_id?: string | null
          tokens_input?: number
          tokens_output?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_log_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_log_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      contributors: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          verified: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          verified?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          verified?: boolean
        }
        Relationships: []
      }
      persona_subscriptions: {
        Row: {
          contributor_id: string
          created_at: string
          id: string
          persona_type: Database["public"]["Enums"]["persona_type"]
        }
        Insert: {
          contributor_id: string
          created_at?: string
          id?: string
          persona_type: Database["public"]["Enums"]["persona_type"]
        }
        Update: {
          contributor_id?: string
          created_at?: string
          id?: string
          persona_type?: Database["public"]["Enums"]["persona_type"]
        }
        Relationships: [
          {
            foreignKeyName: "persona_subscriptions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_comments: {
        Row: {
          body: string
          contributor_id: string
          created_at: string
          flag_reason: string | null
          id: string
          is_flagged: boolean
          requirement_id: string
          updated_at: string
        }
        Insert: {
          body: string
          contributor_id: string
          created_at?: string
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          requirement_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          contributor_id?: string
          created_at?: string
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          requirement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_comments_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_comments_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_votes: {
        Row: {
          contributor_id: string
          created_at: string
          id: string
          requirement_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          contributor_id: string
          created_at?: string
          id?: string
          requirement_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          contributor_id?: string
          created_at?: string
          id?: string
          requirement_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "requirement_votes_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_votes_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          acceptance_criteria: Json
          category: string | null
          comment_count: number
          contributor_id: string
          created_at: string
          downvotes: number
          flag_reason: string | null
          id: string
          is_flagged: boolean
          merged_into: string | null
          persona_type: Database["public"]["Enums"]["persona_type"] | null
          priority_suggestion: string | null
          raw_input: string
          refined_description: string | null
          refined_title: string | null
          search_vector: unknown
          status: Database["public"]["Enums"]["requirement_status"]
          tags: string[]
          updated_at: string
          upvotes: number
          user_story: string | null
        }
        Insert: {
          acceptance_criteria?: Json
          category?: string | null
          comment_count?: number
          contributor_id: string
          created_at?: string
          downvotes?: number
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          merged_into?: string | null
          persona_type?: Database["public"]["Enums"]["persona_type"] | null
          priority_suggestion?: string | null
          raw_input: string
          refined_description?: string | null
          refined_title?: string | null
          search_vector?: unknown
          status?: Database["public"]["Enums"]["requirement_status"]
          tags?: string[]
          updated_at?: string
          upvotes?: number
          user_story?: string | null
        }
        Update: {
          acceptance_criteria?: Json
          category?: string | null
          comment_count?: number
          contributor_id?: string
          created_at?: string
          downvotes?: number
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          merged_into?: string | null
          persona_type?: Database["public"]["Enums"]["persona_type"] | null
          priority_suggestion?: string | null
          raw_input?: string
          refined_description?: string | null
          refined_title?: string | null
          search_vector?: unknown
          status?: Database["public"]["Enums"]["requirement_status"]
          tags?: string[]
          updated_at?: string
          upvotes?: number
          user_story?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirements_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirements_merged_into_fkey"
            columns: ["merged_into"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_similar_requirements: {
        Args: {
          result_limit?: number
          search_title: string
          similarity_threshold?: number
        }
        Returns: {
          id: string
          refined_title: string
          similarity: number
          status: Database["public"]["Enums"]["requirement_status"]
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      persona_type:
        | "general_user"
        | "job_seeker"
        | "employer"
        | "recruiter"
        | "content_moderator"
        | "content_creator"
        | "company"
        | "service_provider"
        | "coach"
        | "educator"
        | "platform_admin"
      requirement_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "approved"
        | "rejected"
        | "merged"
      vote_type: "up" | "down"
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
      persona_type: [
        "general_user",
        "job_seeker",
        "employer",
        "recruiter",
        "content_moderator",
        "content_creator",
        "company",
        "service_provider",
        "coach",
        "educator",
        "platform_admin",
      ],
      requirement_status: [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
        "merged",
      ],
      vote_type: ["up", "down"],
    },
  },
} as const
