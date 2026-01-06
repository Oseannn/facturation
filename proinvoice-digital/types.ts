
export enum InvoiceStatus {
  DRAFT = 'Brouillon',
  SENT = 'Envoyée',
  PENDING = 'En attente de paiement',
  PAID = 'Payée',
  LATE = 'En retard',
}

export enum ServiceType {
  FLAT = 'Forfait',
  HOURLY = 'Taux Horaire',
  DAILY = 'Taux Journalier (TJM)',
}

export interface Client {
  id: string;
  name: string; // Company or Person name
  email?: string; // Optional
  phone: string;
  address: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ServiceType;
}

export interface InvoiceItem {
  id: string;
  serviceId?: string; // Optional link to catalog
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string; // e.g., FAC-2024-001
  date: string;
  dueDate: string;
  clientId: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  taxRate: number; // Percentage (e.g., 20)
  notes?: string;
}

export interface CompanyProfile {
  name: string;
  email: string;
  address: string;
  phone: string;
  siret: string;
  iban: string;
  bic: string;
  logoUrl?: string;
  footerText?: string;
}
