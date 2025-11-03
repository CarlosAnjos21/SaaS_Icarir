const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

// Nota: Middlewares de Auth/Admin já estão no adminRoutes.js (pai)

/**
 * @route   GET /api/admin/users
 * @route   POST /api/admin/users
 */
router.route('/')
  .get(adminUserController.getAllUsers)
  .post(adminUserController.createUser);

/**
 * @route   GET /api/admin/users/:id
 * @route   PATCH /api/admin/users/:id
 * @route   DELETE /api/admin/users/:id
 */
router.route('/:id')
  .get(adminUserController.getUserById)
  .patch(adminUserController.updateUser)
  .delete(adminUserController.deleteUser);

module.exports = router;