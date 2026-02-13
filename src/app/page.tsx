"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  TrendingUp,
  CreditCard,
  IndianRupee,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const res = await fetch("/api/invoices");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]">Loading Dashboard...</div>;

  const stats = data?.stats || {
    totalGross: 0,
    totalBase: 0,
    totalGST: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalPending: 0,
    count: 0
  };
  const chartData = data?.chartData || [];
  const recentInvoices = data?.invoices?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue (Gross)"
          value={`₹${stats.totalGross.toLocaleString()}`}
          change="+12.5%"
          isPositive={true}
          icon={IndianRupee}
        />
        <StatCard
          title="Base Revenue"
          value={`₹${stats.totalBase.toLocaleString()}`}
          change="+10.2%"
          isPositive={true}
          icon={CreditCard}
        />
        <StatCard
          title="GST Collected"
          value={`₹${stats.totalGST.toLocaleString()}`}
          change="+8.1%"
          isPositive={true}
          icon={FileCheck}
        />
        <StatCard
          title="Pending Amount"
          value={`₹${stats.totalPending.toLocaleString()}`}
          change="-2.4%"
          isPositive={false}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <CardTitle className="text-gray-800 font-bold">Revenue Trends</CardTitle>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                <TrendingUp className="w-3 h-3" /> Growth: +14%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    dy={10}
                    tickFormatter={(val) => {
                      const date = new Date(val);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    labelFormatter={(label) => {
                      return new Date(label).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="gross"
                    name="Gross Revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorGross)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-gray-800 font-bold">GST Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Total GST (18%)</p>
                <h3 className="text-2xl font-bold text-blue-900">₹{stats.totalGST.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="space-y-4">
              <GstRow label="CGST (9%)" value={stats.totalCGST} color="bg-orange-500" />
              <GstRow label="SGST (9%)" value={stats.totalSGST} color="bg-emerald-500" />
              <GstRow label="IGST (18%)" value={stats.totalIGST} color="bg-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-800 font-bold">Recent Invoices</CardTitle>
          <Link href="/invoices" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50 border-y">
              <TableRow>
                <TableHead className="px-6 font-semibold">Invoice No</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-right">Amount</TableHead>
                <TableHead className="px-6 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.map((inv: any) => (
                <TableRow key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="px-6 font-medium text-gray-900">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-gray-600">{inv.customerName}</TableCell>
                  <TableCell className="text-gray-500">{mounted ? new Date(inv.invoiceDate).toLocaleDateString() : "..."}</TableCell>
                  <TableCell className="text-right font-semibold text-gray-900">₹{inv.totalGross.toLocaleString()}</TableCell>
                  <TableCell className="px-6">
                    <Badge className={cn(
                      "rounded-full px-2.5 py-0.5 font-medium border-none",
                      inv.status === "PAID" ? "bg-green-100 text-green-700" :
                        inv.status === "NEEDS_REVIEW" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                    )}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {recentInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                    No invoices found. Start by uploading one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon: Icon }: any) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden group hover:ring-1 hover:ring-blue-500 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
            <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </div>
          <span className={cn(
            "flex items-center text-xs font-bold px-1.5 py-0.5 rounded",
            isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </CardContent>
    </Card>
  );
}

function GstRow({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">₹{value.toLocaleString()}</span>
    </div>
  );
}
