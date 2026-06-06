import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { id } from 'date-fns/locale';

export async function GET() {
  try {
    const user = await requireAuth();

    // 1. Animal counts
    const animals = await prisma.animal.findMany({
      where: { tenantId: user.tenantId, deletedAt: null },
      select: { status: true, species: true },
    });

    const totalAnimals = animals.length;
    const availableAnimals = animals.filter((a) => a.status === 'AVAILABLE').length;
    const soldAnimals = animals.filter((a) => a.status === 'SOLD').length;
    const bookedAnimals = animals.filter((a) => a.status === 'BOOKED').length;

    // 2. Species distribution
    const speciesMap = animals.reduce((acc, curr) => {
      acc[curr.species] = (acc[curr.species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const speciesDistribution = Object.entries(speciesMap).map(([species, count]) => ({
      species,
      count,
    }));

    // 3. Transactions & Financials (Omzet, Debt)
    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId: user.tenantId,
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
      include: {
        buyer: true,
        items: {
          include: {
            animal: true,
          },
        },
      },
    });

    const totalTransactions = transactions.length;
    
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalDebt = 0;

    transactions.forEach((tx) => {
      totalRevenue += tx.totalAmount;
      totalDebt += tx.remainingAmount;

      tx.items.forEach((item) => {
        if (item.animal) {
          totalProfit += (item.price - item.animal.purchasePrice);
        }
      });
    });

    // Subtract expenses from profit if needed
    const expenses = await prisma.expense.findMany({
      where: { tenantId: user.tenantId },
    });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 4. Monthly analytics (Last 6 Months)
    const monthlyRevenue: { month: string; revenue: number; profit: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = subMonths(new Date(), i);
      const start = startOfMonth(targetDate);
      const end = endOfMonth(targetDate);
      const monthLabel = format(targetDate, 'MMMM yyyy', { locale: id });

      const monthTransactions = await prisma.transaction.findMany({
        where: {
          tenantId: user.tenantId,
          deletedAt: null,
          status: { not: 'CANCELLED' },
          transactionDate: {
            gte: start,
            lte: end,
          },
        },
        include: {
          items: {
            include: {
              animal: true,
            },
          },
        },
      });

      let monthRevenue = 0;
      let monthProfit = 0;

      monthTransactions.forEach((tx) => {
        monthRevenue += tx.totalAmount;
        tx.items.forEach((item) => {
          if (item.animal) {
            monthProfit += (item.price - item.animal.purchasePrice);
          }
        });
      });

      monthlyRevenue.push({
        month: monthLabel,
        revenue: monthRevenue,
        profit: monthProfit,
      });
    }

    // 5. Recent Transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { tenantId: user.tenantId, deletedAt: null },
      include: {
        buyer: { select: { name: true } },
        creator: { select: { name: true } },
      },
      orderBy: { transactionDate: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalAnimals,
        availableAnimals,
        soldAnimals,
        bookedAnimals,
        totalRevenue,
        totalProfit,
        totalDebt,
        totalTransactions,
        monthlyRevenue,
        speciesDistribution,
        recentTransactions,
      },
    });
  } catch (error: any) {
    console.error('Dashboard Stats API Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}
