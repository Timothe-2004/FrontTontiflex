import { LucideIcon } from "lucide-react";

//Auth
export interface RegisterData {
  username: string;
  lastname: string;
  firstname: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  birthDate: string;
  password: string;
}
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

//Hero 
export interface ImageHero {
  src: string;
  alt: string;
  size: string;
}
//Sidebar
export interface Sidebar {
  id: number;
  label: string;
  icon: LucideIcon;
  link: string;
}


//Feature
export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    size?: number;
  }>;
}

//Faqs
export interface FAQ {
  id: number;
  question: string;
  answer: string;
} 


export interface Tontine {
  id: string;
  name: string;
  sfd: string;
  type: string;
  minAmount: number;
  maxAmount: number;
  frequency: string;
  duration: string;
  members: number;
  currentMembers: number;
  fraisAdhesion: number;
  status: 'active' | 'en_cours' | 'terminee';
  dateAdhesion: string;
  miseJournaliere: number;
  soldeActuel: number;
  totalCotise: number;
  prochaineCycle: string;
  numeroCarnet: number;
}