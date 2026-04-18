const prisma = require('../../config/db');
const { comparePassword, hashPassword } = require('../../utils/hash');
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

const changePassword = async (userId, currentPassword, newPassword, confirmPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const currentMatches = await comparePassword(currentPassword || '', user.password);
  if (!currentMatches) {
    const error = new Error('Current password is incorrect');
    error.status = 400;
    throw error;
  }

  if (!newPassword || newPassword.length < 8) {
    const error = new Error('New password must be at least 8 characters long');
    error.status = 400;
    throw error;
  }

  if (newPassword !== confirmPassword) {
    const error = new Error('New password and confirm password do not match');
    error.status = 400;
    throw error;
  }

  const sameAsCurrent = await comparePassword(newPassword, user.password);
  if (sameAsCurrent) {
    const error = new Error('New password must be different from current password');
    error.status = 400;
    throw error;
  }

  const password = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password }
  });

  return { success: true };
};

module.exports = { login, changePassword };
