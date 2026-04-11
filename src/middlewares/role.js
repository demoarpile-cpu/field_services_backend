const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles.toUpperCase()];
  } else {
    roles = roles.map(r => r.toUpperCase());
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role.toUpperCase();
    if (roles.length && !roles.includes(userRole)) {
      console.warn(`Access denied for role: ${userRole}. Required: ${roles.join(', ')}`);
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

module.exports = { authorize };
