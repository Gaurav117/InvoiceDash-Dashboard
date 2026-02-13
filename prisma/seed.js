const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding demo data...');

    // Create Clients
    const rStudioz = await prisma.client.upsert({
        where: { name: 'Rhythmix Studioz' },
        update: {},
        create: {
            name: 'Rhythmix Studioz',
            gstin: '07AQRPK3543P1Z4',
        },
    });

    const techFlow = await prisma.client.upsert({
        where: { name: 'TechFlow Solutions' },
        update: {},
        create: {
            name: 'TechFlow Solutions',
            gstin: '09AABBCC1234Z1Z',
        },
    });

    // Create Invoices for Rhythmix
    const inv1 = await prisma.invoice.create({
        data: {
            invoiceNumber: '298',
            invoiceDate: new Date('2025-11-15'),
            supplierName: 'A&T Solutions',
            supplierGSTIN: '07AEOPT8056M1ZJ',
            customerName: 'Rhythmix Studioz',
            customerGSTIN: '07AQRPK3543P1Z4',
            gstType: 'CGST_SGST',
            isGstInclusive: false,
            subtotalBase: 5000,
            gstRate: 0.18,
            gstAmount: 900,
            cgstAmount: 450,
            sgstAmount: 450,
            totalGross: 5900,
            status: 'PAID',
            clientId: rStudioz.id,
        },
    });

    const inv2 = await prisma.invoice.create({
        data: {
            invoiceNumber: '299',
            invoiceDate: new Date('2025-12-20'),
            supplierName: 'A&T Solutions',
            supplierGSTIN: '07AEOPT8056M1ZJ',
            customerName: 'Rhythmix Studioz',
            customerGSTIN: '07AQRPK3543P1Z4',
            gstType: 'CGST_SGST',
            isGstInclusive: false,
            subtotalBase: 12000,
            gstRate: 0.18,
            gstAmount: 2160,
            cgstAmount: 1080,
            sgstAmount: 1080,
            totalGross: 14160,
            status: 'PAID',
            clientId: rStudioz.id,
        },
    });

    // Create Invoices for TechFlow
    const inv3 = await prisma.invoice.create({
        data: {
            invoiceNumber: 'TF-101',
            invoiceDate: new Date('2026-01-05'),
            supplierName: 'A&T Solutions',
            supplierGSTIN: '07AEOPT8056M1ZJ',
            customerName: 'TechFlow Solutions',
            customerGSTIN: '09AABBCC1234Z1Z',
            gstType: 'IGST',
            isGstInclusive: true,
            totalGross: 23600,
            subtotalBase: 20000,
            gstRate: 0.18,
            gstAmount: 3600,
            igstAmount: 3600,
            status: 'UNPAID',
            amountPending: 23600,
            clientId: techFlow.id,
        }
    });

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
