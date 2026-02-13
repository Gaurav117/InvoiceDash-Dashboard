import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
    try {
        // Delete all line items first (due to relations)
        await prisma.lineItem.deleteMany({});
        // Delete all invoices
        await prisma.invoice.deleteMany({});
        // Delete all clients
        await prisma.client.deleteMany({});

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
