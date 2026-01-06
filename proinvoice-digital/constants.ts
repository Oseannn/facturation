import { CompanyProfile, Client, Service } from "./types";

export const DEFAULT_COMPANY: CompanyProfile = {
  name: "Votre Entreprise",
  email: "", 
  address: "",
  phone: "", 
  siret: "", 
  iban: "", 
  bic: "",
  logoUrl: "", 
  footerText: ""
};

export const MOCK_CLIENTS: Client[] = [];

export const MOCK_SERVICES: Service[] = [];