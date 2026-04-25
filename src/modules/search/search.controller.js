const prisma = require('../../config/db');

const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const [jobs, customers, invoices] = await Promise.all([
      // Search Jobs
      prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } }
          ]
        },
        take: 5,
        select: { id: true, title: true }
      }),
      // Search Customers
      prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } }
          ]
        },
        take: 5,
        select: { id: true, name: true }
      }),
      // Search Invoices
      prisma.invoice.findMany({
        where: {
          OR: [
            { notes: { contains: q } },
            { customer: { name: { contains: q } } }
          ]
        },
        take: 5,
        select: { id: true, customer: { select: { name: true } } }
      })
    ]);

    const results = [
      ...jobs.map(j => ({ id: j.id, title: j.title, type: 'Job', path: `/dashboard/jobs/JOB-${j.id}` })),
      ...customers.map(c => ({ id: c.id, title: c.name, type: 'Customer', path: `/dashboard/customers` })), // Note: Customers list doesn't seem to have a detail page in this project style yet, or it's just the list
      ...invoices.map(i => ({ id: i.id, title: `Invoice #${i.id} - ${i.customer?.name}`, type: 'Invoice', path: `/dashboard/invoices` }))
    ];

    res.json(results);
  } catch (error) {
    next(error);
  }
};

module.exports = { globalSearch };
