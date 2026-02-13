"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Filter,
    Download,
    Eye,
    ChevronRight,
    AlertCircle,
    CalendarIcon,
    FileText,
    Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch("/api/invoices");
            const data = await res.json();
            setInvoices(data.invoices);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ["Invoice No", "Client", "Client GSTIN", "Date", "Base", "CGST", "SGST", "IGST", "Total", "Status"];
        const rows = filteredInvoices.map(inv => [
            inv.invoiceNumber,
            `"${inv.customerName}"`,
            inv.customerGSTIN || "N/A",
            new Date(inv.invoiceDate).toLocaleDateString(),
            inv.subtotalBase,
            inv.cgstAmount || 0,
            inv.sgstAmount || 0,
            inv.igstAmount || 0,
            inv.totalGross,
            inv.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenPDF = (filename: string) => {
        if (!filename) {
            toast.error("No file path found for this invoice");
            return;
        }
        window.open(`/api/uploads/${filename}`, "_blank");
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(`Invoice marked as ${status}`);
                setSelectedInvoice(data.invoice);
                fetchInvoices();
            } else {
                throw new Error("Failed to update status");
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;

        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Invoice deleted successfully");
                setSelectedInvoice(null);
                fetchInvoices();
            } else {
                throw new Error("Failed to delete invoice");
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and track all your processed invoices</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-gray-200" onClick={exportToCSV}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="blue" className="rounded-xl">
                        Add Manual Invoice
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 overflow-hidden">
                <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by invoice number or client..."
                            className="pl-11 h-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="h-12 rounded-2xl border-gray-100 bg-gray-50 flex-1 md:flex-none">
                            <Filter className="w-4 h-4 mr-2" /> Filters
                        </Button>
                        <Button variant="outline" className="h-12 rounded-2xl border-gray-100 bg-gray-50 flex-1 md:flex-none">
                            <CalendarIcon className="w-4 h-4 mr-2" /> Jan 2026
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Invoice</TableHead>
                                <TableHead className="py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Client Name</TableHead>
                                <TableHead className="py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Issued Date</TableHead>
                                <TableHead className="py-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Amount (Gross)</TableHead>
                                <TableHead className="py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</TableHead>
                                <TableHead className="px-6 py-4"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-20">Loading...</TableCell></TableRow>
                            ) : filteredInvoices.map((inv) => (
                                <TableRow
                                    key={inv.id}
                                    className="group hover:bg-blue-50/30 transition-all border-b border-gray-50 cursor-pointer"
                                    onClick={() => setSelectedInvoice(inv)}
                                >
                                    <TableCell className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 leading-none mb-1">#{inv.invoiceNumber}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{inv.gstType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 font-semibold text-gray-700">{inv.customerName}</TableCell>
                                    <TableCell className="py-5 text-gray-500 font-medium">
                                        {mounted ? format(new Date(inv.invoiceDate), "MMM dd, yyyy") : "..."}
                                    </TableCell>
                                    <TableCell className="py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-gray-900">₹{inv.totalGross.toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-500">Base: ₹{inv.subtotalBase.toLocaleString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge className={cn(
                                            "rounded-xl px-3 py-1 font-bold text-[10px] border-none shadow-none uppercase",
                                            inv.status === "PAID" ? "bg-green-100 text-green-700" :
                                                inv.status === "NEEDS_REVIEW" ? "bg-amber-100 text-amber-700" :
                                                    "bg-gray-100 text-gray-700"
                                        )}>
                                            {inv.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="rounded-full w-8 h-8 text-gray-400 hover:text-blue-600">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <ChevronRight className="w-4 h-4 text-gray-300" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && filteredInvoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-24">
                                        <div className="flex flex-col items-center opacity-40">
                                            <FileText className="w-12 h-12 mb-2" />
                                            <p>No invoices found matching your search</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="p-6 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-gray-400">
                    <span>Showing {filteredInvoices.length} Invoices</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg" disabled>Prev</Button>
                        <Button variant="outline" size="sm" className="rounded-lg text-blue-600" disabled>Next</Button>
                    </div>
                </div>
            </div>

            <Sheet open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                <SheetContent className="w-[450px] sm:w-[540px] border-l shadow-2xl p-0">
                    {selectedInvoice && (
                        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
                            <SheetHeader className="p-8 border-b bg-gray-50/50 text-left">
                                <div className="flex items-center justify-between mb-6">
                                    <Badge className={cn(
                                        "rounded-xl px-4 py-1.5 font-bold text-xs uppercase shadow-none",
                                        selectedInvoice.status === "PAID" ? "bg-green-600 text-white" :
                                            selectedInvoice.status === "NEEDS_REVIEW" ? "bg-amber-500 text-white" :
                                                "bg-gray-800 text-white"
                                    )}>
                                        {selectedInvoice.status}
                                    </Badge>
                                    <span className="text-xs font-bold font-mono text-gray-400">ID: {selectedInvoice.id}</span>
                                </div>
                                <SheetTitle className="text-3xl font-black text-gray-900 mb-1">Invoice #{selectedInvoice.invoiceNumber}</SheetTitle>
                                <SheetDescription className="text-gray-500 font-medium pb-0">
                                    Issued to {selectedInvoice.customerName}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <DetailBlock label="Invoice Date" value={mounted ? format(new Date(selectedInvoice.invoiceDate), "MMMM dd, yyyy") : "..."} />
                                    <DetailBlock label="Place of Supply" value={selectedInvoice.placeOfSupply || "N/A"} />
                                    <DetailBlock label="Customer GSTIN" value={selectedInvoice.customerGSTIN || "N/A"} />
                                    <DetailBlock label="GST Type" value={selectedInvoice.gstType} />
                                </div>

                                <div className="pt-6 border-t">
                                    <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Calculation Breakdown</h4>
                                    <div className="space-y-4 bg-gray-50 p-6 rounded-2xl">
                                        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                                            <span>Taxable Value (Base)</span>
                                            <span className="text-gray-900">₹{selectedInvoice.subtotalBase.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                                            <span>GST ({selectedInvoice.gstRate * 100}%)</span>
                                            <span className="text-gray-900">₹{selectedInvoice.gstAmount.toLocaleString()}</span>
                                        </div>
                                        {selectedInvoice.cgstAmount && (
                                            <div className="flex justify-between items-center text-[10px] text-gray-400 italic">
                                                <span>- CGST (9%)</span>
                                                <span>₹{selectedInvoice.cgstAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {selectedInvoice.sgstAmount && (
                                            <div className="flex justify-between items-center text-[10px] text-gray-400 italic">
                                                <span>- SGST (9%)</span>
                                                <span>₹{selectedInvoice.sgstAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                            <span className="font-black text-gray-900 uppercase text-xs">Grand Total</span>
                                            <span className="text-xl font-black text-blue-600">₹{selectedInvoice.totalGross.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedInvoice.notes && (
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-amber-700 uppercase mb-1">Validation Flags</p>
                                            <p className="text-xs text-amber-600 leading-relaxed font-medium">{selectedInvoice.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border-t bg-gray-50/50 flex gap-3">
                                <Button
                                    className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all disabled:opacity-50"
                                    onClick={() => handleStatusUpdate(selectedInvoice.id, "PAID")}
                                    disabled={selectedInvoice.status === "PAID"}
                                >
                                    {selectedInvoice.status === "PAID" ? "Already Paid" : "Mark as Paid"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 w-12 rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 p-0"
                                    onClick={() => handleDelete(selectedInvoice.id)}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-gray-200 font-bold bg-white"
                                    onClick={() => handleOpenPDF(selectedInvoice.originalPath)}
                                >
                                    Open PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-700">{value}</p>
        </div>
    )
}
