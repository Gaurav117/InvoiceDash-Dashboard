import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month"); // e.g., "2026-01"
        const status = searchParams.get("status");
        const clientId = searchParams.get("clientId");

        const where: any = {};

        if (status) where.status = status;
        if (clientId) where.clientId = clientId;

        // Simple month filtering
        if (month) {
            const [year, m] = month.split("-").map(Number);
            const startDate = new Date(year, m - 1, 1);
            const endDate = new Date(year, m, 0, 23, 59, 59);
            where.invoiceDate = {
                gte: startDate,
                lte: endDate,
            };
        }

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { invoiceDate: "desc" },
            include: {
                client: true,
                lineItems: true
            }
        });

        const stats = await prisma.invoice.aggregate({
            where,
            _sum: {
                totalGross: true,
                subtotalBase: true,
                gstAmount: true,
                amountPending: true,
                cgstAmount: true,
                sgstAmount: true,
                igstAmount: true,
            },
            _count: {
                id: true
            }
        });

        // Grouped data for charts (By Day)
        const allInvoices = await prisma.invoice.findMany({
            select: {
                invoiceDate: true,
                totalGross: true,
                subtotalBase: true,
                gstAmount: true
            },
            orderBy: { invoiceDate: 'asc' }
        });

        const dailyData: Record<string, { date: string; gross: number; base: number; gst: number }> = {};
        allInvoices.forEach((inv: any) => {
            const date = new Date(inv.invoiceDate);
            const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
            if (!dailyData[key]) {
                dailyData[key] = { date: key, gross: 0, base: 0, gst: 0 };
            }
            dailyData[key].gross += inv.totalGross;
            dailyData[key].base += inv.subtotalBase;
            dailyData[key].gst += inv.gstAmount;
        });

        return NextResponse.json({
            invoices,
            stats: {
                totalGross: stats._sum.totalGross || 0,
                totalBase: stats._sum.subtotalBase || 0,
                totalGST: stats._sum.gstAmount || 0,
                totalCGST: stats._sum.cgstAmount || 0,
                totalSGST: stats._sum.sgstAmount || 0,
                totalIGST: stats._sum.igstAmount || 0,
                totalPending: stats._sum.amountPending || 0,
                count: stats._count.id || 0
            },
            chartData: Object.values(dailyData)
        });
    } catch (error: any) {
        console.error("API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
