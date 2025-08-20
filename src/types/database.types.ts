export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          login_id: string;
          password: string;
          role: string;
          name: string | null;
          email: string | null;
          last_login_at: string | null; // timestamptz
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          login_id: string;
          password: string;
          role: string;
          name?: string | null;
          email?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      histories: {
        Row: {
          id: string;
          title: string;
          content: string | null;
          image_url: string | null;
          date: string | null; // date
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string | null;
          image_url?: string | null;
          date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["histories"]["Insert"]>;
      };
      school_info: {
        Row: {
          id: string;
          school_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["school_info"]["Insert"]>;
      };
      principals: {
        Row: {
          id: string;
          name: string | null;
          year: number | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          year?: number | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["principals"]["Insert"]>;
      };
      school_details: {
        Row: {
          id: string;
          principal_name: string | null;
          principal_image_url: string | null;
          greeting_url: string | null;
          school_logo_url: string | null;
          motto_url: string | null;
          school_flower_url: string | null;
          school_tree_url: string | null;
          anthem_sheet_url: string | null;
          founding_date: string | null; // date
          created_at: string;
          updated_at: string;
          anthem_audio_url: string | null;
        };
        Insert: {
          id?: string;
          principal_name?: string | null;
          principal_image_url?: string | null;
          greeting_url?: string | null;
          school_logo_url?: string | null;
          motto_url?: string | null;
          school_flower_url?: string | null;
          school_tree_url?: string | null;
          anthem_sheet_url?: string | null;
          founding_date?: string | null;
          created_at?: string;
          updated_at?: string;
          anthem_audio_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["school_details"]["Insert"]>;
      };
      settings: {
        Row: {
          id: string;
          background1_url: string | null;
          background2_url: string | null;
          background3_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          background1_url?: string | null;
          background2_url?: string | null;
          background3_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
      tags: {
        Row: {
          id: string;
          tag_name: string;
          order_num: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tag_name: string;
          order_num?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      event_albums: {
        Row: {
          id: string;
          image_url: string;
          comment: string | null;
          date: string | null; // date
          order_num: number | null;
          tag_id: string | null; // uuid
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          comment?: string | null;
          date?: string | null;
          order_num?: number | null;
          tag_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_albums"]["Insert"]>;
      };
      graduation_albums: {
        Row: {
          id: string;
          cover_url: string;
          year: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cover_url: string;
          year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["graduation_albums"]["Insert"]>;
      };
      graduation_classes: {
        Row: {
          id: string;
          year: number | null;
          class_number: number | null;
          homeroom_teacher_name: string | null;
          homeroom_teacher_photo_url: string | null;
          group_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year?: number | null;
          class_number?: number | null;
          homeroom_teacher_name?: string | null;
          homeroom_teacher_photo_url?: string | null;
          group_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["graduation_classes"]["Insert"]>;
      };
      graduates: {
        Row: {
          id: string;
          year: number | null;
          class_number: number | null;
          name: string | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year?: number | null;
          class_number?: number | null;
          name?: string | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["graduates"]["Insert"]>;
      };
      staff: {
        Row: {
          id: string;
          year: number | null;
          position: string | null;
          responsibility: string | null;
          name: string | null;
          photo_url: string | null;
          order_num: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year?: number | null;
          position?: string | null;
          responsibility?: string | null;
          name?: string | null;
          photo_url?: string | null;
          order_num?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};




