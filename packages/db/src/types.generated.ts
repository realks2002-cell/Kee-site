export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      kee_branches: {
        Row: {
          alive_count: number | null
          description: string | null
          display_order: number | null
          founder_alias: string | null
          founder_alias_hanja: string | null
          founder_person_id: number | null
          founder_title: string | null
          generation_split: number | null
          id: number
          is_active: boolean | null
          level: number
          lineage_name: string | null
          name_alt: string | null
          name_ko: string
          parent_branch_id: number | null
          path: unknown
          stats_updated_at: string | null
          total_count: number | null
        }
        Insert: {
          alive_count?: number | null
          description?: string | null
          display_order?: number | null
          founder_alias?: string | null
          founder_alias_hanja?: string | null
          founder_person_id?: number | null
          founder_title?: string | null
          generation_split?: number | null
          id?: number
          is_active?: boolean | null
          level: number
          lineage_name?: string | null
          name_alt?: string | null
          name_ko: string
          parent_branch_id?: number | null
          path: unknown
          stats_updated_at?: string | null
          total_count?: number | null
        }
        Update: {
          alive_count?: number | null
          description?: string | null
          display_order?: number | null
          founder_alias?: string | null
          founder_alias_hanja?: string | null
          founder_person_id?: number | null
          founder_title?: string | null
          generation_split?: number | null
          id?: number
          is_active?: boolean | null
          level?: number
          lineage_name?: string | null
          name_alt?: string | null
          name_ko?: string
          parent_branch_id?: number | null
          path?: unknown
          stats_updated_at?: string | null
          total_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kee_branches_founder_person_id_fkey"
            columns: ["founder_person_id"]
            isOneToOne: false
            referencedRelation: "kee_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_branches_parent_branch_id_fkey"
            columns: ["parent_branch_id"]
            isOneToOne: false
            referencedRelation: "kee_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      kee_clans: {
        Row: {
          aliases: string[] | null
          daughter_in_law_count: number | null
          id: number
          name_hanja: string | null
          name_ko: string
          origin_place: string | null
          origin_place_hanja: string | null
          son_in_law_count: number | null
          surname_hanja: string | null
          surname_ko: string | null
          total_count: number | null
        }
        Insert: {
          aliases?: string[] | null
          daughter_in_law_count?: number | null
          id?: number
          name_hanja?: string | null
          name_ko: string
          origin_place?: string | null
          origin_place_hanja?: string | null
          son_in_law_count?: number | null
          surname_hanja?: string | null
          surname_ko?: string | null
          total_count?: number | null
        }
        Update: {
          aliases?: string[] | null
          daughter_in_law_count?: number | null
          id?: number
          name_hanja?: string | null
          name_ko?: string
          origin_place?: string | null
          origin_place_hanja?: string | null
          son_in_law_count?: number | null
          surname_hanja?: string | null
          surname_ko?: string | null
          total_count?: number | null
        }
        Relationships: []
      }
      kee_gaseungbo_orders: {
        Row: {
          copies: number
          created_at: string | null
          id: number
          payment_code: string | null
          payment_status: string | null
          pdf_generated_path: string | null
          person_id: number
          print_vendor_order_id: string | null
          shipping_address: Json | null
          shipping_status: string | null
          total_amount: number | null
          tracking_number: string | null
          unit_price: number | null
          user_id: number
        }
        Insert: {
          copies: number
          created_at?: string | null
          id?: number
          payment_code?: string | null
          payment_status?: string | null
          pdf_generated_path?: string | null
          person_id: number
          print_vendor_order_id?: string | null
          shipping_address?: Json | null
          shipping_status?: string | null
          total_amount?: number | null
          tracking_number?: string | null
          unit_price?: number | null
          user_id: number
        }
        Update: {
          copies?: number
          created_at?: string | null
          id?: number
          payment_code?: string | null
          payment_status?: string | null
          pdf_generated_path?: string | null
          person_id?: number
          print_vendor_order_id?: string | null
          shipping_address?: Json | null
          shipping_status?: string | null
          total_amount?: number | null
          tracking_number?: string | null
          unit_price?: number | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "kee_gaseungbo_orders_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "kee_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_gaseungbo_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "kee_users"
            referencedColumns: ["id"]
          },
        ]
      }
      kee_hangryeolja_table: {
        Row: {
          character_hanja: string
          character_ko: string
          confidence: number | null
          generation: number
          id: number
          is_verified: boolean | null
          notes: string | null
          position: string
          verified_by: number | null
        }
        Insert: {
          character_hanja: string
          character_ko: string
          confidence?: number | null
          generation: number
          id?: number
          is_verified?: boolean | null
          notes?: string | null
          position: string
          verified_by?: number | null
        }
        Update: {
          character_hanja?: string
          character_ko?: string
          confidence?: number | null
          generation?: number
          id?: number
          is_verified?: boolean | null
          notes?: string | null
          position?: string
          verified_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kee_hangryeolja_table_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "kee_users"
            referencedColumns: ["id"]
          },
        ]
      }
      kee_person_change_log: {
        Row: {
          application_id: number | null
          approved_at: string | null
          approved_by: number | null
          changed_by: number
          created_at: string | null
          evidence_documents: Json | null
          field_name: string
          id: number
          new_value: string | null
          old_value: string | null
          person_id: number
          reason: string | null
        }
        Insert: {
          application_id?: number | null
          approved_at?: string | null
          approved_by?: number | null
          changed_by: number
          created_at?: string | null
          evidence_documents?: Json | null
          field_name: string
          id?: number
          new_value?: string | null
          old_value?: string | null
          person_id: number
          reason?: string | null
        }
        Update: {
          application_id?: number | null
          approved_at?: string | null
          approved_by?: number | null
          changed_by?: number
          created_at?: string | null
          evidence_documents?: Json | null
          field_name?: string
          id?: number
          new_value?: string | null
          old_value?: string | null
          person_id?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kee_person_change_log_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "kee_sudan_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_person_change_log_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "kee_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_person_change_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "kee_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_person_change_log_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "kee_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      kee_person_photos: {
        Row: {
          category: string
          id: number
          original_size: number | null
          person_id: number
          slot: number
          storage_path: string
          thumbnail_path: string | null
          uploaded_at: string | null
          uploaded_by: number | null
        }
        Insert: {
          category: string
          id?: number
          original_size?: number | null
          person_id: number
          slot: number
          storage_path: string
          thumbnail_path?: string | null
          uploaded_at?: string | null
          uploaded_by?: number | null
        }
        Update: {
          category?: string
          id?: number
          original_size?: number | null
          person_id?: number
          slot?: number
          storage_path?: string
          thumbnail_path?: string | null
          uploaded_at?: string | null
          uploaded_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kee_person_photos_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "kee_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_person_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "kee_users"
            referencedColumns: ["id"]
          },
        ]
      }
      kee_persons: {
        Row: {
          birth_date_western: string | null
          birth_ganji: string | null
          birth_is_lunar: boolean | null
          birth_lunar_day: number | null
          birth_lunar_month: number | null
          birth_year: number | null
          branch_id: number | null
          child_label: string | null
          created_at: string | null
          death_date_western: string | null
          death_ganji: string | null
          death_is_lunar: boolean | null
          death_lunar_day: number | null
          death_lunar_month: number | null
          death_year: number | null
          gender: string
          generation: number
          gyeongryeok: string | null
          ho: string | null
          ho_hanja: string | null
          id: number
          is_alive: boolean | null
          ja_hanja: string | null
          ja_ko: string | null
          jokbo_translation: string | null
          jokbo_wonmun: string | null
          legacy_id: number | null
          name_hanja: string | null
          name_ko: string
          occupation: string | null
          search_text: unknown
          siho: string | null
          siho_hanja: string | null
          tomb_address: string | null
          tomb_description: string | null
          tomb_direction: string | null
          updated_at: string | null
          yagryeok: string | null
        }
        Insert: {
          birth_date_western?: string | null
          birth_ganji?: string | null
          birth_is_lunar?: boolean | null
          birth_lunar_day?: number | null
          birth_lunar_month?: number | null
          birth_year?: number | null
          branch_id?: number | null
          child_label?: string | null
          created_at?: string | null
          death_date_western?: string | null
          death_ganji?: string | null
          death_is_lunar?: boolean | null
          death_lunar_day?: number | null
          death_lunar_month?: number | null
          death_year?: number | null
          gender: string
          generation: number
          gyeongryeok?: string | null
          ho?: string | null
          ho_hanja?: string | null
          id?: number
          is_alive?: boolean | null
          ja_hanja?: string | null
          ja_ko?: string | null
          jokbo_translation?: string | null
          jokbo_wonmun?: string | null
          legacy_id?: number | null
          name_hanja?: string | null
          name_ko: string
          occupation?: string | null
          search_text?: unknown
          siho?: string | null
          siho_hanja?: string | null
          tomb_address?: string | null
          tomb_description?: string | null
          tomb_direction?: string | null
          updated_at?: string | null
          yagryeok?: string | null
        }
        Update: {
          birth_date_western?: string | null
          birth_ganji?: string | null
          birth_is_lunar?: boolean | null
          birth_lunar_day?: number | null
          birth_lunar_month?: number | null
          birth_year?: number | null
          branch_id?: number | null
          child_label?: string | null
          created_at?: string | null
          death_date_western?: string | null
          death_ganji?: string | null
          death_is_lunar?: boolean | null
          death_lunar_day?: number | null
          death_lunar_month?: number | null
          death_year?: number | null
          gender?: string
          generation?: number
          gyeongryeok?: string | null
          ho?: string | null
          ho_hanja?: string | null
          id?: number
          is_alive?: boolean | null
          ja_hanja?: string | null
          ja_ko?: string | null
          jokbo_translation?: string | null
          jokbo_wonmun?: string | null
          legacy_id?: number | null
          name_hanja?: string | null
          name_ko?: string
          occupation?: string | null
          search_text?: unknown
          siho?: string | null
          siho_hanja?: string | null
          tomb_address?: string | null
          tomb_description?: string | null
          tomb_direction?: string | null
          updated_at?: string | null
          yagryeok?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kee_persons_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "kee_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      kee_relationships: {
        Row: {
          child_order: number | null
          created_at: string | null
          evidence_documents: Json | null
          id: number
          is_legitimate: boolean | null
          is_primary: boolean | null
          note: string | null
          person_id: number
          related_id: number | null
          type: string
        }
        Insert: {
          child_order?: number | null
          created_at?: string | null
          evidence_documents?: Json | null
          id?: number
          is_legitimate?: boolean | null
          is_primary?: boolean | null
          note?: string | null
          person_id: number
          related_id?: number | null
          type: string
        }
        Update: {
          child_order?: number | null
          created_at?: string | null
          evidence_documents?: Json | null
          id?: number
          is_legitimate?: boolean | null
          is_primary?: boolean | null
          note?: string | null
          person_id?: number
          related_id?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "kee_relationships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "kee_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_relationships_related_id_fkey"
            columns: ["related_id"]
            isOneToOne: false
            referencedRelation: "kee_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      kee_spouses: {
        Row: {
          created_at: string | null
          id: number
          is_primary: boolean | null
          marriage_date: string | null
          order_num: number
          person_id: number
          spouse_birth_date: string | null
          spouse_clan_id: number | null
          spouse_clan_raw: string | null
          spouse_death_date: string | null
          spouse_father_name: string | null
          spouse_is_foreign: boolean | null
          spouse_name_hanja: string | null
          spouse_name_ko: string | null
          spouse_nationality: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_primary?: boolean | null
          marriage_date?: string | null
          order_num: number
          person_id: number
          spouse_birth_date?: string | null
          spouse_clan_id?: number | null
          spouse_clan_raw?: string | null
          spouse_death_date?: string | null
          spouse_father_name?: string | null
          spouse_is_foreign?: boolean | null
          spouse_name_hanja?: string | null
          spouse_name_ko?: string | null
          spouse_nationality?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_primary?: boolean | null
          marriage_date?: string | null
          order_num?: number
          person_id?: number
          spouse_birth_date?: string | null
          spouse_clan_id?: number | null
          spouse_clan_raw?: string | null
          spouse_death_date?: string | null
          spouse_father_name?: string | null
          spouse_is_foreign?: boolean | null
          spouse_name_hanja?: string | null
          spouse_name_ko?: string | null
          spouse_nationality?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kee_spouses_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "kee_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_spouses_spouse_clan_id_fkey"
            columns: ["spouse_clan_id"]
            isOneToOne: false
            referencedRelation: "kee_clans"
            referencedColumns: ["id"]
          },
        ]
      }
      kee_sudan_applications: {
        Row: {
          applicant_user_id: number
          application_type: string
          created_at: string | null
          deposit_confirmed_at: string | null
          deposit_confirmed_by: number | null
          deposit_note: string | null
          id: number
          payload: Json
          payment_amount: number
          payment_code: string | null
          payment_status: string | null
          photos: Json | null
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: number | null
          status: string
          target_person_id: number | null
          updated_at: string | null
        }
        Insert: {
          applicant_user_id: number
          application_type: string
          created_at?: string | null
          deposit_confirmed_at?: string | null
          deposit_confirmed_by?: number | null
          deposit_note?: string | null
          id?: number
          payload: Json
          payment_amount: number
          payment_code?: string | null
          payment_status?: string | null
          photos?: Json | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: number | null
          status?: string
          target_person_id?: number | null
          updated_at?: string | null
        }
        Update: {
          applicant_user_id?: number
          application_type?: string
          created_at?: string | null
          deposit_confirmed_at?: string | null
          deposit_confirmed_by?: number | null
          deposit_note?: string | null
          id?: number
          payload?: Json
          payment_amount?: number
          payment_code?: string | null
          payment_status?: string | null
          photos?: Json | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: number | null
          status?: string
          target_person_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kee_sudan_applications_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "kee_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_sudan_applications_deposit_confirmed_by_fkey"
            columns: ["deposit_confirmed_by"]
            isOneToOne: false
            referencedRelation: "kee_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_sudan_applications_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "kee_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_sudan_applications_target_person_id_fkey"
            columns: ["target_person_id"]
            isOneToOne: false
            referencedRelation: "kee_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      kee_users: {
        Row: {
          branch_id: number | null
          created_at: string | null
          email: string | null
          id: number
          is_public: boolean | null
          last_login_at: string | null
          name_hanja: string | null
          name_ko: string
          phone: string | null
          role: string | null
          verification_note: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: number | null
          verified_person_id: number | null
        }
        Insert: {
          branch_id?: number | null
          created_at?: string | null
          email?: string | null
          id?: number
          is_public?: boolean | null
          last_login_at?: string | null
          name_hanja?: string | null
          name_ko: string
          phone?: string | null
          role?: string | null
          verification_note?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: number | null
          verified_person_id?: number | null
        }
        Update: {
          branch_id?: number | null
          created_at?: string | null
          email?: string | null
          id?: number
          is_public?: boolean | null
          last_login_at?: string | null
          name_hanja?: string | null
          name_ko?: string
          phone?: string | null
          role?: string | null
          verification_note?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: number | null
          verified_person_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kee_users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "kee_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_users_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "kee_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kee_users_verified_person_id_fkey"
            columns: ["verified_person_id"]
            isOneToOne: false
            referencedRelation: "kee_persons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      kee_calculate_chonsu: {
        Args: {
          p_person_a: number
          p_person_b: number
          p_use_adoptive?: boolean
        }
        Returns: {
          chonsu: number
          common_ancestor_id: number
          common_ancestor_name: string
        }[]
      }
      kee_get_direct_lineage: {
        Args: {
          p_ancestors_levels?: number
          p_descendants_levels?: number
          p_target_person_id: number
        }
        Returns: Json
      }
      kee_search_persons: {
        Args: {
          limit_count?: number
          q_branch_id?: number
          q_father?: string
          q_generation?: number
          q_gwanjik?: string
          q_ho?: string
          q_ja?: string
          q_name?: string
          q_spouse?: string
        }
        Returns: {
          branch_id: number
          branch_name: string
          father_name: string
          generation: number
          grandfather_name: string
          great_grandfather_name: string
          id: number
          is_alive: boolean
          name_hanja: string
          name_ko: string
        }[]
      }
      kee_truncate_demo: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      text2ltree: { Args: { "": string }; Returns: unknown }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

