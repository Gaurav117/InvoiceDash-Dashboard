import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const clients = await prisma.client.findMany({
            include: {
                _count: {
                    select: { invoices: true }
                },
                invoices: {
                    select: {
                        totalGross: true,
                        gstAmount: true
                    }
                }
            }
        });

        const clientsWithStats = clients.map((client: any) => {
            const totalRevenue = client.invoices.reduce((sum: number, inv: any) => sum + inv.totalGross, 0);
            const totalGST = client.invoices.reduce((sum: number, inv: any) => sum + inv.gstAmount, 0);
            return {
                id: client.id,
                name: client.name,
                gstin: client.gstin,
                invoiceCount: client._count.invoices,
                totalRevenue,
                totalGST
            };
        });

        return NextResponse.json({ clients: clientsWithStats });
    } catch (error: any) {
        console.error("API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
