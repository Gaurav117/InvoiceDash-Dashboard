import { LayoutDashboard, Upload, FileText, Users, Settings, Package2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const items = [
        { title: "Dashboard", icon: LayoutDashboard, href: "/" },
        { title: "Upload", icon: Upload, href: "/upload" },
        { title: "Invoices", icon: FileText, href: "/invoices" },
        { title: "Clients", icon: Users, href: "/clients" },
        { title: "Settings", icon: Settings, href: "/settings" },
    ];

    return (
        <div className={cn("pb-12 h-screen border-r bg-white w-64 flex flex-col fixed left-0 top-0", className)}>
            <div className="px-6 py-8 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Package2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">InvoiceDash</span>
            </div>
            <div className="flex-1 px-4 space-y-1">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                        <item.icon className="w-5 h-5" />
                        {item.title}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <Sidebar />
            <div className="pl-64">
                <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-gray-800">Welcome Gaurav</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
                            INR (₹)
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            GS
                        </div>
                    </div>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
