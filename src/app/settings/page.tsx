"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Building2, Percent, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const handleSave = () => {
        toast.success("Settings saved successfully!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Configure your dashboard preferences and company details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" /> Company Profile
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Update your company information which appears on extracted reports.
                    </p>
                </div>
                <Card className="md:col-span-2 border-none shadow-sm bg-white rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg">General Information</CardTitle>
                        <CardDescription>Your business details for GST filing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</Label>
                                <Input defaultValue="Rhythmix Studioz" className="rounded-xl h-11 border-gray-100 bg-gray-50/50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">GSTIN</Label>
                                <Input defaultValue="07AQRPK3543P1Z4" className="rounded-xl h-11 border-gray-100 bg-gray-50/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Address</Label>
                            <Input defaultValue="G-48, R.G.Mall, Sector-09, Rohini, Delhi 110085" className="rounded-xl h-11 border-gray-100 bg-gray-50/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t">
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-blue-600" /> GST Logic
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Manage how taxes are calculated across all invoices.
                    </p>
                </div>
                <Card className="md:col-span-2 border-none shadow-sm bg-white rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Tax Configuration</CardTitle>
                        <CardDescription>Default tax rates and handling</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Default GST Rate</Label>
                                <div className="relative">
                                    <Input defaultValue="18" className="rounded-xl h-11 border-gray-100 bg-gray-50/50 pr-10" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Currency</Label>
                                <div className="relative">
                                    <Input defaultValue="INR (₹)" className="rounded-xl h-11 border-gray-100 bg-gray-50/50" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t">
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4 text-red-600" /> Danger Zone
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Permanently delete all data. This action cannot be undone.
                    </p>
                </div>
                <Card className="md:col-span-2 border-red-100 shadow-sm bg-red-50/30 rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg text-red-900">Reset Data</CardTitle>
                        <CardDescription>Clear all invoices, clients and history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="bg-white text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl"
                            onClick={async () => {
                                if (confirm("Are you SURE you want to delete ALL invoices and clients? This cannot be undone.")) {
                                    try {
                                        const res = await fetch("/api/cleanup", { method: "DELETE" });
                                        if (res.ok) {
                                            toast.success("All data cleared successfully!");
                                        }
                                    } catch (err) {
                                        toast.error("Failed to clear data.");
                                    }
                                }
                            }}
                        >
                            Reset Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-8">
                <Button variant="blue" size="lg" className="rounded-xl px-12 h-12" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
            </div>
        </div>
    );
}
