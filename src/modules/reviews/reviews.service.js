const prisma = require('../../config/db');

const getAll = async () => {
    return await prisma.review.findMany({
        include: {
            customer: true,
            job: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

const create = async (reviewData, user) => {
    const { rating, comment, jobId } = reviewData;
    
    // In this system, customers are linked to users via user.customer
    if (!user.customer && user.role !== 'CUSTOMER') {
        throw new Error('User must be a customer to leave a review.');
    }

    // Attempt to find customer if not already in user object (context dependent)
    let customerId = user.customer?.id;
    if (!customerId) {
        const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
        if (!customer) throw new Error('Customer profile not found.');
        customerId = customer.id;
    }

    return await prisma.review.create({
        data: {
            rating: parseInt(rating),
            comment,
            customerId,
            jobId: jobId ? parseInt(jobId) : null
        }
    });
};

module.exports = { getAll, create };
