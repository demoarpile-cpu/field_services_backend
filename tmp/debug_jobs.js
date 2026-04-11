const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFetch() {
  try {
    console.log('Attempting to fetch jobs...');
    const jobs = await prisma.job.findMany({
      include: { 
        customer: true, 
        technician: true, 
        notes: true, 
        photos: true,
        invoice: true,
        estimate: true
      }
    });
    console.log('Successfully fetched', jobs.length, 'jobs');
    // console.log(JSON.stringify(jobs[0], null, 2));
  } catch (error) {
    console.error('Error fetching jobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFetch();
