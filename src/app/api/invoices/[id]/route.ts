import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await prisma.invoice.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "Missing ID or status" }, { status: 400 });
        }

        const updateData: any = { status };

        if (status === "PAID") {
            const invoice = await prisma.invoice.findUnique({ where: { id } });
            if (invoice) {
                updateData.amountPaid = invoice.totalGross;
                updateData.amountPending = 0;
            }
        }

        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, invoice: updatedInvoice });
    } catch (error: any) {
        console.error("Update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
