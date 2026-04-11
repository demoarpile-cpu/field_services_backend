const prisma = require('../../config/db');

const getManagerKPIs = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [activeJobs, unassignedJobs, jobsToday, pendingTimesheets, pendingMaterials] = await Promise.all([
    // Active Jobs (SCHEDULED or IN_PROGRESS)
    prisma.job.count({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      }
    }),
    // Unassigned Jobs
    prisma.job.count({
      where: {
        assignedTo: null
      }
    }),
    // Jobs Today
    prisma.job.count({
      where: {
        scheduledAt: {
          gte: today,
          lt: tomorrow
        }
      }
    }),
    // Pending Timesheets
    prisma.timesheet.count({
      where: {
        status: 'PENDING'
      }
    }),
    // Pending Material Requests
    prisma.materialRequest.count({
      where: {
        status: 'PENDING'
      }
    })
  ]);

  const totalPendingApprovals = pendingTimesheets + pendingMaterials;

  return [
    { label: 'Active Jobs', value: activeJobs.toString(), trend: '+2', color: 'from-cyan-500 to-blue-600' },
    { label: 'Unassigned Jobs', value: unassignedJobs.toString(), trend: 'Needs action', color: 'from-purple-500 to-indigo-600' },
    { label: 'Jobs Today', value: jobsToday.toString(), trend: 'On schedule', color: 'from-emerald-500 to-teal-600' },
    { label: 'Pending Approvals', value: totalPendingApprovals.toString(), trend: 'Timesheets & Mats', color: 'from-orange-500 to-red-600' }
  ];
};

const getAdminKPIs = async () => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    activeJobs, 
    pendingEstimates, 
    currentRevenue, 
    completedJobs,
    lastMonthJobs,
    lastMonthRevenue
  ] = await Promise.all([
    prisma.job.count({ where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } } }),
    prisma.estimate.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfCurrentMonth } } }),
    prisma.job.count({ where: { status: 'COMPLETED', updatedAt: { gte: startOfCurrentMonth } } }),
    prisma.job.count({ where: { status: 'COMPLETED', updatedAt: { gte: startOfLastMonth, lt: startOfCurrentMonth } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth } } })
  ]);

  const calculateTrend = (current, last) => {
    if (!last || last === 0) return current > 0 ? '+100%' : '0%';
    const pct = ((current - last) / last) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  const revenueTrend = calculateTrend(Number(currentRevenue._sum.amount || 0), Number(lastMonthRevenue._sum.amount || 0));
  const jobsTrend = calculateTrend(completedJobs, lastMonthJobs);

  return [
    { label: 'Active Jobs', value: activeJobs.toString(), trend: 'Currently Dispatched', isPositive: true, color: 'from-brand-purple to-indigo-500' },
    { label: 'Pending Estimates', value: pendingEstimates.toString(), trend: 'Awaiting Approval', isPositive: false, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Revenue (MTD)', value: `$${(currentRevenue._sum.amount || 0).toLocaleString()}`, trend: revenueTrend, isPositive: parseFloat(revenueTrend) >= 0, color: 'from-brand-cyan to-teal-500' },
    { label: 'Completed (MTD)', value: completedJobs.toString(), trend: jobsTrend, isPositive: parseFloat(jobsTrend) >= 0, color: 'from-emerald-400 to-teal-400' },
  ];
};

const getRevenueHistory = async () => {
  // Get last 12 months of revenue
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  const revenueData = await prisma.$queryRaw`
    SELECT 
      MONTH(createdAt) as monthNum, 
      SUM(amount) as total 
    FROM Payment 
    WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY MONTH(createdAt)
    ORDER BY MIN(createdAt) ASC
  `;

  // Map to format expected by frontend
  return months.map((m, i) => {
    const record = revenueData.find(r => r.monthNum === i + 1);
    return {
      month: m,
      amount: record ? Number(record.total) : 0
    };
  });
};

const getJobStats = async () => {
  const stats = await prisma.job.groupBy({
    by: ['status'],
    _count: {
      status: true
    }
  });

  const total = stats.reduce((acc, s) => acc + s._count.status, 0);

  return [
    { status: 'Completed', count: stats.find(s => s.status === 'COMPLETED')?._count.status || 0, color: 'bg-emerald-500' },
    { status: 'In Progress', count: stats.find(s => s.status === 'IN_PROGRESS')?._count.status || 0, color: 'bg-brand-cyan' },
    { status: 'Pending', count: stats.find(s => s.status === 'SCHEDULED')?._count.status || 0, color: 'bg-amber-500' },
    { status: 'Cancelled', count: stats.find(s => s.status === 'CANCELLED')?._count.status || 0, color: 'bg-rose-500' },
  ].map(s => ({
    ...s,
    pct: total > 0 ? Math.round((s.count / total) * 100) : 0
  }));
};

module.exports = { getManagerKPIs, getAdminKPIs, getRevenueHistory, getJobStats };
