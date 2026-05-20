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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean
          created_at: string
          dismissible: boolean
          ends_at: string | null
          id: string
          link: string | null
          link_text: string | null
          message: string
          poster_url: string | null
          starts_at: string | null
          type: Database["public"]["Enums"]["announcement_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dismissible?: boolean
          ends_at?: string | null
          id?: string
          link?: string | null
          link_text?: string | null
          message: string
          poster_url?: string | null
          starts_at?: string | null
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dismissible?: boolean
          ends_at?: string | null
          id?: string
          link?: string | null
          link_text?: string | null
          message?: string
          poster_url?: string | null
          starts_at?: string | null
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          status: string
          workflow: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json | null
          status?: string
          workflow: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          status?: string
          workflow?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      brands: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          display_order: number
          featured: boolean
          id: string
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          active: boolean
          bio: string | null
          created_at: string
          id: string
          name: string
          photo_url: string | null
          position: number
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          position?: number
          role: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          position?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_users: {
        Row: {
          approved_at: string | null
          client_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          status: Database["public"]["Enums"]["client_user_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          client_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          status?: Database["public"]["Enums"]["client_user_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          client_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          status?: Database["public"]["Enums"]["client_user_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          avatar_url: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string | null
          client_user_id: string | null
          created_at: string
          id: string
          last_message_at: string
          subject: string | null
          unread_admin: number
          unread_client: number
        }
        Insert: {
          client_id?: string | null
          client_user_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          subject?: string | null
          unread_admin?: number
          unread_client?: number
        }
        Update: {
          client_id?: string | null
          client_user_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          subject?: string | null
          unread_admin?: number
          unread_client?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          id: string
          load_time_ms: number | null
          message: string
          page_path: string | null
          severity: string
          stack: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          load_time_ms?: number | null
          message: string
          page_path?: string | null
          severity?: string
          stack?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          load_time_ms?: number | null
          message?: string
          page_path?: string | null
          severity?: string
          stack?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          featured_project_ids: string[] | null
          featured_service_ids: string[] | null
          hero_cta_primary_link: string | null
          hero_cta_primary_text: string | null
          hero_cta_secondary_link: string | null
          hero_cta_secondary_text: string | null
          hero_slides: Json | null
          hero_subtitle: string | null
          hero_title: string | null
          id: number
          updated_at: string
        }
        Insert: {
          featured_project_ids?: string[] | null
          featured_service_ids?: string[] | null
          hero_cta_primary_link?: string | null
          hero_cta_primary_text?: string | null
          hero_cta_secondary_link?: string | null
          hero_cta_secondary_text?: string | null
          hero_slides?: Json | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          updated_at?: string
        }
        Update: {
          featured_project_ids?: string[] | null
          featured_service_ids?: string[] | null
          hero_cta_primary_link?: string | null
          hero_cta_primary_text?: string | null
          hero_cta_secondary_link?: string | null
          hero_cta_secondary_text?: string | null
          hero_slides?: Json | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          description: string
          id: string
          invoice_id: string
          position: number
          price: number
          qty: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          position?: number
          price?: number
          qty?: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          position?: number
          price?: number
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_amount: number
          paid_at: string | null
          pay_token: string | null
          payment_method: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          tax_pct: number
          total: number
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          pay_token?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_pct?: number
          total?: number
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          pay_token?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_pct?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          public_url: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          public_url: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          public_url?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string
          id: string
          location: string | null
          meeting_link: string | null
          project_id: string | null
          reminder_sent: boolean
          starts_at: string
          status: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          project_id?: string | null
          reminder_sent?: boolean
          starts_at: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          project_id?: string | null
          reminder_sent?: boolean
          starts_at?: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string | null
          sender_role: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string | null
          sender_role: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string | null
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          category: string | null
          client_id: string | null
          client_name: string | null
          completion_date: string | null
          cover_image: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          display_order: number
          featured: boolean
          full_description: string | null
          gallery: Json | null
          id: string
          progress: number
          project_url: string | null
          short_description: string | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          technologies: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          category?: string | null
          client_id?: string | null
          client_name?: string | null
          completion_date?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          display_order?: number
          featured?: boolean
          full_description?: string | null
          gallery?: Json | null
          id?: string
          progress?: number
          project_url?: string | null
          short_description?: string | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          technologies?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          category?: string | null
          client_id?: string | null
          client_name?: string | null
          completion_date?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          display_order?: number
          featured?: boolean
          full_description?: string | null
          gallery?: Json | null
          id?: string
          progress?: number
          project_url?: string | null
          short_description?: string | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          technologies?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_meta: {
        Row: {
          description: string | null
          id: string
          keywords: string[] | null
          og_image: string | null
          page_key: string
          title: string | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          keywords?: string[] | null
          og_image?: string | null
          page_key: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          keywords?: string[] | null
          og_image?: string | null
          page_key?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          cta_link: string | null
          cta_text: string | null
          deliverables: Json | null
          display_order: number
          faqs: Json | null
          full_description: string | null
          icon: string | null
          id: string
          phases: Json | null
          short_description: string | null
          slug: string
          technologies: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          deliverables?: Json | null
          display_order?: number
          faqs?: Json | null
          full_description?: string | null
          icon?: string | null
          id?: string
          phases?: Json | null
          short_description?: string | null
          slug: string
          technologies?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          deliverables?: Json | null
          display_order?: number
          faqs?: Json | null
          full_description?: string | null
          icon?: string | null
          id?: string
          phases?: Json | null
          short_description?: string | null
          slug?: string
          technologies?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          company_name: string | null
          email: string | null
          footer_text: string | null
          id: number
          logo_url: string | null
          phone: string | null
          social_links: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          email?: string | null
          footer_text?: string | null
          id?: number
          logo_url?: string | null
          phone?: string | null
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          email?: string | null
          footer_text?: string | null
          id?: number
          logo_url?: string | null
          phone?: string | null
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_email: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_email?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_email?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          currency: string
          gateway_txn_id: string | null
          id: string
          invoice_id: string | null
          method: string
          raw_response: Json | null
          reference_id: string | null
          status: Database["public"]["Enums"]["tx_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          gateway_txn_id?: string | null
          id?: string
          invoice_id?: string | null
          method?: string
          raw_response?: Json | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          gateway_txn_id?: string | null
          id?: string
          invoice_id?: string | null
          method?: string
          raw_response?: Json | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      current_client_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_approved_client: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      announcement_type: "banner" | "popup"
      app_role: "super_admin" | "editor" | "viewer"
      client_user_status: "pending" | "approved" | "rejected"
      invoice_status:
        | "draft"
        | "sent"
        | "paid"
        | "overdue"
        | "cancelled"
        | "partial"
      lead_status: "new" | "contacted" | "converted" | "archived"
      meeting_status: "scheduled" | "completed" | "cancelled"
      project_status: "planning" | "in_progress" | "completed" | "on_hold"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "done"
      tx_status: "pending" | "success" | "failed" | "refunded"
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
      announcement_type: ["banner", "popup"],
      app_role: ["super_admin", "editor", "viewer"],
      client_user_status: ["pending", "approved", "rejected"],
      invoice_status: [
        "draft",
        "sent",
        "paid",
        "overdue",
        "cancelled",
        "partial",
      ],
      lead_status: ["new", "contacted", "converted", "archived"],
      meeting_status: ["scheduled", "completed", "cancelled"],
      project_status: ["planning", "in_progress", "completed", "on_hold"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "done"],
      tx_status: ["pending", "success", "failed", "refunded"],
    },
  },
} as const
