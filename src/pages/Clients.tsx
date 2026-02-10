import { useState } from "react";
import { Search, Plus, Phone, MessageCircle, ChevronRight, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mockClients = [
  {
    id: 1,
    name: "João Silva",
    phone: "(11) 99999-1234",
    vehicles: ["Civic 2019 (ABC-1234)", "Fit 2017 (DEF-5678)"],
    balance: 0,
    lastVisit: "05/02/2026",
  },
  {
    id: 2,
    name: "Maria Santos",
    phone: "(11) 98888-4321",
    vehicles: ["Onix 2021 (GHI-9012)"],
    balance: 0,
    lastVisit: "08/02/2026",
  },
  {
    id: 3,
    name: "Roberto Ferreira",
    phone: "(11) 97777-5678",
    vehicles: ["Gol G7 2020 (JKL-3456)"],
    balance: 2350,
    lastVisit: "25/01/2026",
  },
  {
    id: 4,
    name: "Luciana Mendes",
    phone: "(11) 96666-8765",
    vehicles: ["Tracker 2021 (MNO-7890)"],
    balance: 1200,
    lastVisit: "18/01/2026",
  },
  {
    id: 5,
    name: "Carlos Oliveira",
    phone: "(11) 95555-2345",
    vehicles: ["Hilux 2020 (PQR-1234)"],
    balance: 0,
    lastVisit: "10/02/2026",
  },
  {
    id: 6,
    name: "Ana Costa",
    phone: "(11) 94444-6789",
    vehicles: ["HB20 2022 (STU-5678)"],
    balance: 0,
    lastVisit: "09/02/2026",
  },
];

const Clients = () => {
  const [search, setSearch] = useState("");

  const filtered = mockClients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.vehicles.some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{mockClients.length} clientes cadastrados</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-hover cursor-pointer"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
              {client.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <p className="font-medium">{client.name}</p>
                {client.balance > 0 && (
                  <span className="badge-overdue">
                    Deve R$ {client.balance.toLocaleString("pt-BR")}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {client.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Car className="h-3 w-3" /> {client.vehicles.length} veículo(s)
                </span>
                <span>Última visita: {client.lastVisit}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-[hsl(var(--success))]">
                <MessageCircle className="h-4 w-4" />
              </button>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;
