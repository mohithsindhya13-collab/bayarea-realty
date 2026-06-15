'use client';

import React, { useState, useRef } from 'react';
import { Property, TourRequest, SellerLead, AgentProfile } from '@/lib/types';
import { agentProfiles } from '@/lib/data';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';

interface AdminPortalProps {
  properties: Property[];
  tours: TourRequest[];
  sellers: SellerLead[];
  onAddProperty: (prop: Omit<Property, 'id' | 'days_on_market'>) => void;
  onEditProperty: (id: number | string, fields: Partial<Property>) => void;
  onDeleteProperty: (id: number | string) => void;
  onImportProperties: (props: Property[]) => void;
  onUpdateTourStatus: (id: number, status: 'Pending' | 'Contacted' | 'Archived') => void;
  onUpdateSellerStatus: (id: number, status: 'Pending' | 'Contacted' | 'Archived') => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPortal({
  properties,
  tours,
  sellers,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onImportProperties,
  onUpdateTourStatus,
  onUpdateSellerStatus,
  isOpen,
  onClose
}: AdminPortalProps) {
  const [loggedInAgent, setLoggedInAgent] = useState<AgentProfile | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Edit fields
  const [editPrice, setEditPrice] = useState(0);
  const [editStatus, setEditStatus] = useState<'Buy' | 'Rent'>('Buy');
  const [editImages, setEditImages] = useState<string[]>([]);

  // Drag and drop visual state
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Add Form fields
  const [addForm, setAddForm] = useState({
    title: '',
    neighborhood: 'Evergreen',
    price: 1200000,
    status: 'Buy' as 'Buy' | 'Rent',
    beds: 3,
    baths: 2,
    sqft: 1800,
    type: 'House',
    description: '',
    solar: false,
    ev_charging: false,
    turnkey: false,
    images: [] as string[]
  });

  const [addTempUrl, setAddTempUrl] = useState('');
  const [editTempUrl, setEditTempUrl] = useState('');

  if (!isOpen) return null;

  // Handle Login
  const handleAgentClick = (agent: AgentProfile) => {
    setSelectedAgent(agent);
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'agent2026') {
      setLoggedInAgent(selectedAgent);
      setPassword('');
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid authorization code.');
    }
  };

  const handleLogout = () => {
    setLoggedInAgent(null);
    setSelectedAgent(null);
  };

