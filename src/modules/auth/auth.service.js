const prisma = require('../../config/db');
const { comparePassword } = require('../../utils/hash');
const { generateToken } = require('../../utils/token');

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { employee: true, customer: true }
  });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user.id);
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      employee: user.employee,
      customer: user.customer
    }
  };
};

module.exports = { login };
