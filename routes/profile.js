const express = require('express');
const router = express.Router();

router.get('/user', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Destructure only safe fields
  const { id, discordId, email, createdAt, updatedAt } = req.user;

  res.json({
    user: {
      id,
      discordId,
      email,
      createdAt,
      updatedAt,
    }
  });
});
module.exports = router;