  // CSV Parsing Engine
  const handleCSVFile = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          alert("CSV file seems empty or invalid.");
          return;
        }

        // Header mapping logic
        const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        
        // Find index matching columns
        const idxId = rawHeaders.findIndex(h => h.includes('mls') || h.includes('id') || h.includes('key'));
        const idxTitle = rawHeaders.findIndex(h => h.includes('title') || h.includes('street') || h.includes('address') || h.includes('subject'));
        const idxPrice = rawHeaders.findIndex(h => h.includes('price') || h.includes('listprice') || h.includes('amount'));
        const idxBeds = rawHeaders.findIndex(h => h.includes('bed') || h.includes('room'));
        const idxBaths = rawHeaders.findIndex(h => h.includes('bath') || h.includes('restroom'));
        const idxSqft = rawHeaders.findIndex(h => h.includes('sqft') || h.includes('sq') || h.includes('area') || h.includes('size'));
        const idxDesc = rawHeaders.findIndex(h => h.includes('remarks') || h.includes('desc') || h.includes('note') || h.includes('text'));
        const idxNeigh = rawHeaders.findIndex(h => h.includes('neighborhood') || h.includes('city') || h.includes('subdivision') || h.includes('location'));
        const idxImage = rawHeaders.findIndex(h => h.includes('image') || h.includes('photo') || h.includes('pic') || h.includes('url') || h.includes('media'));

        if (idxTitle === -1 || idxPrice === -1) {
          alert("CSV mapping failed. Could not locate essential 'Address/Title' or 'Price' columns.");
          return;
        }

        const parsedProps: Property[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          // simple parser for comma splits ignoring commas inside quotes
          const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
          
          if (row.length < rawHeaders.length) continue;

          const rawPrice = parseFloat(row[idxPrice].replace(/[^0-9.]/g, '')) || 1000000;
          const isRent = rawPrice < 20000; // threshold
          
          const rawId = idxId !== -1 ? row[idxId] : `csv-${Date.now()}-${i}`;
          const title = idxTitle !== -1 ? row[idxTitle] : "Silicon Valley Listing";
          const neigh = idxNeigh !== -1 ? row[idxNeigh] : "San Jose";
          const beds = idxBeds !== -1 ? parseInt(row[idxBeds]) || 3 : 3;
          const baths = idxBaths !== -1 ? parseFloat(row[idxBaths]) || 2 : 2;
          const sqft = idxSqft !== -1 ? parseInt(row[idxSqft]) || 1500 : 1500;
          const desc = idxDesc !== -1 ? row[idxDesc] : "Beautiful property sourced from agent MLS list.";

          const descLower = desc.toLowerCase();
          const hasSolar = descLower.includes('solar');
          const hasEv = descLower.includes('ev ') || descLower.includes('charging') || descLower.includes('tesla');
          const hasTurnkey = descLower.includes('turnkey') || descLower.includes('remodel') || descLower.includes('renovat');

          // Distribute mock visual assets
          const mockImages = [
            "/assets/images/evergreen_home.png",
            "/assets/images/silver_creek_estate.png",
            "/assets/images/willow_glen_craftsman.png",
            "/assets/images/north_sj_condo.png",
            "/assets/images/almaden_valley_home.png",
            "/assets/images/cupertino_townhouse.png",
            "/assets/images/downtown_penthouse.png"
          ];
          const image = idxImage !== -1 && row[idxImage] ? row[idxImage] : mockImages[i % mockImages.length];

          // Distribute commutes
          const commutes = { apple: 15, google: 18, nvidia: 12, adobe: 10 };
          if (neigh.toLowerCase().includes('cupertino')) {
            commutes.apple = 3; commutes.google = 10;
          } else if (neigh.toLowerCase().includes('evergreen') || neigh.toLowerCase().includes('silver')) {
            commutes.apple = 26; commutes.nvidia = 22; commutes.adobe = 15;
          }

          parsedProps.push({
            id: rawId,
            title,
            neighborhood: neigh,
            price: rawPrice,
            beds,
            baths,
            sqft,
            type: "House",
            status: isRent ? 'Rent' : 'Buy',
            school_rating: neigh.toLowerCase().includes('cupertino') || neigh.toLowerCase().includes('evergreen') ? 9 : 8,
            school_details: "Sourced high school district",
            commute_times: commutes,
            solar: hasSolar,
            ev_charging: hasEv,
            turnkey: hasTurnkey,
            days_on_market: 2,
            image,
            description: desc
          });
        }

        onImportProperties(parsedProps);
        alert(`Successfully imported ${parsedProps.length} properties from MLS CSV file.`);
      } catch (err) {
        console.error(err);
        alert("Error parsing CSV. Please verify file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCSVFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCSVFile(e.target.files[0]);
    }
  };

  // Manual Add Form submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Assign template visual assets
    const fallbacks = [
      "/assets/images/evergreen_home.png",
      "/assets/images/silver_creek_estate.png",
      "/assets/images/willow_glen_craftsman.png",
      "/assets/images/almaden_valley_home.png",
      "/assets/images/cupertino_townhouse.png"
    ];
    const images = addForm.images.length > 0 ? addForm.images : [fallbacks[Math.floor(Math.random() * fallbacks.length)]];
    const image = images[0];
    
    const schoolRating = addForm.neighborhood === 'Cupertino' || addForm.neighborhood === 'Evergreen' ? 9 : 8;
    const commutes = { apple: 15, google: 18, nvidia: 12, adobe: 10 };
    if (addForm.neighborhood === 'Cupertino') commutes.apple = 4;
    
    onAddProperty({
      title: addForm.title,
      neighborhood: addForm.neighborhood,
      price: addForm.price,
      status: addForm.status,
      beds: addForm.beds,
      baths: addForm.baths,
      sqft: addForm.sqft,
      type: addForm.type,
      description: addForm.description,
      solar: addForm.solar,
      ev_charging: addForm.ev_charging,
      turnkey: addForm.turnkey,
      school_rating: schoolRating,
      school_details: `${addForm.neighborhood} Unified School District (${schoolRating}/10)`,
      commute_times: commutes,
      image,
      images
    });

    setIsAddOpen(false);
    // Reset form
    setAddForm({
      title: '',
      neighborhood: 'Evergreen',
      price: 1200000,
      status: 'Buy',
      beds: 3,
      baths: 2,
      sqft: 1800,
      type: 'House',
      description: '',
      solar: false,
      ev_charging: false,
      turnkey: false,
      images: []
    });
  };

  // Edit status trigger
  const handleEditClick = (prop: Property) => {
    setEditingProperty(prop);
    setEditPrice(prop.price);
    setEditStatus(prop.status);
    setEditImages(prop.images && prop.images.length > 0 ? prop.images : (prop.image ? [prop.image] : []));
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProperty) {
      onEditProperty(editingProperty.id, {
        price: editPrice,
        status: editStatus,
        image: editImages[0] || '',
        images: editImages
      });
      setIsEditOpen(false);
      setEditingProperty(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      
      {/* Login lock screen */}
      {!loggedInAgent ? (
        <div className="w-full max-w-[450px] bg-[#faf9f6] border border-[#e6e1d5] shadow-2xl rounded-2xl p-10 relative animate-slideUp text-[#1f2937]">
          <h3 className="text-xl font-bold tracking-tight text-[#7f1d1d] text-center mb-6">Valley & Co. Portal Login</h3>
          
          {!selectedAgent ? (
            <div className="grid grid-cols-2 gap-4">
              {agentProfiles.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAgentClick(agent)}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-[#e6e1d5] bg-white hover:bg-[#991b1b]/5 hover:border-[#991b1b] transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#991b1b] text-[#ffffff] font-bold flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-all">
                    {agent.initial}
                  </div>
                  <span className="text-sm font-semibold text-[#111827]">{agent.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[#e6e1d5] mb-2">
                <div className="w-10 h-10 rounded-full bg-[#991b1b] text-[#ffffff] font-bold flex items-center justify-center">
                  {selectedAgent.initial}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111827]">{selectedAgent.name}</h4>
                  <p className="text-xs text-[#4b5563]">{selectedAgent.role}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pass" className="text-xs text-[#4b5563] font-medium">Authorization Password</Label>
                <div className="relative bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <Input
                    type="password"
                    id="pass"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (default: agent2026)"
                    className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                  />
                </div>
                {errorMsg && <p className="text-xs text-red-500 font-medium mt-1">{errorMsg}</p>}
              </div>

              <div className="flex gap-4 mt-2">
                <Button type="button" onClick={() => setSelectedAgent(null)} className="flex-1 bg-transparent border border-[#e6e1d5] text-[#374151] hover:bg-[#eae6db] h-11">
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-[#991b1b] text-[#ffffff] hover:bg-[#7f1d1d] font-semibold h-11">
                  Authorize
                </Button>
              </div>
            </form>
          )}

          <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-[#4b5563] hover:text-[#991b1b]">&times;</button>
        </div>
      ) : (
        
        /* Dashboard view */
        <div className="w-full max-w-[1100px] h-[85vh] bg-[#faf9f6] border border-[#e6e1d5] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-slideUp text-[#1f2937]">
          
          {/* Dashboard Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-[#e6e1d5] bg-[#f5f2eb]">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#7f1d1d]">Operations Control Center</h2>
              <p className="text-xs text-[#c5a059] font-bold">Authorized Agent: {loggedInAgent.name} ({loggedInAgent.role})</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleLogout} className="bg-transparent border border-[#e6e1d5] text-[#374151] hover:bg-[#eae6db] text-xs h-9">
                Exit Portal
              </Button>
              <Button onClick={onClose} className="bg-[#991b1b] text-[#ffffff] hover:bg-[#7f1d1d] text-xs h-9 font-semibold">
                Close
              </Button>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="listings" orientation="vertical" className="w-full h-full flex flex-col md:flex-row">
              
              {/* Tab Navigation Sidebar */}
              <TabsList className="flex flex-col h-auto bg-[#eae6db]/40 border-r border-[#e6e1d5] justify-start p-4 w-full md:w-[220px] rounded-none gap-2">
                <TabsTrigger value="listings" className="w-full justify-between px-4 py-3 rounded-lg text-[#4b5563] hover:text-[#991b1b] data-[state=active]:bg-[#991b1b]/10 data-[state=active]:text-[#991b1b] border border-transparent data-[state=active]:border-[#991b1b]/20 transition-all font-medium">
                  <span>Listing Manager</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eae6db] text-[#4b5563] font-bold border border-[#e6e1d5]">{properties.length}</span>
                </TabsTrigger>
                <TabsTrigger value="import" className="w-full justify-between px-4 py-3 rounded-lg text-[#4b5563] hover:text-[#991b1b] data-[state=active]:bg-[#991b1b]/10 data-[state=active]:text-[#991b1b] border border-transparent data-[state=active]:border-[#991b1b]/20 transition-all font-medium">
                  <span>MLS CSV Import</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eae6db] text-[#4b5563] font-bold border border-[#e6e1d5]">CSV</span>
                </TabsTrigger>
                <TabsTrigger value="tours" className="w-full justify-between px-4 py-3 rounded-lg text-[#4b5563] hover:text-[#991b1b] data-[state=active]:bg-[#991b1b]/10 data-[state=active]:text-[#991b1b] border border-transparent data-[state=active]:border-[#991b1b]/20 transition-all font-medium">
                  <span>Tour Requests</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eae6db] text-[#4b5563] font-bold border border-[#e6e1d5]">{tours.length}</span>
                </TabsTrigger>
                <TabsTrigger value="sellers" className="w-full justify-between px-4 py-3 rounded-lg text-[#4b5563] hover:text-[#991b1b] data-[state=active]:bg-[#991b1b]/10 data-[state=active]:text-[#991b1b] border border-transparent data-[state=active]:border-[#991b1b]/20 transition-all font-medium">
                  <span>Seller Leads</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eae6db] text-[#4b5563] font-bold border border-[#e6e1d5]">{sellers.length}</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Listing Manager */}
              <TabsContent value="listings" className="flex-1 p-8 overflow-y-auto m-0">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold tracking-tight text-[#7f1d1d]">Listing Directory</h3>
                  <Button onClick={() => setIsAddOpen(true)} className="bg-[#991b1b] text-[#ffffff] hover:bg-[#7f1d1d] font-semibold text-xs h-9">
                    + Add Listing Manually
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="border-[#e6e1d5] hover:bg-transparent">
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Property Title</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Neighborhood</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Price</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Status</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((prop) => (
                      <TableRow key={prop.id} className="border-[#e6e1d5] hover:bg-[#eae6db]/10">
                        <TableCell className="font-semibold text-[#111827]">
                          <div className="flex items-center gap-3">
                            <img src={prop.image} alt="" className="w-10 h-7 rounded object-cover border border-[#e6e1d5]" />
                            <span className="max-w-[250px] truncate">{prop.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#374151]">{prop.neighborhood}</TableCell>
                        <TableCell className="text-[#374151] font-semibold">${prop.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                            prop.status === 'Buy' ? 'bg-[#991b1b] text-[#ffffff]' : 'bg-[#4b5563] text-[#ffffff]'
                          }`}>
                            {prop.status === 'Buy' ? 'For Sale' : 'For Lease'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => handleEditClick(prop)} className="bg-transparent border border-[#e6e1d5] text-[#374151] hover:bg-[#eae6db] text-[10px] h-7 px-3">
                              Edit
                            </Button>
                            <Button onClick={() => onDeleteProperty(prop.id)} className="bg-transparent hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 text-[10px] h-7 px-3">
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* TAB 2: MLS CSV Import */}
              <TabsContent value="import" className="flex-1 p-8 overflow-y-auto m-0 flex flex-col">
                <h3 className="text-lg font-bold tracking-tight text-[#7f1d1d] mb-2">MLS Property Importer</h3>
                <p className="text-sm text-[#4b5563] mb-8 max-w-[650px]">
                  Export listings from your MLSListings agent portal, then drag and drop the CSV file below to instantly bulk-update the catalog.
                </p>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 text-center cursor-pointer transition-all ${
                    isDragOver 
                      ? 'border-[#991b1b] bg-[#991b1b]/5' 
                      : 'border-[#e6e1d5] bg-white hover:border-[#991b1b]/50 hover:bg-[#eae6db]/10'
                  }`}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#991b1b] mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <h4 className="font-semibold text-[#111827] mb-1">Drag & Drop MLS CSV Here</h4>
                  <p className="text-xs text-[#4b5563]">or click to browse local files</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept=".csv"
                    className="hidden"
                  />
                </div>

                <div className="mt-8 bg-white border border-[#e6e1d5] rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#991b1b] mb-2">Smart Column Mapping Protocol</h4>
                  <p className="text-xs text-[#4b5563] leading-relaxed">
                    Our importer dynamically maps columns. Your CSV should contain columns matching or close to:
                  </p>
                  <code className="block bg-[#f5f2eb] border border-[#e6e1d5] p-3 rounded-lg mt-3 text-xs text-[#991b1b] font-mono overflow-x-auto whitespace-nowrap">
                    MLS#, Title/Street/Address, Price/ListPrice, Beds/Bedrooms, Baths/Bathrooms, SqFt/SqFtTotal, Remarks/Description, Neighborhood/City
                  </code>
                </div>
              </TabsContent>

              {/* TAB 3: Tour Requests */}
              <TabsContent value="tours" className="flex-1 p-8 overflow-y-auto m-0">
                <h3 className="text-lg font-bold tracking-tight text-[#7f1d1d] mb-6">Client viewing request ledger</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#e6e1d5] hover:bg-transparent">
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Client</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Property Title</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Schedule Date</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Status</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((t) => (
                      <TableRow key={t.id} className="border-[#e6e1d5] hover:bg-[#eae6db]/10">
                        <TableCell className="font-semibold text-[#111827]">
                          <div>{t.client}</div>
                          <div className="text-[11px] text-[#4b5563] font-normal">{t.phone}</div>
                        </TableCell>
                        <TableCell className="text-[#374151] max-w-[200px] truncate">{t.property}</TableCell>
                        <TableCell className="text-[#374151] font-semibold">
                          <div>{t.date}</div>
                          <div className="text-[10px] text-[#6e6e73] font-normal">{t.time}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm ${
                            t.status === 'Contacted' 
                              ? 'bg-[#10b981] text-[#ffffff]' 
                              : t.status === 'Archived'
                                ? 'bg-[#8c7e6b] text-[#ffffff]'
                                : 'bg-[#c5a059] text-[#ffffff]'
                          }`}>
                            {t.status || 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => onUpdateTourStatus(t.id, 'Contacted')} className="bg-transparent border border-[#e6e1d5] text-[#374151] hover:bg-[#eae6db] text-[10px] h-7 px-3">
                              Contacted
                            </Button>
                            <Button onClick={() => onUpdateTourStatus(t.id, 'Archived')} className="bg-transparent hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 text-[10px] h-7 px-3">
                              Archive
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* TAB 4: Seller Leads */}
              <TabsContent value="sellers" className="flex-1 p-8 overflow-y-auto m-0">
                <h3 className="text-lg font-bold tracking-tight text-[#7f1d1d] mb-6">Home valuation inquiries</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#e6e1d5] hover:bg-transparent">
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Owner Name</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Address</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Property Specs</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs">Status</TableHead>
                      <TableHead className="text-[#4b5563] font-semibold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellers.map((s) => (
                      <TableRow key={s.id} className="border-[#e6e1d5] hover:bg-[#eae6db]/10">
                        <TableCell className="font-semibold text-[#111827]">
                          <div>{s.name}</div>
                          <div className="text-[11px] text-[#4b5563] font-normal">{s.email}</div>
                        </TableCell>
                        <TableCell className="text-[#374151] max-w-[200px] truncate">{s.address}</TableCell>
                        <TableCell className="text-[#374151]">
                          <div>{s.beds}b / {s.baths}ba / {s.sqft} sqft</div>
                          <div className="text-[10px] text-[#6e6e73]">Solar: {s.solar ? 'Yes' : 'No'} | EV: {s.ev ? 'Yes' : 'No'}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm ${
                            s.status === 'Contacted' 
                              ? 'bg-[#10b981] text-[#ffffff]' 
                              : s.status === 'Archived'
                                ? 'bg-[#8c7e6b] text-[#ffffff]'
                                : 'bg-[#c5a059] text-[#ffffff]'
                          }`}>
                            {s.status || 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => onUpdateSellerStatus(s.id, 'Contacted')} className="bg-transparent border border-[#e6e1d5] text-[#374151] hover:bg-[#eae6db] text-[10px] h-7 px-3">
                              Contacted
                            </Button>
                            <Button onClick={() => onUpdateSellerStatus(s.id, 'Archived')} className="bg-transparent hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 text-[10px] h-7 px-3">
                              Archive
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#faf9f6] border-[#e6e1d5] text-[#1f2937] sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold tracking-tight text-lg text-[#7f1d1d]">Create Custom Listing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-title" className="text-xs text-slate-400 font-medium">Listing Heading</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="add-title"
                  required
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="Luxury Foothills Family Home"
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="add-neighborhood" className="text-xs text-slate-400 font-medium">Neighborhood</Label>
              <Select
                value={addForm.neighborhood}
                onValueChange={(val) => val && setAddForm({ ...addForm, neighborhood: val })}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 rounded-xl text-slate-100 h-[46px]">
                  <SelectValue placeholder="Evergreen" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                  <SelectItem value="Evergreen">Evergreen</SelectItem>
                  <SelectItem value="Willow Glen">Willow Glen</SelectItem>
                  <SelectItem value="Almaden Valley">Almaden Valley</SelectItem>
                  <SelectItem value="Silver Creek">Silver Creek</SelectItem>
                  <SelectItem value="Cupertino">Cupertino</SelectItem>
                  <SelectItem value="North San Jose">North San Jose</SelectItem>
                  <SelectItem value="Downtown San Jose">Downtown San Jose</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="add-price" className="text-xs text-slate-400 font-medium">Listing Price ($)</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="add-price"
                  type="number"
                  required
                  value={addForm.price}
                  onChange={(e) => setAddForm({ ...addForm, price: parseInt(e.target.value) || 0 })}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="add-status" className="text-xs text-slate-400 font-medium">Listing Transaction</Label>
              <Select
                value={addForm.status}
                onValueChange={(val) => val && setAddForm({ ...addForm, status: val as 'Buy' | 'Rent' })}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 rounded-xl text-slate-100 h-[46px]">
                  <SelectValue placeholder="For Sale" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                  <SelectItem value="Buy">For Sale (Buy)</SelectItem>
                  <SelectItem value="Rent">For Lease (Rent)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="add-beds" className="text-xs text-slate-400 font-medium">Bedrooms</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="add-beds"
                  type="number"
                  required
                  value={addForm.beds}
                  onChange={(e) => setAddForm({ ...addForm, beds: parseInt(e.target.value) || 1 })}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="add-baths" className="text-xs text-slate-400 font-medium">Bathrooms</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="add-baths"
                  type="number"
                  step={0.5}
                  required
                  value={addForm.baths}
                  onChange={(e) => setAddForm({ ...addForm, baths: parseFloat(e.target.value) || 1 })}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="add-sqft" className="text-xs text-slate-400 font-medium">Living Area (Sq Ft)</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="add-sqft"
                  type="number"
                  required
                  value={addForm.sqft}
                  onChange={(e) => setAddForm({ ...addForm, sqft: parseInt(e.target.value) || 500 })}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="add-type" className="text-xs text-slate-400 font-medium">Property Type</Label>
              <Select
                value={addForm.type}
                onValueChange={(val) => val && setAddForm({ ...addForm, type: val })}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 rounded-xl text-slate-100 h-[46px]">
                  <SelectValue placeholder="House" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                  <SelectItem value="House">Single Family House</SelectItem>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
              <Label htmlFor="add-description" className="text-xs text-slate-400 font-medium">Public Remarks</Label>
              <Textarea
                id="add-description"
                required
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                placeholder="Give details about structural features, views, local amenities..."
                className="bg-white/5 border-white/10 rounded-xl text-slate-100 focus-visible:ring-0 min-h-[90px]"
              />
            </div>

            <div className="col-span-1 sm:col-span-2 flex flex-col gap-3 bg-white/2 border border-white/5 rounded-xl p-4">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Property Photos (Multiple Supported)</Label>
              
              {/* Thumbnail List */}
              <div className="flex gap-3 overflow-x-auto py-2 min-h-[80px] border-b border-white/5">
                {addForm.images.length > 0 ? (
                  addForm.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-24 h-16 rounded-lg bg-slate-950 border border-white/10 overflow-hidden shrink-0 group">
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...addForm.images];
                          updated.splice(idx, 1);
                          setAddForm({ ...addForm, images: updated });
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 font-bold text-xs transition-opacity duration-150"
                      >
                        Remove
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-center text-[#d4af37] py-0.5 border-t border-[#d4af37]/20 font-bold uppercase tracking-wider">
                          Primary
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-500 py-3 italic">
                    No images added yet. Sourced fallbacks will be used if none are added.
                  </div>
                )}
              </div>

              {/* Add Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                
                {/* File Upload & Presets */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Upload Image File</span>
                    <div className="relative">
                      <Button type="button" size="sm" className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-200 h-9 flex items-center justify-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload Local Photo
                      </Button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setAddForm({ 
                                  ...addForm, 
                                  images: [...addForm.images, event.target.result as string] 
                                });
                              }
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Quick Select Preset Style</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'Evergreen', path: '/assets/images/evergreen_home.png' },
                        { name: 'Silver Creek', path: '/assets/images/silver_creek_estate.png' },
                        { name: 'Willow Glen', path: '/assets/images/willow_glen_craftsman.png' },
                        { name: 'Almaden', path: '/assets/images/almaden_valley_home.png' },
                        { name: 'Cupertino', path: '/assets/images/cupertino_townhouse.png' },
                        { name: 'North SJ', path: '/assets/images/north_sj_condo.png' },
                        { name: 'Downtown', path: '/assets/images/downtown_penthouse.png' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setAddForm({ ...addForm, images: [...addForm.images, preset.path] });
                          }}
                          className="px-2 py-1 rounded text-[9px] font-medium bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-[#d4af37]/30 transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Paste URL */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Paste Image Web URL</span>
                  <div className="flex gap-2 items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                    <Input
                      id="add-image-url"
                      value={addTempUrl}
                      onChange={(e) => setAddTempUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto text-xs flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (addTempUrl.trim()) {
                          setAddForm({ ...addForm, images: [...addForm.images, addTempUrl.trim()] });
                          setAddTempUrl('');
                        }
                      }}
                      className="bg-[#d4af37] text-slate-950 hover:bg-[#f3cf65] font-semibold text-[10px] h-7 px-3 shrink-0"
                    >
                      Add URL
                    </Button>
                  </div>
                  <span className="text-[9px] text-slate-500 leading-normal">
                    Pasting custom web links allows referencing large architectural images directly without uploading files.
                  </span>
                </div>

              </div>
            </div>

            <div className="col-span-1 sm:col-span-2 flex gap-6 mt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="add-solar"
                  checked={addForm.solar}
                  onCheckedChange={(val) => setAddForm({ ...addForm, solar: !!val })}
                  className="border-white/20 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-slate-950"
                />
                <Label htmlFor="add-solar" className="text-sm text-slate-300 font-medium cursor-pointer">Paid Solar Panels</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="add-ev"
                  checked={addForm.ev_charging}
                  onCheckedChange={(val) => setAddForm({ ...addForm, ev_charging: !!val })}
                  className="border-white/20 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-slate-950"
                />
                <Label htmlFor="add-ev" className="text-sm text-slate-300 font-medium cursor-pointer">EV-Ready Outlet</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="add-turnkey"
                  checked={addForm.turnkey}
                  onCheckedChange={(val) => setAddForm({ ...addForm, turnkey: !!val })}
                  className="border-white/20 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-slate-950"
                />
                <Label htmlFor="add-turnkey" className="text-sm text-slate-300 font-medium cursor-pointer">Turnkey / Renovated</Label>
              </div>
            </div>

            <DialogFooter className="col-span-1 sm:col-span-2 mt-4 gap-3">
              <Button type="button" onClick={() => setIsAddOpen(false)} className="bg-transparent border border-white/10 text-slate-200 hover:bg-white/5">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#d4af37] text-slate-950 hover:bg-[#f3cf65] font-semibold">
                Publish Listing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#faf9f6] border-[#e6e1d5] text-[#1f2937] sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold tracking-tight text-lg text-[#7f1d1d]">Edit Listing Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-5 mt-4">
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-price" className="text-xs text-slate-400 font-medium">Listing Price ($)</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="edit-price"
                  type="number"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-status" className="text-xs text-slate-400 font-medium">Transaction Type</Label>
              <Select
                value={editStatus}
                onValueChange={(val) => val && setEditStatus(val as 'Buy' | 'Rent')}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 rounded-xl text-slate-100 h-[46px]">
                  <SelectValue placeholder="For Sale" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                  <SelectItem value="Buy">For Sale (Buy)</SelectItem>
                  <SelectItem value="Rent">For Lease (Rent)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 bg-white/2 border border-white/5 rounded-xl p-4">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Property Photos (Multiple Supported)</Label>
              
              {/* Thumbnail List */}
              <div className="flex gap-3 overflow-x-auto py-2 min-h-[80px] border-b border-white/5">
                {editImages.length > 0 ? (
                  editImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-24 h-16 rounded-lg bg-slate-950 border border-white/10 overflow-hidden shrink-0 group">
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...editImages];
                          updated.splice(idx, 1);
                          setEditImages(updated);
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 font-bold text-xs transition-opacity duration-150"
                      >
                        Remove
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-center text-[#d4af37] py-0.5 border-t border-[#d4af37]/20 font-bold uppercase tracking-wider">
                          Primary
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-500 py-3 italic">
                    No images added yet. Sourced fallbacks will be used if none are added.
                  </div>
                )}
              </div>

              {/* Add Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                
                {/* File Upload & Presets */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Upload Image File</span>
                    <div className="relative">
                      <Button type="button" size="sm" className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-200 h-9 flex items-center justify-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload Local Photo
                      </Button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEditImages([...editImages, event.target.result as string]);
                              }
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Quick Select Preset Style</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'Evergreen', path: '/assets/images/evergreen_home.png' },
                        { name: 'Silver Creek', path: '/assets/images/silver_creek_estate.png' },
                        { name: 'Willow Glen', path: '/assets/images/willow_glen_craftsman.png' },
                        { name: 'Almaden', path: '/assets/images/almaden_valley_home.png' },
                        { name: 'Cupertino', path: '/assets/images/cupertino_townhouse.png' },
                        { name: 'North SJ', path: '/assets/images/north_sj_condo.png' },
                        { name: 'Downtown', path: '/assets/images/downtown_penthouse.png' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setEditImages([...editImages, preset.path]);
                          }}
                          className="px-2 py-1 rounded text-[9px] font-medium bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-[#d4af37]/30 transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Paste URL */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Paste Image Web URL</span>
                  <div className="flex gap-2 items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                    <Input
                      id="edit-image-url"
                      value={editTempUrl}
                      onChange={(e) => setEditTempUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto text-xs flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (editTempUrl.trim()) {
                          setEditImages([...editImages, editTempUrl.trim()]);
                          setEditTempUrl('');
                        }
                      }}
                      className="bg-[#d4af37] text-slate-950 hover:bg-[#f3cf65] font-semibold text-[10px] h-7 px-3 shrink-0"
                    >
                      Add URL
                    </Button>
                  </div>
                  <span className="text-[9px] text-slate-500 leading-normal">
                    Pasting custom web links allows referencing large architectural images directly without uploading files.
                  </span>
                </div>

              </div>
            </div>

            <DialogFooter className="mt-4 gap-3">
              <Button type="button" onClick={() => setIsEditOpen(false)} className="bg-transparent border border-white/10 text-slate-200 hover:bg-white/5">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#d4af37] text-slate-950 hover:bg-[#f3cf65] font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
