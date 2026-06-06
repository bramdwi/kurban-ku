import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';


export async function GET(request: Request) {
  try {
    const user = await requireAuth(['OWNER', 'STAFF']);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'financial';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const txWhere: any = { tenantId: user.tenantId, deletedAt: null };
    if (startDate || endDate) {
      txWhere.transactionDate = dateFilter;
    }

    if (type === 'financial') {
      // Financial Report
      const transactions = await prisma.transaction.findMany({
        where: txWhere,
        include: {
          items: {
            include: {
              animal: true,
            },
          },
          payments: true,
        },
      });

      const expenseWhere: any = { tenantId: user.tenantId };
      if (startDate || endDate) {
        expenseWhere.expenseDate = dateFilter;
      }
      const expenses = await prisma.expense.findMany({
        where: expenseWhere,
      });

      const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
      const totalPaid = transactions.reduce((sum, t) => sum + t.paidAmount, 0);
      const totalDebt = transactions.reduce((sum, t) => sum + t.remainingAmount, 0);
      const totalPurchaseCost = transactions.reduce(
        (sum, t) => sum + t.items.reduce((is, item) => is + (item.animal?.purchasePrice || 0), 0),
        0
      );
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const grossProfit = totalRevenue - totalPurchaseCost;
      const netProfit = grossProfit - totalExpenses;
      const totalTransactions = transactions.length;
      const paidTransactions = transactions.filter((t) => t.paymentStatus === 'FULLY_PAID').length;
      const unpaidTransactions = transactions.filter((t) => t.paymentStatus === 'UNPAID').length;
      const dpTransactions = transactions.filter((t) => t.paymentStatus === 'DP_PAID').length;

      // Monthly breakdown
      const monthlyMap = new Map<string, { revenue: number; cost: number; profit: number; count: number }>();
      transactions.forEach((t) => {
        const month = new Date(t.transactionDate).toISOString().slice(0, 7);
        const existing = monthlyMap.get(month) || { revenue: 0, cost: 0, profit: 0, count: 0 };
        const cost = t.items.reduce((s, item) => s + (item.animal?.purchasePrice || 0), 0);
        existing.revenue += t.totalAmount;
        existing.cost += cost;
        existing.profit += t.totalAmount - cost;
        existing.count += 1;
        monthlyMap.set(month, existing);
      });

      const monthlyBreakdown = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return NextResponse.json({
        success: true,
        data: {
          type: 'financial',
          totalRevenue,
          totalPaid,
          totalDebt,
          totalPurchaseCost,
          totalExpenses,
          grossProfit,
          netProfit,
          totalTransactions,
          paidTransactions,
          unpaidTransactions,
          dpTransactions,
          monthlyBreakdown,
        },
      });
    }

    if (type === 'sales') {
      // Sales Report
      const transactions = await prisma.transaction.findMany({
        where: txWhere,
        include: {
          buyer: true,
          items: {
            include: {
              animal: {
                include: { animalType: true },
              },
            },
          },
        },
        orderBy: { transactionDate: 'desc' },
      });

      // Species breakdown
      const speciesMap = new Map<string, { count: number; revenue: number }>();
      transactions.forEach((t) => {
        t.items.forEach((item) => {
          const species = item.animal?.species || 'UNKNOWN';
          const existing = speciesMap.get(species) || { count: 0, revenue: 0 };
          existing.count += 1;
          existing.revenue += item.price;
          speciesMap.set(species, existing);
        });
      });

      const speciesBreakdown = Array.from(speciesMap.entries()).map(([species, data]) => ({
        species,
        ...data,
      }));

      // Top buyers
      const buyerMap = new Map<string, { name: string; count: number; totalSpent: number }>();
      transactions.forEach((t) => {
        const existing = buyerMap.get(t.buyerId) || {
          name: t.buyer?.name || 'Unknown',
          count: 0,
          totalSpent: 0,
        };
        existing.count += 1;
        existing.totalSpent += t.totalAmount;
        buyerMap.set(t.buyerId, existing);
      });

      const topBuyers = Array.from(buyerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      const totalAnimals = transactions.reduce((sum, t) => sum + t.items.length, 0);

      return NextResponse.json({
        success: true,
        data: {
          type: 'sales',
          totalTransactions: transactions.length,
          totalAnimals,
          totalRevenue: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
          speciesBreakdown,
          topBuyers,
          transactions: transactions.slice(0, 50), // Latest 50 transactions for table
        },
      });
    }

    if (type === 'animal') {
      // Animal Stock Report
      const animals = await prisma.animal.findMany({
        where: { tenantId: user.tenantId, deletedAt: null },
        include: { animalType: true },
      });

      const statusCounts = {
        AVAILABLE: animals.filter((a) => a.status === 'AVAILABLE').length,
        BOOKED: animals.filter((a) => a.status === 'BOOKED').length,
        SOLD: animals.filter((a) => a.status === 'SOLD').length,
        DEAD: animals.filter((a) => a.status === 'DEAD').length,
      };

      const speciesStockMap = new Map<string, { total: number; available: number; sold: number; totalValue: number }>();
      animals.forEach((a) => {
        const existing = speciesStockMap.get(a.species) || { total: 0, available: 0, sold: 0, totalValue: 0 };
        existing.total += 1;
        if (a.status === 'AVAILABLE') existing.available += 1;
        if (a.status === 'SOLD') existing.sold += 1;
        existing.totalValue += a.sellingPrice;
        speciesStockMap.set(a.species, existing);
      });

      const speciesStock = Array.from(speciesStockMap.entries()).map(([species, data]) => ({
        species,
        ...data,
      }));

      const totalStockValue = animals
        .filter((a) => a.status === 'AVAILABLE')
        .reduce((sum, a) => sum + a.sellingPrice, 0);

      const totalPurchaseValue = animals
        .filter((a) => a.status === 'AVAILABLE')
        .reduce((sum, a) => sum + a.purchasePrice, 0);

      const avgWeight: Record<string, number> = {};
      ['SAPI', 'KAMBING', 'DOMBA'].forEach((sp) => {
        const spAnimals = animals.filter((a) => a.species === sp);
        avgWeight[sp] = spAnimals.length > 0
          ? Math.round(spAnimals.reduce((sum, a) => sum + a.weight, 0) / spAnimals.length)
          : 0;
      });

      return NextResponse.json({
        success: true,
        data: {
          type: 'animal',
          totalAnimals: animals.length,
          statusCounts,
          speciesStock,
          totalStockValue,
          totalPurchaseValue,
          avgWeight,
        },
      });
    }

    if (type === 'delivery') {
      // Delivery Report
      const deliveryWhere: any = { tenantId: user.tenantId };
      if (startDate || endDate) {
        deliveryWhere.createdAt = dateFilter;
      }

      const deliveries = await prisma.delivery.findMany({
        where: deliveryWhere,
        include: {
          transaction: { include: { buyer: true } },
          driver: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const statusCounts = {
        SCHEDULED: deliveries.filter((d) => d.status === 'SCHEDULED').length,
        IN_TRANSIT: deliveries.filter((d) => d.status === 'IN_TRANSIT').length,
        DELIVERED: deliveries.filter((d) => d.status === 'DELIVERED').length,
        FAILED: deliveries.filter((d) => d.status === 'FAILED').length,
      };

      // Driver performance
      const driverMap = new Map<string, { name: string; total: number; delivered: number; failed: number }>();
      deliveries.forEach((d) => {
        if (d.driverId && d.driver) {
          const existing = driverMap.get(d.driverId) || {
            name: (d.driver as any).name,
            total: 0,
            delivered: 0,
            failed: 0,
          };
          existing.total += 1;
          if (d.status === 'DELIVERED') existing.delivered += 1;
          if (d.status === 'FAILED') existing.failed += 1;
          driverMap.set(d.driverId, existing);
        }
      });

      const driverPerformance = Array.from(driverMap.values()).sort((a, b) => b.delivered - a.delivered);

      return NextResponse.json({
        success: true,
        data: {
          type: 'delivery',
          totalDeliveries: deliveries.length,
          statusCounts,
          driverPerformance,
          successRate:
            deliveries.length > 0
              ? Math.round(
                  (deliveries.filter((d) => d.status === 'DELIVERED').length / deliveries.length) * 100
                )
              : 0,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Tipe laporan tidak valid' }, { status: 400 });
  } catch (error: any) {
    return handleApiError(error, 'GET Reports');
  }
}
