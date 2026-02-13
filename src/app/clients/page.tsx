"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchClients() {
            try {
                const res = await fetch("/api/clients");
                const data = await res.json();
                setClients(data.clients);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchClients();
    }, []);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your customer profiles and revenue per client</p>
                </div>
                <Button variant="blue" className="rounded-xl px-6">
                    <UserPlus className="w-4 h-4 mr-2" /> Add New Client
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search clients..."
                    className="pl-11 h-12 rounded-2xl bg-white border-none shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">Loading Clients...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:ring-2 hover:ring-blue-500/10 transition-all group">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    {client.gstin && (
                                        <div className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500 uppercase">
                                            GST: {client.gstin}
                                        </div>
                                    )}
                                </div>
                                <CardTitle className="text-xl font-bold text-gray-900 mt-4">{client.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
                                        <p className="text-lg font-black text-gray-900">₹{client.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Invoices</p>
                                        <p className="text-lg font-black text-gray-900">{client.invoiceCount}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                        <FileCheck className="w-4 h-4 text-emerald-500" />
                                        <span>GST Paid: ₹{client.totalGST.toLocaleString()}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50 rounded-lg">
                                        Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {filteredClients.length === 0 && !loading && (
                <div className="py-32 text-center flex flex-col items-center opacity-30">
                    <Users className="w-16 h-16 mb-4" />
                    <p className="text-xl font-bold">No clients found</p>
                </div>
            )}
        </div>
    );
}
