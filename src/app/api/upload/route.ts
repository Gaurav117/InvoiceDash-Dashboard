import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { parseInvoiceText } from "@/lib/invoice-parser";
import { prisma } from "@/lib/prisma";
import fs from "fs";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const results = [];

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        for (const file of files) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `${uuidv4()}-${file.name}`;
                const filePath = path.join(uploadDir, fileName);

                // Save file locally
                await writeFile(filePath, buffer);

                // Extract Text
                const pdf = require("pdf-parse/lib/pdf-parse.js");
                const pdfData = await pdf(buffer);
                const parsedData = parseInvoiceText(pdfData.text);

                // Save to DB
                // 1. Find or create client
                let client = await prisma.client.findUnique({
                    where: { name: parsedData.customerName }
                });

                if (!client) {
                    client = await prisma.client.create({
                        data: {
                            name: parsedData.customerName,
                            gstin: parsedData.customerGSTIN
                        }
                    });
                }

                // 2. Upsert Invoice (Handle re-uploads)
                const invoice = await prisma.invoice.upsert({
                    where: {
                        invoiceNumber_supplierGSTIN: {
                            invoiceNumber: parsedData.invoiceNumber,
                            supplierGSTIN: parsedData.supplierGSTIN
                        }
                    },
                    update: {
                        invoiceDate: parsedData.invoiceDate,
                        supplierName: parsedData.supplierName,
                        customerName: parsedData.customerName,
                        customerGSTIN: parsedData.customerGSTIN,
                        placeOfSupply: parsedData.placeOfSupply,
                        gstType: parsedData.gstType,
                        isGstInclusive: parsedData.isGstInclusive,
                        subtotalBase: parsedData.subtotalBase,
                        gstAmount: parsedData.gstAmount,
                        cgstAmount: parsedData.cgstAmount,
                        sgstAmount: parsedData.sgstAmount,
                        igstAmount: parsedData.igstAmount,
                        totalGross: parsedData.totalGross,
                        amountPaid: parsedData.amountPaid,
                        amountPending: parsedData.amountPending,
                        status: parsedData.status,
                        notes: parsedData.notes,
                        originalPath: fileName,
                        clientId: client.id,
                        lineItems: {
                            deleteMany: {},
                            create: parsedData.lineItems.map(item => ({
                                description: item.description,
                                sacCode: item.sacCode,
                                qty: item.qty,
                                rate: item.rate,
                                amount: item.amount
                            }))
                        }
                    },
                    create: {
                        invoiceNumber: parsedData.invoiceNumber,
                        invoiceDate: parsedData.invoiceDate,
                        supplierName: parsedData.supplierName,
                        supplierGSTIN: parsedData.supplierGSTIN,
                        customerName: parsedData.customerName,
                        customerGSTIN: parsedData.customerGSTIN,
                        placeOfSupply: parsedData.placeOfSupply,
                        gstType: parsedData.gstType,
                        isGstInclusive: parsedData.isGstInclusive,
                        subtotalBase: parsedData.subtotalBase,
                        gstAmount: parsedData.gstAmount,
                        cgstAmount: parsedData.cgstAmount,
                        sgstAmount: parsedData.sgstAmount,
                        igstAmount: parsedData.igstAmount,
                        totalGross: parsedData.totalGross,
                        amountPaid: parsedData.amountPaid,
                        amountPending: parsedData.amountPending,
                        status: parsedData.status,
                        notes: parsedData.notes,
                        originalPath: fileName,
                        clientId: client.id,
                        lineItems: {
                            create: parsedData.lineItems.map(item => ({
                                description: item.description,
                                sacCode: item.sacCode,
                                qty: item.qty,
                                rate: item.rate,
                                amount: item.amount
                            }))
                        }
                    }
                });

                results.push({
                    success: true,
                    fileName: file.name,
                    invoiceId: invoice.id,
                    status: invoice.status
                });
            } catch (err: any) {
                console.error(`Error processing file ${file.name}:`, err);
                results.push({
                    success: false,
                    fileName: file.name,
                    error: err.message
                });
            }
        }

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
