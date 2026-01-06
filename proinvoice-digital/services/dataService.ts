import { Client, Service, Invoice, CompanyProfile } from "../types";
import { MOCK_CLIENTS, MOCK_SERVICES, DEFAULT_COMPANY } from "../constants";

const KEYS = {
  CLIENTS: 'proinvoice_clients',
  SERVICES: 'proinvoice_services',
  INVOICES: 'proinvoice_invoices',
  COMPANY: 'proinvoice_company',
};

export const dataService = {
  // Clients
  getClients: (): Client[] => {
    const data = localStorage.getItem(KEYS.CLIENTS);
    return data ? JSON.parse(data) : MOCK_CLIENTS;
  },
  saveClient: (client: Client) => {
    const clients = dataService.getClients();
    const existingIndex = clients.findIndex(c => c.id === client.id);
    if (existingIndex >= 0) {
      clients[existingIndex] = client;
    } else {
      clients.push(client);
    }
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  },
  deleteClient: (id: string) => {
    const clients = dataService.getClients().filter(c => c.id !== id);
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  },

  // Services
  getServices: (): Service[] => {
    const data = localStorage.getItem(KEYS.SERVICES);
    return data ? JSON.parse(data) : MOCK_SERVICES;
  },
  saveService: (service: Service) => {
    const services = dataService.getServices();
    const existingIndex = services.findIndex(s => s.id === service.id);
    if (existingIndex >= 0) {
      services[existingIndex] = service;
    } else {
      services.push(service);
    }
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },
  deleteService: (id: string) => {
    const services = dataService.getServices().filter(s => s.id !== id);
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },

  // Invoices
  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem(KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  },
  saveInvoice: (invoice: Invoice) => {
    const invoices = dataService.getInvoices();
    const existingIndex = invoices.findIndex(i => i.id === invoice.id);
    if (existingIndex >= 0) {
      invoices[existingIndex] = invoice;
    } else {
      invoices.push(invoice);
    }
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  },
  deleteInvoice: (id: string) => {
    const invoices = dataService.getInvoices().filter(i => i.id !== id);
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  },
  getNextInvoiceNumber: (): string => {
    const invoices = dataService.getInvoices();
    const currentYear = new Date().getFullYear();
    const prefix = `FAC-${currentYear}-`;
    
    // Filter invoices for current year
    const yearInvoices = invoices.filter(i => i.number.startsWith(prefix));
    
    if (yearInvoices.length === 0) {
      return `${prefix}001`;
    }

    // Sort by sequence number
    const maxSeq = yearInvoices.reduce((max, inv) => {
      const parts = inv.number.split('-');
      const seq = parseInt(parts[2] || '0', 10);
      return seq > max ? seq : max;
    }, 0);

    return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
  },

  // Company Profile
  getCompany: (): CompanyProfile => {
    const data = localStorage.getItem(KEYS.COMPANY);
    return data ? JSON.parse(data) : DEFAULT_COMPANY;
  },
  saveCompany: (company: CompanyProfile) => {
    localStorage.setItem(KEYS.COMPANY, JSON.stringify(company));
  }
};
