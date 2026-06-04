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
      ad_campaigns: {
        Row: {
          advertiser_id: string
          body: string | null
          clicks: number
          created_at: string
          cta_label: string | null
          cta_url: string
          ends_at: string | null
          id: string
          image_url: string | null
          impressions: number
          name: string
          organization_id: string | null
          placement: string
          starts_at: string | null
          status: string
          target_category: string | null
          title: string
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          body?: string | null
          clicks?: number
          created_at?: string
          cta_label?: string | null
          cta_url: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          name: string
          organization_id?: string | null
          placement?: string
          starts_at?: string | null
          status?: string
          target_category?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          body?: string | null
          clicks?: number
          created_at?: string
          cta_label?: string | null
          cta_url?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          name?: string
          organization_id?: string | null
          placement?: string
          starts_at?: string | null
          status?: string
          target_category?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_setup_requests: {
        Row: {
          brief: Json
          budget_amount: number | null
          budget_currency: string
          created_at: string
          id: string
          product_ids: string[]
          recommendation: Json
          requester_id: string | null
          satisfied: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          brief?: Json
          budget_amount?: number | null
          budget_currency?: string
          created_at?: string
          id?: string
          product_ids?: string[]
          recommendation?: Json
          requester_id?: string | null
          satisfied?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          brief?: Json
          budget_amount?: number | null
          budget_currency?: string
          created_at?: string
          id?: string
          product_ids?: string[]
          recommendation?: Json
          requester_id?: string | null
          satisfied?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_tool_bookmarks: {
        Row: {
          ai_tool_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          ai_tool_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          ai_tool_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_bookmarks_ai_tool_id_fkey"
            columns: ["ai_tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      ai_tool_resources: {
        Row: {
          ai_tool_id: string
          created_at: string | null
          id: string
          resource_type: string
          title: string
          url: string
        }
        Insert: {
          ai_tool_id: string
          created_at?: string | null
          id?: string
          resource_type: string
          title: string
          url: string
        }
        Update: {
          ai_tool_id?: string
          created_at?: string | null
          id?: string
          resource_type?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_resources_ai_tool_id_fkey"
            columns: ["ai_tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tools: {
        Row: {
          bookmarks_count: number | null
          category_id: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          gallery_urls: string[] | null
          id: string
          is_featured: boolean | null
          logo_url: string | null
          main_link: string
          name: string
          platforms: string[] | null
          pricing_model: string | null
          pricing_url: string | null
          slug: string
          status: string
          tagline: string | null
          tags: string[] | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          bookmarks_count?: number | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          gallery_urls?: string[] | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          main_link: string
          name: string
          platforms?: string[] | null
          pricing_model?: string | null
          pricing_url?: string | null
          slug: string
          status?: string
          tagline?: string | null
          tags?: string[] | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          bookmarks_count?: number | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          gallery_urls?: string[] | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          main_link?: string
          name?: string
          platforms?: string[] | null
          pricing_model?: string | null
          pricing_url?: string | null
          slug?: string
          status?: string
          tagline?: string | null
          tags?: string[] | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ai_tool_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          likes_count: number
          linked_product_id: string | null
          organization_id: string | null
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id: string
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          likes_count?: number
          linked_product_id?: string | null
          organization_id?: string | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          likes_count?: number
          linked_product_id?: string | null
          organization_id?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_linked_product_id_fkey"
            columns: ["linked_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          link_url: string | null
          message: string
          push_failed_count: number | null
          push_sent_count: number | null
          recipient_count: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          message: string
          push_failed_count?: number | null
          push_sent_count?: number | null
          recipient_count?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          message?: string
          push_failed_count?: number | null
          push_sent_count?: number | null
          recipient_count?: number | null
          title?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_ownership_requests: {
        Row: {
          admin_note: string | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          message: string | null
          notify_by_email: boolean
          requesting_org_id: string | null
          requesting_user_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          message?: string | null
          notify_by_email?: boolean
          requesting_org_id?: string | null
          requesting_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          message?: string | null
          notify_by_email?: boolean
          requesting_org_id?: string | null
          requesting_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_ownership_requests_requesting_org_id_fkey"
            columns: ["requesting_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          profile_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          company_name: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          id: string
          message: string | null
          organization_id: string | null
          product_id: string | null
          request_type: string
          requester_id: string | null
          status: string | null
        }
        Insert: {
          company_name?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          organization_id?: string | null
          product_id?: string | null
          request_type?: string
          requester_id?: string | null
          status?: string | null
        }
        Update: {
          company_name?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          organization_id?: string | null
          product_id?: string | null
          request_type?: string
          requester_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      device_push_tokens: {
        Row: {
          created_at: string | null
          id: string
          last_seen_at: string | null
          platform: string
          provider: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_seen_at?: string | null
          platform: string
          provider?: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen_at?: string | null
          platform?: string
          provider?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          app_version: string | null
          created_at: string
          device_id: string | null
          is_active: boolean
          last_seen_at: string
          locale: string | null
          platform: string
          timezone: string | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_id?: string | null
          is_active?: boolean
          last_seen_at?: string
          locale?: string | null
          platform: string
          timezone?: string | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_id?: string | null
          is_active?: boolean
          last_seen_at?: string
          locale?: string | null
          platform?: string
          timezone?: string | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      event_interests: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          interest: Database["public"]["Enums"]["event_interest_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          interest?: Database["public"]["Enums"]["event_interest_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          interest?: Database["public"]["Enums"]["event_interest_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_interests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string | null
          status: Database["public"]["Enums"]["registration_status"]
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_speakers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          event_id: string
          id: string
          name: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          name: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          name?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_speakers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          agenda: Json | null
          bookmarks_count: number | null
          city: string | null
          contact_email: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          format: string | null
          gallery_urls: string[] | null
          id: string
          interest_count: number
          is_online: boolean | null
          is_public: boolean | null
          location: string | null
          location_url: string | null
          logo_url: string | null
          max_attendees: number | null
          online_url: string | null
          organization_id: string
          price: number | null
          price_upon_request: boolean | null
          pricing_model: string | null
          promo_video_url: string | null
          registration_count: number | null
          registration_url: string | null
          short_description: string | null
          slug: string
          speakers: Json | null
          sponsors: Json | null
          start_date: string
          status: Database["public"]["Enums"]["event_status"]
          tagline: string | null
          tags: string[] | null
          timezone: string | null
          title: string
          updated_at: string | null
          venue_name: string | null
          views_count: number | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          agenda?: Json | null
          bookmarks_count?: number | null
          city?: string | null
          contact_email?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date: string
          event_type?: Database["public"]["Enums"]["event_type"]
          format?: string | null
          gallery_urls?: string[] | null
          id?: string
          interest_count?: number
          is_online?: boolean | null
          is_public?: boolean | null
          location?: string | null
          location_url?: string | null
          logo_url?: string | null
          max_attendees?: number | null
          online_url?: string | null
          organization_id: string
          price?: number | null
          price_upon_request?: boolean | null
          pricing_model?: string | null
          promo_video_url?: string | null
          registration_count?: number | null
          registration_url?: string | null
          short_description?: string | null
          slug: string
          speakers?: Json | null
          sponsors?: Json | null
          start_date: string
          status?: Database["public"]["Enums"]["event_status"]
          tagline?: string | null
          tags?: string[] | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          venue_name?: string | null
          views_count?: number | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          agenda?: Json | null
          bookmarks_count?: number | null
          city?: string | null
          contact_email?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          format?: string | null
          gallery_urls?: string[] | null
          id?: string
          interest_count?: number
          is_online?: boolean | null
          is_public?: boolean | null
          location?: string | null
          location_url?: string | null
          logo_url?: string | null
          max_attendees?: number | null
          online_url?: string | null
          organization_id?: string
          price?: number | null
          price_upon_request?: boolean | null
          pricing_model?: string | null
          promo_video_url?: string | null
          registration_count?: number | null
          registration_url?: string | null
          short_description?: string | null
          slug?: string
          speakers?: Json | null
          sponsors?: Json | null
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"]
          tagline?: string | null
          tags?: string[] | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          venue_name?: string | null
          views_count?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_reviews: {
        Row: {
          body: string | null
          created_at: string | null
          expert_id: string
          id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          expert_id: string
          id?: string
          rating: number
          reviewer_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          expert_id?: string
          id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_reviews_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_services: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          duration_minutes: number | null
          expert_id: string
          id: string
          is_active: boolean | null
          price: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_minutes?: number | null
          expert_id: string
          id?: string
          is_active?: boolean | null
          price?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_minutes?: number | null
          expert_id?: string
          id?: string
          is_active?: boolean | null
          price?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_services_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_submissions: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          type: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          type: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string | null
          id: string
          interview_location: string | null
          interview_notes: string | null
          interview_scheduled_at: string | null
          job_id: string
          phone: string | null
          replied_at: string | null
          reply_message: string | null
          resume_type: Database["public"]["Enums"]["resume_type"]
          resume_url: string
          status: Database["public"]["Enums"]["job_application_status"]
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          interview_location?: string | null
          interview_notes?: string | null
          interview_scheduled_at?: string | null
          job_id: string
          phone?: string | null
          replied_at?: string | null
          reply_message?: string | null
          resume_type?: Database["public"]["Enums"]["resume_type"]
          resume_url: string
          status?: Database["public"]["Enums"]["job_application_status"]
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          interview_location?: string | null
          interview_notes?: string | null
          interview_scheduled_at?: string | null
          job_id?: string
          phone?: string | null
          replied_at?: string | null
          reply_message?: string | null
          resume_type?: Database["public"]["Enums"]["resume_type"]
          resume_url?: string
          status?: Database["public"]["Enums"]["job_application_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_count: number | null
          created_at: string | null
          currency: string | null
          department: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_remote: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location: string | null
          organization_id: string
          posted_by: string | null
          salary_max: number | null
          salary_min: number | null
          skills: string[] | null
          slug: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          application_count?: number | null
          created_at?: string | null
          currency?: string | null
          department?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_remote?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          organization_id: string
          posted_by?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          slug: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          application_count?: number | null
          created_at?: string | null
          currency?: string | null
          department?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_remote?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          organization_id?: string
          posted_by?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          slug?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          country_code: string
          created_at: string
          is_active: boolean
          is_default: boolean
          name: string
          native_name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          country_code: string
          created_at?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          native_name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          country_code?: string
          created_at?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          native_name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_organization_id: string | null
          sender_profile_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_organization_id?: string | null
          sender_profile_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_organization_id?: string | null
          sender_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_organization_id_fkey"
            columns: ["sender_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          connection_requests: boolean
          connections: boolean
          demo_reminders: boolean
          demo_requests: boolean
          email_notifications: boolean
          event_invites: boolean
          event_reminders: boolean
          events: boolean
          marketing_announcements: boolean
          marketing_emails: boolean
          messages: boolean
          product_updates: boolean
          profile_activity: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          quiet_hours_timezone: string
          security_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_requests?: boolean
          connections?: boolean
          demo_reminders?: boolean
          demo_requests?: boolean
          email_notifications?: boolean
          event_invites?: boolean
          event_reminders?: boolean
          events?: boolean
          marketing_announcements?: boolean
          marketing_emails?: boolean
          messages?: boolean
          product_updates?: boolean
          profile_activity?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quiet_hours_timezone?: string
          security_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_requests?: boolean
          connections?: boolean
          demo_reminders?: boolean
          demo_requests?: boolean
          email_notifications?: boolean
          event_invites?: boolean
          event_reminders?: boolean
          events?: boolean
          marketing_announcements?: boolean
          marketing_emails?: boolean
          messages?: boolean
          product_updates?: boolean
          profile_activity?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quiet_hours_timezone?: string
          security_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          badge_count: number | null
          collapse_key: string | null
          created_at: string | null
          data: Json | null
          dismissed_at: string | null
          entity_id: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          link_url: string | null
          message: string
          push_event_id: string | null
          thread_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          badge_count?: number | null
          collapse_key?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed_at?: string | null
          entity_id?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          link_url?: string | null
          message: string
          push_event_id?: string | null
          thread_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          badge_count?: number | null
          collapse_key?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed_at?: string | null
          entity_id?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          link_url?: string | null
          message?: string
          push_event_id?: string | null
          thread_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organization_followers: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          profile_id?: string
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
            foreignKeyName: "organization_followers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      organization_slug_redirects: {
        Row: {
          created_at: string
          old_slug: string
          org_id: string
        }
        Insert: {
          created_at?: string
          old_slug: string
          org_id: string
        }
        Update: {
          created_at?: string
          old_slug?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_slug_redirects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          broadcaster_genre: string | null
          broadcaster_type: string | null
          claimed_at: string | null
          contact_email: string | null
          country: string | null
          created_at: string | null
          description: string | null
          facebook_url: string | null
          followers_count: number
          id: string
          instagram_url: string | null
          is_featured: boolean
          is_platform_org: boolean
          is_stub: boolean
          linkedin_url: string | null
          logo_url: string | null
          main_activity: string | null
          merged_into_id: string | null
          name: string
          phone: string | null
          seeded_by: string | null
          slug: string
          source: string
          tagline: string | null
          tiktok_url: string | null
          type: string | null
          updated_at: string | null
          views_count: number
          website: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          broadcaster_genre?: string | null
          broadcaster_type?: string | null
          claimed_at?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          facebook_url?: string | null
          followers_count?: number
          id?: string
          instagram_url?: string | null
          is_featured?: boolean
          is_platform_org?: boolean
          is_stub?: boolean
          linkedin_url?: string | null
          logo_url?: string | null
          main_activity?: string | null
          merged_into_id?: string | null
          name: string
          phone?: string | null
          seeded_by?: string | null
          slug: string
          source?: string
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          views_count?: number
          website?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          broadcaster_genre?: string | null
          broadcaster_type?: string | null
          claimed_at?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          facebook_url?: string | null
          followers_count?: number
          id?: string
          instagram_url?: string | null
          is_featured?: boolean
          is_platform_org?: boolean
          is_stub?: boolean
          linkedin_url?: string | null
          logo_url?: string | null
          main_activity?: string | null
          merged_into_id?: string | null
          name?: string
          phone?: string | null
          seeded_by?: string | null
          slug?: string
          source?: string
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          views_count?: number
          website?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_merged_into_id_fkey"
            columns: ["merged_into_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_bookmarks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_community_resources: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_approved: boolean | null
          product_id: string
          title: string
          type: string
          updated_at: string
          upvotes_count: number | null
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          product_id: string
          title: string
          type: string
          updated_at?: string
          upvotes_count?: number | null
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          product_id?: string
          title?: string
          type?: string
          updated_at?: string
          upvotes_count?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_community_resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_community_resources_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_experts: {
        Row: {
          created_at: string | null
          expertise_level: string
          id: string
          is_verified: boolean | null
          product_id: string
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          expertise_level?: string
          id?: string
          is_verified?: boolean | null
          product_id: string
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          expertise_level?: string
          id?: string
          is_verified?: boolean | null
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
      product_resource_upvotes: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_resource_upvotes_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "product_community_resources"
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
      product_reviews: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_helpful_count: number | null
          is_visible: boolean | null
          product_id: string
          rating: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_helpful_count?: number | null
          is_visible?: boolean | null
          product_id: string
          rating: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_helpful_count?: number | null
          is_visible?: boolean | null
          product_id?: string
          rating?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability_status: string | null
          bookmarks_count: number | null
          certification_url: string | null
          course_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          documentation_url: string | null
          external_url: string | null
          gallery_urls: string[] | null
          id: string
          is_public: boolean | null
          logo_url: string | null
          main_category: string | null
          name: string
          organization_id: string
          price: number | null
          price_upon_request: boolean | null
          pricing_model: string | null
          product_type: string | null
          promo_video_url: string | null
          qr_code_url: string | null
          qr_scans_count: number | null
          short_description: string | null
          slug: string
          status: string | null
          sub_category: string | null
          support_url: string | null
          training_video_urls: string[] | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          availability_status?: string | null
          bookmarks_count?: number | null
          certification_url?: string | null
          course_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          documentation_url?: string | null
          external_url?: string | null
          gallery_urls?: string[] | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          main_category?: string | null
          name: string
          organization_id: string
          price?: number | null
          price_upon_request?: boolean | null
          pricing_model?: string | null
          product_type?: string | null
          promo_video_url?: string | null
          qr_code_url?: string | null
          qr_scans_count?: number | null
          short_description?: string | null
          slug: string
          status?: string | null
          sub_category?: string | null
          support_url?: string | null
          training_video_urls?: string[] | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          availability_status?: string | null
          bookmarks_count?: number | null
          certification_url?: string | null
          course_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          documentation_url?: string | null
          external_url?: string | null
          gallery_urls?: string[] | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          main_category?: string | null
          name?: string
          organization_id?: string
          price?: number | null
          price_upon_request?: boolean | null
          pricing_model?: string | null
          product_type?: string | null
          promo_video_url?: string | null
          qr_code_url?: string | null
          qr_scans_count?: number | null
          short_description?: string | null
          slug?: string
          status?: string | null
          sub_category?: string | null
          support_url?: string | null
          training_video_urls?: string[] | null
          updated_at?: string | null
          views_count?: number | null
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
      profile_experiences: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_year: number | null
          id: string
          is_current: boolean
          profile_id: string
          start_year: number
          title: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_year?: number | null
          id?: string
          is_current?: boolean
          profile_id: string
          start_year: number
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_year?: number | null
          id?: string
          is_current?: boolean
          profile_id?: string
          start_year?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          email: string | null
          facebook_url: string | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          headline: string | null
          hourly_rate: number | null
          id: string
          instagram_url: string | null
          is_admin: boolean
          is_demo_profile: boolean
          job_function: string | null
          job_title: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          preferred_language: string
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
          email?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          headline?: string | null
          hourly_rate?: number | null
          id: string
          instagram_url?: string | null
          is_admin?: boolean
          is_demo_profile?: boolean
          job_function?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          preferred_language?: string
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
          email?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          instagram_url?: string | null
          is_admin?: boolean
          is_demo_profile?: boolean
          job_function?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          preferred_language?: string
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
      push_delivery_logs: {
        Row: {
          created_at: string
          device_token_id: string | null
          error_code: string | null
          error_message: string | null
          event_id: string | null
          id: string
          notification_id: string | null
          notification_type: string
          payload: Json
          provider: string
          provider_message_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_token_id?: string | null
          error_code?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          notification_id?: string | null
          notification_type: string
          payload?: Json
          provider?: string
          provider_message_id?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_token_id?: string | null
          error_code?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          notification_id?: string | null
          notification_type?: string
          payload?: Json
          provider?: string
          provider_message_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      push_event_dedupes: {
        Row: {
          created_at: string
          event_id: string
          notification_type: string
          recipient_user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          notification_type: string
          recipient_user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          notification_type?: string
          recipient_user_id?: string
        }
        Relationships: []
      }
      review_helpful_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpful_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_interval: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          gifted_by: string | null
          gifted_note: string | null
          gifted_until: string | null
          id: string
          organization_id: string | null
          plan: string
          plan_track: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_interval?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          gifted_by?: string | null
          gifted_note?: string | null
          gifted_until?: string | null
          id?: string
          organization_id?: string | null
          plan?: string
          plan_track?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_interval?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          gifted_by?: string | null
          gifted_note?: string | null
          gifted_until?: string | null
          id?: string
          organization_id?: string | null
          plan?: string
          plan_track?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          message: string
          replied_at: string | null
          replied_by: string | null
          status: string
          subject: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message?: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_org: { Args: { org_id: string }; Returns: boolean }
      create_demo_request_with_notification: {
        Args: {
          p_company_name: string
          p_contact_email: string
          p_contact_name: string
          p_contact_phone: string
          p_message: string
          p_organization_id: string
          p_product_id: string
          p_request_type?: string
          p_requester_id: string
        }
        Returns: string
      }
      decrement_resource_upvote: {
        Args: { resource_id: string }
        Returns: undefined
      }
      get_user_plan: { Args: { p_user_id: string }; Returns: string }
      increment_ad_click: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      increment_ad_impression: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      increment_blog_post_view: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      increment_organization_views: {
        Args: { organization_id: string }
        Returns: undefined
      }
      increment_product_qr_scans: {
        Args: { product_id: string }
        Returns: undefined
      }
      increment_product_views: {
        Args: { product_id: string }
        Returns: undefined
      }
      increment_resource_upvote: {
        Args: { resource_id: string }
        Returns: undefined
      }
      is_conversation_participant: {
        Args: { conv_id: string }
        Returns: boolean
      }
      is_org_admin: { Args: { org_id: string }; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_site_admin: { Args: never; Returns: boolean }
      notify_ai_setup_owners: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      user_has_plan: {
        Args: { p_user_id: string; required_plans: string[] }
        Returns: boolean
      }
    }
    Enums: {
      connection_status: "pending" | "accepted" | "rejected"
      event_interest_type: "going" | "maybe"
      event_status: "draft" | "published" | "cancelled" | "completed"
      event_type:
        | "conference"
        | "webinar"
        | "workshop"
        | "meetup"
        | "trade_show"
        | "summit"
        | "award_ceremony"
        | "networking"
        | "training"
        | "other"
      expertise_level: "beginner" | "intermediate" | "advanced" | "certified"
      job_application_status:
        | "submitted"
        | "reviewed"
        | "interview_scheduled"
        | "rejected"
        | "accepted"
        | "withdrawn"
      job_status: "draft" | "open" | "closed"
      job_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "freelance"
        | "internship"
        | "temporary"
      member_role: "owner" | "admin" | "editor" | "viewer"
      registration_status: "registered" | "waitlisted" | "cancelled"
      resource_type:
        | "official_link"
        | "documentation"
        | "certification"
        | "training"
        | "youtube"
        | "community_link"
      resume_type: "link" | "pdf"
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
      connection_status: ["pending", "accepted", "rejected"],
      event_interest_type: ["going", "maybe"],
      event_status: ["draft", "published", "cancelled", "completed"],
      event_type: [
        "conference",
        "webinar",
        "workshop",
        "meetup",
        "trade_show",
        "summit",
        "award_ceremony",
        "networking",
        "training",
        "other",
      ],
      expertise_level: ["beginner", "intermediate", "advanced", "certified"],
      job_application_status: [
        "submitted",
        "reviewed",
        "interview_scheduled",
        "rejected",
        "accepted",
        "withdrawn",
      ],
      job_status: ["draft", "open", "closed"],
      job_type: [
        "full_time",
        "part_time",
        "contract",
        "freelance",
        "internship",
        "temporary",
      ],
      member_role: ["owner", "admin", "editor", "viewer"],
      registration_status: ["registered", "waitlisted", "cancelled"],
      resource_type: [
        "official_link",
        "documentation",
        "certification",
        "training",
        "youtube",
        "community_link",
      ],
      resume_type: ["link", "pdf"],
    },
  },
} as const
