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
      demo_requests: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          product_id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          product_id: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          product_id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          content: string
          created_at: string | null
          discussion_id: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          discussion_id: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          discussion_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_followers: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_followers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          tagline: string | null
          type: string | null
          main_activity: string | null
          description: string | null
          website: string | null
          contact_email: string | null
          phone: string | null
          country: string | null
          address: string | null
          linkedin_url: string | null
          x_url: string | null
          facebook_url: string | null
          instagram_url: string | null
          tiktok_url: string | null
          youtube_url: string | null
          views_count: number | null
          followers_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          tagline?: string | null
          type?: string | null
          main_activity?: string | null
          description?: string | null
          website?: string | null
          contact_email?: string | null
          phone?: string | null
          country?: string | null
          address?: string | null
          linkedin_url?: string | null
          x_url?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          views_count?: number | null
          followers_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          tagline?: string | null
          type?: string | null
          main_activity?: string | null
          description?: string | null
          website?: string | null
          contact_email?: string | null
          phone?: string | null
          country?: string | null
          address?: string | null
          linkedin_url?: string | null
          x_url?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          views_count?: number | null
          followers_count?: number | null
        }
        Relationships: []
      }
      product_experts: {
        Row: {
          created_at: string | null
          expertise_level: Database["public"]["Enums"]["expertise_level"]
          id: string
          product_id: string
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          expertise_level?: Database["public"]["Enums"]["expertise_level"]
          id?: string
          product_id: string
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          expertise_level?: Database["public"]["Enums"]["expertise_level"]
          id?: string
          product_id?: string
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_experts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_experts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_resources: {
        Row: {
          added_by: string | null
          created_at: string | null
          id: string
          product_id: string
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          url: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          title: string
          type?: Database["public"]["Enums"]["resource_type"]
          url: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_resources_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_resources_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          logo_url: string | null
          name: string
          organization_id: string
          slug: string
          updated_at: string | null
          views_count: number | null
          bookmarks_count: number | null
          qr_scans_count: number | null
          qr_code_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          name: string
          organization_id: string
          slug: string
          updated_at?: string | null
          views_count?: number | null
          bookmarks_count?: number | null
          qr_scans_count?: number | null
          qr_code_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string | null
          views_count?: number | null
          bookmarks_count?: number | null
          qr_scans_count?: number | null
          qr_code_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          company: string | null
          contact_email_public: string | null
          contact_email_public_enabled: boolean | null
          contact_phone_public: string | null
          contact_phone_public_enabled: boolean | null
          country: string | null
          cover_url: string | null
          created_at: string | null
          facebook_url: string | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          id: string
          instagram_url: string | null
          job_function: string | null
          job_title: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          skills: string[] | null
          tiktok_url: string | null
          updated_at: string | null
          username: string | null
          website: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          contact_email_public?: string | null
          contact_email_public_enabled?: boolean | null
          contact_phone_public?: string | null
          contact_phone_public_enabled?: boolean | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id: string
          instagram_url?: string | null
          job_function?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          tiktok_url?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          contact_email_public?: string | null
          contact_email_public_enabled?: boolean | null
          contact_phone_public?: string | null
          contact_phone_public_enabled?: boolean | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          job_function?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          tiktok_url?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_org: { Args: { org_id: string }; Returns: boolean }
      is_org_admin: { Args: { org_id: string }; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
    }
    Enums: {
      expertise_level: "beginner" | "intermediate" | "advanced" | "certified"
      member_role: "owner" | "admin" | "editor" | "viewer"
      resource_type:
      | "official_link"
      | "documentation"
      | "certification"
      | "training"
      | "youtube"
      | "community_link"
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
      expertise_level: ["beginner", "intermediate", "advanced", "certified"],
      member_role: ["owner", "admin", "editor", "viewer"],
      resource_type: [
        "official_link",
        "documentation",
        "certification",
        "training",
        "youtube",
        "community_link",
      ],
    },
  },
} as const
