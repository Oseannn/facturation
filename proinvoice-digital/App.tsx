import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  FileText, 
  Briefcase, 
  LayoutGrid, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  Printer, 
  Mail, 
  ChevronRight, 
  Clock,
  ArrowRight,
  TrendingUp,
  Settings,
  Upload,
  Image as ImageIcon,
  Calendar,
  Save,
  X,
  ChevronDown,
  Download
} from 'lucide-react';

// Internal Imports
import { Client, Service, Invoice, InvoiceStatus, ServiceType, CompanyProfile, InvoiceItem } from './types';
import { dataService } from './services/dataService';
import { PDFTemplate } from './components/PDFTemplate';

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
};

// --- Shared UI Components ---

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-zinc-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const ButtonPrimary: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button 
    className={`bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition-transform active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`} 
    {...props} 
  />
);

const ButtonSecondary: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button 
    className={`bg-white border border-zinc-200 text-zinc-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`} 
    {...props} 
  />
);

const Badge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const styles = {
    [InvoiceStatus.PAID]: 'bg-zinc-900 text-white',
    [InvoiceStatus.SENT]: 'bg-zinc-100 text-zinc-900 border border-zinc-200',
    [InvoiceStatus.PENDING]: 'bg-orange-50 text-orange-700 border border-orange-200',
    [InvoiceStatus.DRAFT]: 'bg-white text-zinc-400 border border-zinc-100 border-dashed',
    [InvoiceStatus.LATE]: 'bg-red-50 text-red-600 border border-red-100',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- Sub-components for Views ---

// 1. Dashboard Component
const Dashboard: React.FC<{
  invoices: Invoice[];
  clients: Client[];
  setPage: (p: string) => void;
}> = ({ invoices, clients, setPage }) => {
  const totalRevenue = invoices
    .filter(i => i.status !== InvoiceStatus.DRAFT)
    .reduce((sum, inv) => {
       const ht = inv.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0);
       return sum + ht;
    }, 0);
  
  const pendingAmount = invoices
    .filter(i => i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.LATE || i.status === InvoiceStatus.PENDING)
    .reduce((sum, inv) => {
       const ht = inv.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0);
       return sum + ht;
    }, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900">Vue d'ensemble</h2>
          <p className="text-zinc-500 mt-1">Vos performances financières en temps réel.</p>
        </div>
        <ButtonPrimary onClick={() => setPage('invoices')}>
          <Plus className="w-4 h-4 mr-2" /> Créer une facture
        </ButtonPrimary>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 group hover:shadow-md transition-all cursor-default">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
             </div>
             <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">+12%</span>
          </div>
          <div className="text-zinc-500 text-sm font-medium mb-1">Chiffre d'Affaires (Net)</div>
          <div className="text-3xl font-bold text-zinc-900 tracking-tighter">
            {formatCurrency(totalRevenue)}
          </div>
        </Card>

        <Card className="p-8 group hover:shadow-md transition-all cursor-default">
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                <Clock className="w-6 h-6" />
             </div>
          </div>
          <div className="text-zinc-500 text-sm font-medium mb-1">En attente de paiement</div>
          <div className="text-3xl font-bold text-zinc-900 tracking-tighter">
            {formatCurrency(pendingAmount)}
          </div>
        </Card>

        <Card className="p-8 group hover:shadow-md transition-all cursor-default">
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
             </div>
          </div>
          <div className="text-zinc-500 text-sm font-medium mb-1">Portefeuille Clients</div>
          <div className="text-3xl font-bold text-zinc-900 tracking-tighter">{clients.length}</div>
        </Card>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-zinc-900">Activité Récente</h3>
           <button onClick={() => setPage('invoices')} className="text-zinc-500 text-sm hover:text-black flex items-center transition-colors">
              Voir tout l'historique <ArrowRight className="w-4 h-4 ml-1" />
           </button>
        </div>
        
        <Card className="overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {invoices.slice(0, 5).map(inv => {
               const client = clients.find(c => c.id === inv.clientId);
               const total = inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
               return (
                <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                        {client?.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900">{client?.name || 'Client inconnu'}</div>
                      <div className="text-xs text-zinc-400 font-mono">{inv.number}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                       <div className="font-medium text-zinc-900">{formatCurrency(total)}</div>
                       <div className="text-xs text-zinc-400">{new Date(inv.date).toLocaleDateString()}</div>
                    </div>
                    <Badge status={inv.status} />
                  </div>
                </div>
              )
            })}
            {invoices.length === 0 && <div className="p-12 text-center text-zinc-400">Aucune activité pour le moment.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// 2. Clients View
const ClientsView: React.FC<{
  clients: Client[];
  onSave: (c: Client) => void;
  onDelete: (id: string) => void;
}> = ({ clients, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({});

  const handleEdit = (client?: Client) => {
    setCurrentClient(client || { name: '', email: '', phone: '', address: '', notes: '' });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: currentClient.id || crypto.randomUUID(),
      name: currentClient.name!,
      email: currentClient.email, // Can be undefined
      phone: currentClient.phone!,
      address: currentClient.address!,
      notes: currentClient.notes
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-zinc-900">Clients</h2>
            <p className="text-zinc-500 mt-1">Gérez votre carnet d'adresses.</p>
        </div>
        <ButtonPrimary onClick={() => handleEdit()}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau Client
        </ButtonPrimary>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <Card className="w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-bold mb-6">{currentClient.id ? 'Modifier' : 'Ajouter'} un client</h3>
             <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Nom / Entreprise</label>
                 <input required type="text" className="w-full bg-zinc-50 border-none rounded-lg p-3 text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-black transition-all" placeholder="Ex: Osean Software" value={currentClient.name || ''} onChange={e => setCurrentClient({...currentClient, name: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Email <span className="text-zinc-400 font-normal">(Optionnel)</span></label>
                    <input type="email" className="w-full bg-zinc-50 border-none rounded-lg p-3 text-zinc-900 focus:ring-2 focus:ring-black transition-all" placeholder="contact@..." value={currentClient.email || ''} onChange={e => setCurrentClient({...currentClient, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Téléphone</label>
                    <input type="text" className="w-full bg-zinc-50 border-none rounded-lg p-3 text-zinc-900 focus:ring-2 focus:ring-black transition-all" value={currentClient.phone || ''} onChange={e => setCurrentClient({...currentClient, phone: e.target.value})} />
                  </div>
               </div>
               <div>
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Adresse</label>
                 <textarea required rows={3} className="w-full bg-zinc-50 border-none rounded-lg p-3 text-zinc-900 focus:ring-2 focus:ring-black transition-all" value={currentClient.address || ''} onChange={e => setCurrentClient({...currentClient, address: e.target.value})} />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Note interne</label>
                 <textarea rows={2} className="w-full bg-zinc-50 border-none rounded-lg p-3 text-zinc-900 focus:ring-2 focus:ring-black transition-all" value={currentClient.notes || ''} onChange={e => setCurrentClient({...currentClient, notes: e.target.value})} />
               </div>
               <div className="flex justify-end gap-3 pt-4">
                 <ButtonSecondary type="button" onClick={() => setIsEditing(false)}>Annuler</ButtonSecondary>
                 <ButtonPrimary type="submit">Enregistrer</ButtonPrimary>
               </div>
             </form>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <Card key={client.id} className="p-6 group hover:border-zinc-300 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-zinc-50 text-zinc-900 flex items-center justify-center font-bold text-lg group-hover:bg-black group-hover:text-white transition-colors">
                  {client.name.substring(0,1).toUpperCase()}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(client)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-600"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => { if(confirm('Supprimer ce client ?')) onDelete(client.id); }} className="p-2 hover:bg-red-50 rounded-full text-red-600"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
            <div className="mb-4">
                <div className="font-bold text-lg text-zinc-900 truncate">{client.name}</div>
                <div className="text-sm text-zinc-400 truncate">{client.notes || 'Aucune note'}</div>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-50">
              <div className="flex items-center text-sm text-zinc-600">
                  <Mail className="w-4 h-4 mr-3 text-zinc-400"/> {client.email || 'Non renseigné'}
              </div>
              <div className="flex items-center text-sm text-zinc-600">
                  <div className="w-4 h-4 mr-3 text-center text-zinc-400 flex items-center justify-center text-xs">📍</div> 
                  <span className="truncate">{client.address.split('\n')[0]}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 3. Services View
const ServicesView: React.FC<{
  services: Service[];
  onSave: (s: Service) => void;
  onDelete: (id: string) => void;
}> = ({ services, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>({});

  const handleEdit = (service?: Service) => {
    setCurrentService(service || { name: '', description: '', price: 0, type: ServiceType.FLAT });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: currentService.id || crypto.randomUUID(),
      name: currentService.name!,
      description: currentService.description!,
      price: Number(currentService.price),
      type: currentService.type!
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-zinc-900">Catalogue</h2>
            <p className="text-zinc-500 mt-1">Vos offres de services.</p>
        </div>
        <ButtonPrimary onClick={() => handleEdit()}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau Service
        </ButtonPrimary>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-bold mb-6">{currentService.id ? 'Modifier' : 'Nouveau'} Service</h3>
             <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Nom du service</label>
                 <input required type="text" className="w-full bg-zinc-50 border-none rounded-lg p-3 text-zinc-900 focus:ring-2 focus:ring-black" value={currentService.name || ''} onChange={e => setCurrentService({...currentService, name: e.target.value})} />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Description</label>
                 <textarea required rows={3} className="w-full bg-zinc-50 border-none rounded-lg p-3 text-zinc-900 focus:ring-2 focus:ring-black" value={currentService.description || ''} onChange={e => setCurrentService({...currentService, description: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Prix (FCFA)</label>
                    <input required type="number" step="100" className="w-full bg-zinc-50 border-none rounded-lg p-3 text-zinc-900 focus:ring-2 focus:ring-black" value={currentService.price || ''} onChange={e => setCurrentService({...currentService, price: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Type</label>
                    <select className="w-full bg-zinc-50 border-none rounded-lg p-3 text-zinc-900 focus:ring-2 focus:ring-black" value={currentService.type} onChange={e => setCurrentService({...currentService, type: e.target.value as ServiceType})}>
                      {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
               </div>
               <div className="flex justify-end gap-3 pt-4">
                 <ButtonSecondary type="button" onClick={() => setIsEditing(false)}>Annuler</ButtonSecondary>
                 <ButtonPrimary type="submit">Enregistrer</ButtonPrimary>
               </div>
             </form>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-zinc-100">
            <tr>
               <th className="py-5 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Service</th>
               <th className="py-5 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</th>
               <th className="py-5 px-6 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Prix</th>
               <th className="py-5 px-6 text-right w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {services.map(service => (
              <tr key={service.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="py-5 px-6">
                  <div className="font-bold text-zinc-900">{service.name}</div>
                  <div className="text-sm text-zinc-500 truncate max-w-md">{service.description}</div>
                </td>
                <td className="py-5 px-6">
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600">
                      {service.type}
                  </span>
                </td>
                <td className="py-5 px-6 text-right font-mono font-medium text-zinc-900">{formatCurrency(service.price)}</td>
                <td className="py-5 px-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(service)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-zinc-500 hover:text-black"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => { if(confirm('Supprimer ?')) onDelete(service.id); }} className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// 4. Invoice Editor & List
const InvoiceView: React.FC<{
  invoices: Invoice[];
  clients: Client[];
  services: Service[];
  company: CompanyProfile;
  onSave: (inv: Invoice) => void;
  onDelete: (id: string) => void;
}> = ({ invoices, clients, services, company, onSave, onDelete }) => {
  const [viewState, setViewState] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentInvoice, setCurrentInvoice] = useState<Partial<Invoice>>({});

  const handlePrint = () => {
    window.print();
  };

  const createNew = () => {
    setCurrentInvoice({
      id: crypto.randomUUID(),
      number: dataService.getNextInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      items: [],
      status: InvoiceStatus.DRAFT,
      taxRate: 0 // Default Tax Rate
    });
    setViewState('edit');
  };

  const handleEdit = (inv: Invoice) => {
    // Prevent editing if Paid
    if (inv.status === InvoiceStatus.PAID) return;
    setCurrentInvoice(JSON.parse(JSON.stringify(inv))); // Deep copy
    setViewState('edit');
  };

  const handlePreview = (inv: Invoice) => {
    setCurrentInvoice(inv);
    setViewState('preview');
  };

  const handleSendEmail = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    if(!client) return;
    
    // Check if client has email
    if (!client.email) {
        alert("Ce client n'a pas d'adresse email renseignée.");
        return;
    }

    const subject = `Facture ${inv.number} - ${company.name}`;
    const body = `Bonjour ${client.name},\n\nVeuillez trouver ci-joint la facture ${inv.number} datée du ${new Date(inv.date).toLocaleDateString()}.\n\nCordialement,\n${company.name}`;
    
    window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    if (inv.status === InvoiceStatus.DRAFT) {
        onSave({...inv, status: InvoiceStatus.SENT});
    }
  };

  // --- Sub-View: Editor ---
  if (viewState === 'edit') {
    const addItem = () => {
      const newItem: InvoiceItem = { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 };
      setCurrentInvoice({ ...currentInvoice, items: [...(currentInvoice.items || []), newItem] });
    };

    const addFromCatalog = (serviceId: string) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            const newItem: InvoiceItem = {
                id: crypto.randomUUID(),
                serviceId: service.id,
                description: service.name,
                quantity: 1,
                unitPrice: service.price
            };
            setCurrentInvoice({ 
                ...currentInvoice, 
                items: [...(currentInvoice.items || []), newItem] 
            });
        }
    };

    const removeItem = (id: string) => {
       setCurrentInvoice({ ...currentInvoice, items: currentInvoice.items?.filter(i => i.id !== id) });
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        const items = currentInvoice.items?.map(item => {
            if (item.id === id) return { ...item, [field]: value };
            return item;
        });
        setCurrentInvoice({ ...currentInvoice, items });
    };

    const saveForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentInvoice.clientId) {
            alert("Veuillez sélectionner un client");
            return;
        }
        if (!currentInvoice.items || currentInvoice.items.length === 0) {
            alert("Ajoutez au moins une ligne");
            return;
        }
        onSave(currentInvoice as Invoice);
        setViewState('list');
    };

    // Calculations
    const subTotal = currentInvoice.items?.reduce((s, i) => s + (i.quantity * i.unitPrice), 0) || 0;
    const taxRate = currentInvoice.taxRate || 0;
    const taxAmount = subTotal * (taxRate / 100);
    const totalAmount = subTotal + taxAmount;

    const selectedClient = clients.find(c => c.id === currentInvoice.clientId);

    return (
        <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-bold text-zinc-900">{currentInvoice.id ? 'Éditer la facture' : 'Nouvelle facture'}</h2>
                   <p className="text-zinc-500 text-sm">Remplissez les informations ci-dessous.</p>
                </div>
                <div className="flex gap-3">
                    <ButtonSecondary onClick={() => setViewState('list')}>Annuler</ButtonSecondary>
                    <ButtonPrimary onClick={saveForm as any}>Enregistrer</ButtonPrimary>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Info (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. Client & Details Card */}
                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Informations Générales</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Numéro</label>
                                <input type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-sm font-medium" value={currentInvoice.number} readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Statut</label>
                                <select className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-sm" value={currentInvoice.status} onChange={e => setCurrentInvoice({...currentInvoice, status: e.target.value as InvoiceStatus})}>
                                     {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                             <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Date d'émission</label>
                                <input type="date" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-sm" value={currentInvoice.date} onChange={e => setCurrentInvoice({...currentInvoice, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Date d'échéance</label>
                                <input type="date" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-sm" value={currentInvoice.dueDate} onChange={e => setCurrentInvoice({...currentInvoice, dueDate: e.target.value})} />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100">
                             <label className="block text-xs font-medium text-zinc-500 mb-2">Client</label>
                             {!selectedClient ? (
                                <select 
                                    className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black"
                                    value={currentInvoice.clientId || ''} 
                                    onChange={e => setCurrentInvoice({...currentInvoice, clientId: e.target.value})}
                                >
                                    <option value="">Sélectionner un client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                             ) : (
                                 <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                                     <div>
                                         <div className="font-bold text-zinc-900">{selectedClient.name}</div>
                                         <div className="text-xs text-zinc-500 truncate">{selectedClient.email}</div>
                                     </div>
                                     <button onClick={() => setCurrentInvoice({...currentInvoice, clientId: ''})} className="text-zinc-400 hover:text-red-500 p-1">
                                         <X className="w-4 h-4" />
                                     </button>
                                 </div>
                             )}
                        </div>
                    </Card>

                    {/* 2. Items Card */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-zinc-100 pb-2">
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Prestations</h3>
                            <select 
                                className="bg-zinc-100 border-none rounded-md text-xs font-medium px-2 py-1 cursor-pointer hover:bg-zinc-200"
                                onChange={(e) => { addFromCatalog(e.target.value); e.target.value = ''; }}
                            >
                                <option value="">+ Importer du catalogue</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>)}
                            </select>
                        </div>

                        <div className="space-y-4">
                            {currentInvoice.items?.map((item, idx) => (
                                <div key={item.id} className="flex gap-3 items-start p-3 bg-zinc-50 rounded-lg border border-zinc-100 group">
                                     <div className="flex-1 space-y-2">
                                         <input 
                                            placeholder="Description" 
                                            className="w-full bg-white border border-zinc-200 rounded p-2 text-sm font-medium"
                                            value={item.description}
                                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                                         />
                                         <div className="flex gap-3">
                                             <div className="w-24">
                                                 <label className="text-[10px] text-zinc-400 uppercase">Qté</label>
                                                 <input 
                                                    type="number" step="0.1" 
                                                    className="w-full bg-white border border-zinc-200 rounded p-1.5 text-sm"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                                                 />
                                             </div>
                                             <div className="w-32">
                                                 <label className="text-[10px] text-zinc-400 uppercase">Prix</label>
                                                 <input 
                                                    type="number" step="100" 
                                                    className="w-full bg-white border border-zinc-200 rounded p-1.5 text-sm"
                                                    value={item.unitPrice}
                                                    onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                                                 />
                                             </div>
                                             <div className="flex-1 text-right pt-6 font-mono text-sm text-zinc-600">
                                                 {formatCurrency(item.quantity * item.unitPrice)}
                                             </div>
                                         </div>
                                     </div>
                                     <button onClick={() => removeItem(item.id)} className="text-zinc-300 hover:text-red-500 mt-1">
                                         <Trash2 className="w-4 h-4" />
                                     </button>
                                </div>
                            ))}

                            <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-lg text-zinc-400 text-sm font-medium hover:border-black hover:text-black transition-colors flex items-center justify-center">
                                <Plus className="w-4 h-4 mr-2" /> Ajouter une ligne vide
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Summary (1/3 width) */}
                <div className="space-y-6">
                    <Card className="p-6 sticky top-24">
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Total</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-zinc-500">
                                <span>Total HT</span>
                                <span>{formatCurrency(subTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-500">
                                <span className="flex items-center">TVA (%) <input type="number" className="w-12 ml-2 bg-zinc-50 border border-zinc-200 rounded p-1 text-center" value={currentInvoice.taxRate} onChange={e => setCurrentInvoice({...currentInvoice, taxRate: parseFloat(e.target.value)})} /></span>
                                <span>{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="pt-3 border-t border-zinc-100 flex justify-between text-lg font-bold text-zinc-900">
                                <span>Total TTC</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>

                         <div className="mt-8">
                             <label className="block text-xs font-medium text-zinc-500 mb-2">Notes / Conditions</label>
                             <textarea 
                                 rows={4}
                                 className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm"
                                 placeholder="Conditions de paiement, livraison..."
                                 value={currentInvoice.notes || ''}
                                 onChange={e => setCurrentInvoice({...currentInvoice, notes: e.target.value})}
                             />
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
  }

  // --- Sub-View: Preview ---
  if (viewState === 'preview' && currentInvoice && currentInvoice.clientId) {
      const client = clients.find(c => c.id === currentInvoice.clientId);
      if (!client) return <div>Erreur Client introuvable</div>;

      return (
          <div className="h-full flex flex-col animate-in fade-in duration-500">
              <div className="bg-white/80 backdrop-blur-md border-b border-zinc-200 p-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
                  <button onClick={() => setViewState('list')} className="text-zinc-600 font-medium hover:text-black flex items-center transition-colors">
                     ← Retour
                  </button>
                  <div className="flex gap-3">
                      <ButtonSecondary onClick={() => handleSendEmail(currentInvoice as Invoice)}>
                          <Mail className="w-4 h-4 mr-2" /> Envoyer
                      </ButtonSecondary>
                      <ButtonPrimary onClick={() => handlePrint()}>
                          <Printer className="w-4 h-4 mr-2" /> Imprimer / PDF
                      </ButtonPrimary>
                  </div>
              </div>
              <div className="flex-1 bg-zinc-100 overflow-auto p-8 flex justify-center">
                  <div className="shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
                    <div>
                       <PDFTemplate invoice={currentInvoice as Invoice} client={client} company={company} />
                    </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- Sub-View: List ---
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-zinc-900">Factures</h2>
            <p className="text-zinc-500 mt-1">Historique de facturation.</p>
        </div>
        <ButtonPrimary onClick={createNew}>
          <Plus className="w-4 h-4 mr-2" /> Créer une facture
        </ButtonPrimary>
      </div>

      <Card className="overflow-hidden min-h-[400px]">
        <table className="w-full text-left">
          <thead className="bg-white border-b border-zinc-100">
            <tr>
               <th className="py-5 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Réf</th>
               <th className="py-5 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
               <th className="py-5 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Client</th>
               <th className="py-5 px-6 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Total TTC</th>
               <th className="py-5 px-6 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">État</th>
               <th className="py-5 px-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {invoices.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-zinc-400">Aucune facture pour le moment.</td></tr>
            )}
            {invoices.map(inv => {
               const clientName = clients.find(c => c.id === inv.clientId)?.name || 'Inconnu';
               // Calculate Total with Tax for List View
               const subTotal = inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
               const taxAmount = subTotal * (inv.taxRate / 100);
               const total = subTotal + taxAmount;
               
               const isLocked = inv.status === InvoiceStatus.PAID;

               return (
                <tr key={inv.id} className="hover:bg-zinc-50 transition-colors group cursor-default">
                    <td className="py-5 px-6 font-mono text-sm text-zinc-500">{inv.number}</td>
                    <td className="py-5 px-6 text-sm text-zinc-600">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="py-5 px-6 font-medium text-zinc-900">{clientName}</td>
                    <td className="py-5 px-6 text-right font-medium text-zinc-900">{formatCurrency(total)}</td>
                    <td className="py-5 px-6 text-center">
                        <Badge status={inv.status} />
                    </td>
                    <td className="py-5 px-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button title="Voir" onClick={() => handlePreview(inv)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-zinc-500 hover:text-black"><ChevronRight className="w-4 h-4"/></button>
                            
                            <button 
                              title={isLocked ? "Facture payée (verrouillée)" : "Modifier"} 
                              onClick={() => !isLocked && handleEdit(inv)} 
                              disabled={isLocked}
                              className={`p-2 rounded-lg text-zinc-500 ${isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:shadow-sm hover:text-black'}`}
                            >
                              <Edit2 className="w-4 h-4"/>
                            </button>
                            
                            <button 
                              title={isLocked ? "Facture payée (verrouillée)" : "Supprimer"} 
                              onClick={() => { if(!isLocked && confirm('Supprimer ?')) onDelete(inv.id); }} 
                              disabled={isLocked}
                              className={`p-2 rounded-lg text-zinc-400 ${isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-600'}`}
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// 5. Company Profile View
const CompanyProfileView: React.FC<{
  company: CompanyProfile;
  onSave: (c: CompanyProfile) => void;
}> = ({ company, onSave }) => {
  const [formData, setFormData] = useState<CompanyProfile>(company);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Convert image to Base64 string
        const base64String = reader.result as string;
        handleChange('logoUrl', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Profil mis à jour !');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-zinc-900">Paramètres</h2>
                <p className="text-zinc-500 mt-1">Gérez les informations de votre entreprise.</p>
            </div>
            <ButtonPrimary onClick={handleSubmit as any}>Enregistrer les modifications</ButtonPrimary>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Identity */}
            <Card className="p-8 space-y-6">
                <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-100 pb-4">Identité</h3>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nom de l'entreprise</label>
                    <input type="text" className="w-full bg-zinc-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-200 overflow-hidden">
                             {formData.logoUrl ? (
                                 <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                             ) : (
                                 <ImageIcon className="w-6 h-6 text-zinc-400" />
                             )}
                        </div>
                        <div>
                             <input 
                               type="file" 
                               accept="image/*" 
                               ref={fileInputRef} 
                               className="hidden" 
                               onChange={handleFileChange}
                             />
                             <ButtonSecondary type="button" onClick={() => fileInputRef.current?.click()}>
                                 <Upload className="w-4 h-4 mr-2"/> Importer un logo
                             </ButtonSecondary>
                             <p className="text-xs text-zinc-400 mt-2">Format supporté : PNG, JPG (Max 1Mo conseillé)</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                        <input type="email" className="w-full bg-zinc-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Téléphone</label>
                        <input type="text" className="w-full bg-zinc-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                     </div>
                </div>
            </Card>

            {/* Address & Legal */}
            <Card className="p-8 space-y-6">
                <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-100 pb-4">Coordonnées & Juridique</h3>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Adresse</label>
                    <textarea rows={3} className="w-full bg-zinc-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black" value={formData.address} onChange={e => handleChange('address', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">SIRET / NIF / RCCM</label>
                    <input type="text" className="w-full bg-zinc-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black" value={formData.siret} onChange={e => handleChange('siret', e.target.value)} />
                </div>
            </Card>

            {/* Banking */}
            <Card className="p-8 space-y-6">
                <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-100 pb-4">Informations Bancaires</h3>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">IBAN</label>
                    <input type="text" className="w-full bg-zinc-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black font-mono" value={formData.iban} onChange={e => handleChange('iban', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">BIC / SWIFT</label>
                    <input type="text" className="w-full bg-zinc-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black font-mono" value={formData.bic} onChange={e => handleChange('bic', e.target.value)} />
                </div>
            </Card>

            {/* Footer config */}
            <Card className="p-8 space-y-6">
                <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-100 pb-4">Pied de page Facture</h3>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Texte personnalisé</label>
                    <textarea rows={3} className="w-full bg-zinc-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black" value={formData.footerText || ''} onChange={e => handleChange('footerText', e.target.value)} />
                     <p className="text-xs text-zinc-400 mt-1">Apparaît en bas de chaque page de facture.</p>
                </div>
            </Card>
        </div>
    </div>
  );
};

// --- Authentication View ---
const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === 'demo') {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
         <div className="p-10">
           <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
                 <FileText className="w-8 h-8" />
              </div>
           </div>
           
           <div className="text-center mb-8">
             <h1 className="text-3xl font-bold text-zinc-900 mb-2">Osean Software</h1>
             <p className="text-zinc-500">Espace de facturation</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input 
                  type="password" 
                  className="w-full bg-zinc-50 border-transparent focus:border-black focus:ring-0 rounded-xl p-4 text-center text-lg placeholder-zinc-400 transition-colors" 
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-xs text-center mt-3 animate-pulse">Accès refusé. Essayez 'demo'.</p>}
              </div>
              <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-transform active:scale-95">
                Connexion
              </button>
           </form>
         </div>
         <div className="bg-zinc-50 py-4 text-center text-xs text-zinc-400 border-t border-zinc-100">
            Secure Environment &bull; v2.1
         </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [company, setCompany] = useState<CompanyProfile>(dataService.getCompany());

  // Init Data
  useEffect(() => {
    if (isAuthenticated) {
      setClients(dataService.getClients());
      setServices(dataService.getServices());
      setInvoices(dataService.getInvoices());
      setCompany(dataService.getCompany());
    }
  }, [isAuthenticated]);

  // Actions
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  const saveClient = (c: Client) => {
    dataService.saveClient(c);
    setClients(dataService.getClients());
  };
  const deleteClient = (id: string) => {
    dataService.deleteClient(id);
    setClients(dataService.getClients());
  };

  const saveService = (s: Service) => {
    dataService.saveService(s);
    setServices(dataService.getServices());
  };
  const deleteService = (id: string) => {
    dataService.deleteService(id);
    setServices(dataService.getServices());
  };

  const saveInvoice = (i: Invoice) => {
    dataService.saveInvoice(i);
    setInvoices(dataService.getInvoices());
  };
  const deleteInvoice = (id: string) => {
    dataService.deleteInvoice(id);
    setInvoices(dataService.getInvoices());
  };

  const saveCompanyProfile = (c: CompanyProfile) => {
    dataService.saveCompany(c);
    setCompany(c);
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard invoices={invoices} clients={clients} setPage={setCurrentPage} />;
      case 'clients':
        return <ClientsView clients={clients} onSave={saveClient} onDelete={deleteClient} />;
      case 'services':
        return <ServicesView services={services} onSave={saveService} onDelete={deleteService} />;
      case 'invoices':
        return <InvoiceView invoices={invoices} clients={clients} services={services} company={company} onSave={saveInvoice} onDelete={deleteInvoice} />;
      case 'settings':
        return <CompanyProfileView company={company} onSave={saveCompanyProfile} />;
      default:
        return <Dashboard invoices={invoices} clients={clients} setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900 selection:bg-black selection:text-white">
      
      {/* Dark Minimal Sidebar */}
      <aside className="w-20 lg:w-64 bg-black text-white fixed inset-y-0 z-30 flex flex-col transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-zinc-800">
           {company.logoUrl ? (
             <>
               {/* Mobile/Collapsed: Small Square Logo */}
               <div className="lg:hidden w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={company.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
               </div>
               
               {/* Desktop/Expanded: Full Logo, no text needed if logo contains text */}
               <img src={company.logoUrl} alt={company.name} className="hidden lg:block h-8 w-auto object-contain rounded-lg" />
             </>
           ) : (
             <>
               <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black flex-shrink-0 overflow-hidden">
                  <FileText className="w-5 h-5" />
               </div>
               <span className="font-bold text-lg ml-3 hidden lg:block tracking-tight truncate">{company.name}</span>
             </>
           )}
        </div>

        <nav className="flex-1 py-8 px-3 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutGrid, label: 'Tableau de bord' },
            { id: 'invoices', icon: FileText, label: 'Factures' },
            { id: 'clients', icon: Users, label: 'Clients' },
            { id: 'services', icon: Briefcase, label: 'Services' },
            { id: 'settings', icon: Settings, label: 'Paramètres' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
                currentPage === item.id 
                ? 'bg-zinc-800 text-white shadow-lg shadow-zinc-900/50' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'stroke-[2.5px]' : ''}`} />
              <span className="ml-3 font-medium text-sm hidden lg:block">{item.label}</span>
              {currentPage === item.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full hidden lg:block" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
           <button onClick={handleLogout} className="w-full flex items-center justify-center lg:justify-start p-2 text-zinc-500 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="ml-3 text-sm font-medium hidden lg:block">Déconnexion</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-20 lg:ml-64 flex-1 p-8 lg:p-12 overflow-x-hidden">
         <div className="max-w-7xl mx-auto">
           {renderContent()}
         </div>
      </main>

    </div>
  );
}