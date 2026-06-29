export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      platform_stats: {
        Row: {
          id: number
          tvl_eth: number
          participants: number
          rewards_paid_eth: number
          active_validators: number
          updated_at: string
        }
        Insert: {
          id?: number
          tvl_eth?: number
          participants?: number
          rewards_paid_eth?: number
          active_validators?: number
          updated_at?: string
        }
        Update: {
          id?: number
          tvl_eth?: number
          participants?: number
          rewards_paid_eth?: number
          active_validators?: number
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          wallet_address: string
          created_at: string
          last_seen_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          created_at?: string
          last_seen_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          created_at?: string
          last_seen_at?: string
        }
        Relationships: []
      }
      stakes: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          amount_eth: number
          plan_days: number
          apy: number
          status: string
          started_at: string
          ends_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_address: string
          amount_eth: number
          plan_days: number
          apy: number
          status?: string
          started_at?: string
          ends_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_address?: string
          amount_eth?: number
          plan_days?: number
          apy?: number
          status?: string
          started_at?: string
          ends_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
