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
      client_agencies: {
        Row: {
          created_at: string
          email: string | null
          id: string
          linkedin: string | null
          name: string
          notes: string | null
          organization_id: string
          specialty: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name: string
          notes?: string | null
          organization_id: string
          specialty?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          specialty?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_agencies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_articles: {
        Row: {
          article_date: string | null
          article_iso_date: string | null
          authors: string | null
          client_id: string
          client_name: string | null
          created_at: string
          hidden: boolean
          id: string
          link: string
          organization_id: string
          position: number | null
          snippet: string | null
          source_icon: string | null
          source_name: string | null
          thumbnail: string | null
          thumbnail_small: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          client_id: string
          client_name?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          link: string
          organization_id: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          client_id?: string
          client_name?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          link?: string
          organization_id?: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_articles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      communique_presse: {
        Row: {
          assets_link: string | null
          created_at: string
          created_by: string
          google_drive_url: string | null
          id: string
          name: string
          organization_id: string | null
          pdf_url: string | null
          status: string
          updated_at: string
          word_url: string | null
        }
        Insert: {
          assets_link?: string | null
          created_at?: string
          created_by: string
          google_drive_url?: string | null
          id?: string
          name: string
          organization_id?: string | null
          pdf_url?: string | null
          status?: string
          updated_at?: string
          word_url?: string | null
        }
        Update: {
          assets_link?: string | null
          created_at?: string
          created_by?: string
          google_drive_url?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          pdf_url?: string | null
          status?: string
          updated_at?: string
          word_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communique_presse_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_agencies: {
        Row: {
          created_at: string
          email: string | null
          id: string
          linkedin: string | null
          name: string
          notes: string | null
          organization_id: string
          specialty: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name: string
          notes?: string | null
          organization_id: string
          specialty?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          specialty?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_agencies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_articles: {
        Row: {
          article_date: string | null
          article_iso_date: string | null
          authors: string | null
          competitor_id: string
          competitor_name: string | null
          created_at: string
          hidden: boolean
          id: string
          link: string
          organization_id: string
          position: number | null
          snippet: string | null
          source_icon: string | null
          source_name: string | null
          thumbnail: string | null
          thumbnail_small: string | null
          title: string
          updated_at: string
        }
        Insert: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          competitor_id: string
          competitor_name?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          link: string
          organization_id: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          competitor_id?: string
          competitor_name?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          link?: string
          organization_id?: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_articles_agency_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitor_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          source_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_posts_linkedin: {
        Row: {
          created_at: string
          generated_content_v1: string | null
          generated_content_v2: string | null
          id: string
          objective: string | null
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          request_id?: string
          status?: string
          subject?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_posts_linkedin_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_role: Database["public"]["Enums"]["org_role"]
          organization_id: string
          page_permissions: Database["public"]["Enums"]["app_page"][] | null
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_role?: Database["public"]["Enums"]["org_role"]
          organization_id: string
          page_permissions?: Database["public"]["Enums"]["app_page"][] | null
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_role?: Database["public"]["Enums"]["org_role"]
          organization_id?: string
          page_permissions?: Database["public"]["Enums"]["app_page"][] | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_logs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          organization_id: string | null
          payload: Json
          queue_name: string
          result: Json | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type: string
          organization_id?: string | null
          payload?: Json
          queue_name: string
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          organization_id?: string | null
          payload?: Json
          queue_name?: string
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_queue: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          max_retries: number | null
          organization_id: string | null
          payload: Json
          priority: number | null
          processing_started_at: string | null
          queue_name: string
          retry_count: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          organization_id?: string | null
          payload: Json
          priority?: number | null
          processing_started_at?: string | null
          queue_name: string
          retry_count?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          organization_id?: string | null
          payload?: Json
          priority?: number | null
          processing_started_at?: string | null
          queue_name?: string
          retry_count?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      journalists: {
        Row: {
          competitor_name: string | null
          created_at: string
          email: string | null
          enriched_at: string | null
          enrichment_error: string | null
          enrichment_status: string | null
          id: string
          job: string | null
          linkedin: string | null
          media: string | null
          media_specialty: string | null
          metadata: Json | null
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          source_article_id: string | null
          source_type: string | null
          updated_at: string
        }
        Insert: {
          competitor_name?: string | null
          created_at?: string
          email?: string | null
          enriched_at?: string | null
          enrichment_error?: string | null
          enrichment_status?: string | null
          id?: string
          job?: string | null
          linkedin?: string | null
          media?: string | null
          media_specialty?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          source_article_id?: string | null
          source_type?: string | null
          updated_at?: string
        }
        Update: {
          competitor_name?: string | null
          created_at?: string
          email?: string | null
          enriched_at?: string | null
          enrichment_error?: string | null
          enrichment_status?: string | null
          id?: string
          job?: string | null
          linkedin?: string | null
          media?: string | null
          media_specialty?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          source_article_id?: string | null
          source_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journalists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      market_watch_topics: {
        Row: {
          article_date: string | null
          article_iso_date: string | null
          authors: string | null
          created_at: string
          created_by: string | null
          hidden: boolean
          id: string
          link: string
          organization_id: string
          position: number | null
          snippet: string | null
          source_icon: string | null
          source_name: string | null
          status: string
          thumbnail: string | null
          thumbnail_small: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          created_at?: string
          created_by?: string | null
          hidden?: boolean
          id?: string
          link: string
          organization_id: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          status?: string
          thumbnail?: string | null
          thumbnail_small?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          created_at?: string
          created_by?: string | null
          hidden?: boolean
          id?: string
          link?: string
          organization_id?: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          status?: string
          thumbnail?: string | null
          thumbnail_small?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_articles: {
        Row: {
          article_date: string | null
          article_iso_date: string | null
          authors: string | null
          created_at: string
          hidden: boolean
          id: string
          link: string
          organization_id: string
          position: number | null
          snippet: string | null
          source_icon: string | null
          source_name: string | null
          thumbnail: string | null
          thumbnail_small: string | null
          title: string
          updated_at: string
        }
        Insert: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          link: string
          organization_id: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          article_date?: string | null
          article_iso_date?: string | null
          authors?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          link?: string
          organization_id?: string
          position?: number | null
          snippet?: string | null
          source_icon?: string | null
          source_name?: string | null
          thumbnail?: string | null
          thumbnail_small?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "socialy_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_linkedin_posts: {
        Row: {
          activity_urn: string | null
          author_avatar_url: string | null
          author_headline: string | null
          author_name: string | null
          author_profile_url: string | null
          clicks: number | null
          comments_count: number | null
          created_at: string
          engagement_rate: number | null
          id: string
          impressions: number | null
          likes_count: number | null
          media_items: Json | null
          organization_id: string
          post_url: string
          posted_at_date: string | null
          raw_data: Json | null
          reposts_count: number | null
          text: string | null
          updated_at: string
        }
        Insert: {
          activity_urn?: string | null
          author_avatar_url?: string | null
          author_headline?: string | null
          author_name?: string | null
          author_profile_url?: string | null
          clicks?: number | null
          comments_count?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes_count?: number | null
          media_items?: Json | null
          organization_id: string
          post_url: string
          posted_at_date?: string | null
          raw_data?: Json | null
          reposts_count?: number | null
          text?: string | null
          updated_at?: string
        }
        Update: {
          activity_urn?: string | null
          author_avatar_url?: string | null
          author_headline?: string | null
          author_name?: string | null
          author_profile_url?: string | null
          clicks?: number | null
          comments_count?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes_count?: number | null
          media_items?: Json | null
          organization_id?: string
          post_url?: string
          posted_at_date?: string | null
          raw_data?: Json | null
          reposts_count?: number | null
          text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_linkedin_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_marche_public: {
        Row: {
          acheteur: string | null
          created_at: string
          date_publication: string | null
          deadline: string | null
          dedup_key: string | null
          external_id: string | null
          id: string
          montant: number | null
          organization_id: string
          source: string | null
          titre: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          acheteur?: string | null
          created_at?: string
          date_publication?: string | null
          deadline?: string | null
          dedup_key?: string | null
          external_id?: string | null
          id?: string
          montant?: number | null
          organization_id: string
          source?: string | null
          titre?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          acheteur?: string | null
          created_at?: string
          date_publication?: string | null
          deadline?: string | null
          dedup_key?: string | null
          external_id?: string | null
          id?: string
          montant?: number | null
          organization_id?: string
          source?: string | null
          titre?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_marche_public_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
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
        ]
      }
      organization_resources: {
        Row: {
          address: string | null
          company_description: string | null
          company_name: string | null
          competitors: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          facebook_url: string | null
          hashtags: string | null
          id: string
          industry: string | null
          instagram_url: string | null
          key_messages: string | null
          linkedin_url: string | null
          organization_id: string
          target_audience: string | null
          tone_of_voice: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          company_description?: string | null
          company_name?: string | null
          competitors?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          facebook_url?: string | null
          hashtags?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          key_messages?: string | null
          linkedin_url?: string | null
          organization_id: string
          target_audience?: string | null
          tone_of_voice?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          company_description?: string | null
          company_name?: string | null
          competitors?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          facebook_url?: string | null
          hashtags?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          key_messages?: string | null
          linkedin_url?: string | null
          organization_id?: string
          target_audience?: string | null
          tone_of_voice?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          brand_description: string | null
          brand_font: string | null
          brand_name: string | null
          company_description: string | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          company_website: string | null
          competitor_agencies: string[] | null
          created_at: string
          email: string | null
          facebook_url: string | null
          first_name: string | null
          id: string
          instagram_url: string | null
          last_name: string | null
          linkedin_url: string | null
          phone: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          brand_description?: string | null
          brand_font?: string | null
          brand_name?: string | null
          company_description?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          competitor_agencies?: string[] | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          first_name?: string | null
          id?: string
          instagram_url?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          phone?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          brand_description?: string | null
          brand_font?: string | null
          brand_name?: string | null
          company_description?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          competitor_agencies?: string[] | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          first_name?: string | null
          id?: string
          instagram_url?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          phone?: string | null
          twitter_url?: string | null
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
      complete_job: {
        Args: { p_job_id: string; p_result?: Json }
        Returns: undefined
      }
      enqueue_job: {
        Args: {
          p_job_type: string
          p_organization_id: string
          p_payload: Json
          p_queue_name: string
        }
        Returns: string
      }
      fail_job: {
        Args: { p_error: string; p_job_id: string }
        Returns: undefined
      }
      get_user_org_role: {
        Args: { check_org_id: string; check_user_id: string }
        Returns: Database["public"]["Enums"]["org_role"]
      }
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
      is_super_admin: { Args: { check_user_id: string }; Returns: boolean }
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
      pgmq_archive: {
        Args: { p_msg_id: number; p_queue_name: string }
        Returns: boolean
      }
      pgmq_read: {
        Args: { p_qty: number; p_queue_name: string; p_vt: number }
        Returns: {
          enqueued_at: string
          headers: Json
          message: Json
          msg_id: number
          read_ct: number
          vt: string
        }[]
      }
      pop_from_queue: {
        Args: { p_queue_name: string }
        Returns: {
          id: string
          organization_id: string
          payload: Json
        }[]
      }
      push_to_queue: {
        Args: { p_org_id?: string; p_payload: Json; p_queue_name: string }
        Returns: string
      }
      user_belongs_to_org: {
        Args: { check_org_id: string; check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_page: "dashboard" | "relations-presse" | "social-media" | "profile"
      app_role: "admin" | "user"
      org_role: "super_admin" | "org_admin" | "org_user"
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
      org_role: ["super_admin", "org_admin", "org_user"],
    },
  },
} as const
