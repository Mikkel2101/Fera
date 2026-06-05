// Generert manuelt fra 001_foundation migrasjonen.
// Oppdater med: npx supabase gen types typescript --project-id dbvnuoayzevtoaolhqxd > lib/supabase/types.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          padel_level: string | null
          newsletter_consent: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          padel_level?: string | null
          newsletter_consent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          padel_level?: string | null
          newsletter_consent?: boolean
          created_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          user_id: string | null
          brand: string
          text: string
          rating: number | null
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          brand: string
          text: string
          rating?: number | null
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          brand?: string
          text?: string
          rating?: number | null
          approved?: boolean
          created_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          brands: string[]
          subscribed_at: string
        }
        Insert: {
          id?: string
          email: string
          brands?: string[]
          subscribed_at?: string
        }
        Update: {
          id?: string
          email?: string
          brands?: string[]
          subscribed_at?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          id: string
          name: string
          destination: string
          hotel: string | null
          start_date: string
          end_date: string
          price_double_eur: number
          price_single_eur: number | null
          deposit_eur: number
          early_bird_price_double: number | null
          early_bird_price_single: number | null
          early_bird_deadline: string | null
          max_participants: number | null
          registered_count: number
          status: string
          trip_type: string | null
          description: string | null
          program: string | null
          included: string[]
          not_included: string[]
          extras: Json
          coaches: Json
          faq: Json
          main_image: string | null
          gallery_images: string[]
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          destination: string
          hotel?: string | null
          start_date: string
          end_date: string
          price_double_eur: number
          price_single_eur?: number | null
          deposit_eur?: number
          early_bird_price_double?: number | null
          early_bird_price_single?: number | null
          early_bird_deadline?: string | null
          max_participants?: number | null
          registered_count?: number
          status?: string
          trip_type?: string | null
          description?: string | null
          program?: string | null
          included?: string[]
          not_included?: string[]
          extras?: Json
          coaches?: Json
          faq?: Json
          main_image?: string | null
          gallery_images?: string[]
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          destination?: string
          hotel?: string | null
          start_date?: string
          end_date?: string
          price_double_eur?: number
          price_single_eur?: number | null
          deposit_eur?: number
          early_bird_price_double?: number | null
          early_bird_price_single?: number | null
          early_bird_deadline?: string | null
          max_participants?: number | null
          registered_count?: number
          status?: string
          trip_type?: string | null
          description?: string | null
          program?: string | null
          included?: string[]
          not_included?: string[]
          extras?: Json
          coaches?: Json
          faq?: Json
          main_image?: string | null
          gallery_images?: string[]
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          user_id: string | null
          trip_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          room_type: string | null
          roommate_name: string | null
          padel_level: string | null
          selected_extras: string[]
          deposit_status: string
          deposit_date: string | null
          rest_paid: boolean
          stripe_session_id: string | null
          referral_code: string | null
          special_requests: string | null
          gdpr_consent: boolean
          terms_accepted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          trip_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          room_type?: string | null
          roommate_name?: string | null
          padel_level?: string | null
          selected_extras?: string[]
          deposit_status?: string
          deposit_date?: string | null
          rest_paid?: boolean
          stripe_session_id?: string | null
          referral_code?: string | null
          special_requests?: string | null
          gdpr_consent?: boolean
          terms_accepted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          trip_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          room_type?: string | null
          roommate_name?: string | null
          padel_level?: string | null
          selected_extras?: string[]
          deposit_status?: string
          deposit_date?: string | null
          rest_paid?: boolean
          stripe_session_id?: string | null
          referral_code?: string | null
          special_requests?: string | null
          gdpr_consent?: boolean
          terms_accepted?: boolean
          created_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          id: string
          partner_name: string
          code: string
          commission_eur: number | null
          active: boolean
          uses_count: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          partner_name: string
          code: string
          commission_eur?: number | null
          active?: boolean
          uses_count?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          partner_name?: string
          code?: string
          commission_eur?: number | null
          active?: boolean
          uses_count?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          id: string
          trip_id: string
          email: string
          user_id: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          email: string
          user_id?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          email?: string
          user_id?: string | null
          joined_at?: string
        }
        Relationships: []
      }
      b2b_inquiries: {
        Row: {
          id: string
          name: string
          organization: string | null
          type: string | null
          email: string
          phone: string | null
          city: string | null
          estimated_participants: number | null
          preferred_season: string | null
          message: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          organization?: string | null
          type?: string | null
          email: string
          phone?: string | null
          city?: string | null
          estimated_participants?: number | null
          preferred_season?: string | null
          message?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          organization?: string | null
          type?: string | null
          email?: string
          phone?: string | null
          city?: string | null
          estimated_participants?: number | null
          preferred_season?: string | null
          message?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name_no: string
          description_no: string | null
          price_nok: number
          original_price_eur: number | null
          brand: string | null
          category: string | null
          images: string[]
          ean: string | null
          sku: string | null
          stock_status: string
          padelpoint_id: string | null
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name_no: string
          description_no?: string | null
          price_nok: number
          original_price_eur?: number | null
          brand?: string | null
          category?: string | null
          images?: string[]
          ean?: string | null
          sku?: string | null
          stock_status?: string
          padelpoint_id?: string | null
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name_no?: string
          description_no?: string | null
          price_nok?: number
          original_price_eur?: number | null
          brand?: string | null
          category?: string | null
          images?: string[]
          ean?: string | null
          sku?: string | null
          stock_status?: string
          padelpoint_id?: string | null
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          email: string
          status: string
          total_nok: number
          stripe_session_id: string | null
          shipping_address: Json | null
          padelpoint_order_id: string | null
          items: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          status?: string
          total_nok: number
          stripe_session_id?: string | null
          shipping_address?: Json | null
          padelpoint_order_id?: string | null
          items: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          status?: string
          total_nok?: number
          stripe_session_id?: string | null
          shipping_address?: Json | null
          padelpoint_order_id?: string | null
          items?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
