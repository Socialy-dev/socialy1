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
      admin_resources: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          name: string
          type: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      communique_presse: {
        Row: {
          assets_link: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          pdf_url: string | null
          status: string
          updated_at: string
          word_url: string | null
        }
        Insert: {
          assets_link?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
          word_url?: string | null
        }
        Update: {
          assets_link?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
          word_url?: string | null
        }
        Relationships: []
      }
      competitor_agencies: {
        Row: {
          created_at: string
          email: string | null
          id: string
          linkedin: string | null
          name: string
          notes: string | null
          specialty: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name: string
          notes?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name?: string
          notes?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      competitor_articles: {
        Row: {
          agency_id: string
          article_date: string | null
          article_iso_date: string | null
          authors: string | null
          competitor_name: string | null
          created_at: string
          id: string
          link: string
          position: number | null
          snippet: string | null
          source_icon: string | null
          source_name: string | null
          thumbnail: string | null
          thumbnail_small: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agency_id: string
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          competitor_name?: string | null
          created_at?: string
          id?: string
          link: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agency_id?: string
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          competitor_name?: string | null
          created_at?: string
          id?: string
          link?: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_articles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "competitor_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string
          created_at: string
          document_type: string
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          document_type: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          document_type?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_posts_linkedin: {
        Row: {
          created_at: string
          generated_content_v1: string | null
          generated_content_v2: string | null
          id: string
          objective: string | null
          request_id: string
          status: string
          subject: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_content_v1?: string | null
          generated_content_v2?: string | null
          id?: string
          objective?: string | null
          request_id?: string
          status?: string
          subject: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_content_v1?: string | null
          generated_content_v2?: string | null
          id?: string
          objective?: string | null
          request_id?: string
          status?: string
          subject?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          pages: Database["public"]["Enums"]["app_page"][]
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          pages?: Database["public"]["Enums"]["app_page"][]
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          pages?: Database["public"]["Enums"]["app_page"][]
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      journalists: {
        Row: {
          competitor_name: string | null
          created_at: string
          email: string | null
          id: string
          job: string | null
          linkedin: string | null
          media: string | null
          media_specialty: string | null
          name: string
          notes: string | null
          phone: string | null
          source_article_id: string | null
          source_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          competitor_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job?: string | null
          linkedin?: string | null
          media?: string | null
          media_specialty?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source_article_id?: string | null
          source_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          competitor_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job?: string | null
          linkedin?: string | null
          media?: string | null
          media_specialty?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source_article_id?: string | null
          source_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          competitor_agencies: string[] | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          competitor_agencies?: string[] | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          competitor_agencies?: string[] | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      socialy_articles: {
        Row: {
          article_date: string | null
          article_iso_date: string | null
          authors: string | null
          created_at: string
          id: string
          link: string
          position: number | null
          snippet: string | null
          source_icon: string | null
          source_name: string | null
          thumbnail: string | null
          thumbnail_small: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          created_at?: string
          id?: string
          link: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          created_at?: string
          id?: string
          link?: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_linkedin_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          post_url: string | null
          posted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_url?: string | null
          posted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_url?: string | null
          posted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          id: string
          page: Database["public"]["Enums"]["app_page"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page: Database["public"]["Enums"]["app_page"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page?: Database["public"]["Enums"]["app_page"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_page_access: {
        Args: {
          _page: Database["public"]["Enums"]["app_page"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_first_user: { Args: never; Returns: boolean }
      is_valid_invitation: { Args: { _email: string }; Returns: boolean }
      match_documents: {
        Args: {
          filter_document_type?: string
          filter_user_id?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_type: string
          id: string
          metadata: Json
          similarity: number
          source_id: string
        }[]
      }
    }
    Enums: {
      app_page: "dashboard" | "relations-presse" | "social-media" | "profile"
      app_role: "admin" | "user"
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
      app_page: ["dashboard", "relations-presse", "social-media", "profile"],
      app_role: ["admin", "user"],
    },
  },
} as const
