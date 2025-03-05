import express from 'express';
import { createUser, deleteUser, loginUser, sendOtpResend } from '../controllers/userController';

const router = express.Router();

// router.get('/users', getUsers);
router.post('/create-user', createUser);
router.get('/sendotp', sendOtpResend);
router.post('/login',loginUser);
router.delete("/user/:userId", deleteUser);
export default router;
