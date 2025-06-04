import express from 'express';
import { connectDB } from '../utils/db.js';
import AuthService from '../services/authService.js';
import AuthController from '../controllers/authController.js';

const router = express.Router();

// Initialize controller immediately with a wrapper
let authController;

const initializeAuth = async () => {
  try {
    const db = await connectDB();
    const userCollection = db.collection('users');
    const authService = new AuthService(userCollection);
    authController = new AuthController(authService);
    console.log("Auth system initialized");
    return authController;
  } catch (err) {
    console.error("Initialization failed:", err);
    throw err;
  }
};

// Create a wrapper middleware that ensures authController is initialized
const withAuthController = async (req, res, next) => {
  try {
    if (!authController) {
      authController = await initializeAuth();
    }
    next();
  } catch (err) {
    console.error("Auth controller initialization error:", err);
    res.status(500).json({ error: "Authentication system unavailable" });
  }
};

// Apply the wrapper middleware to all routes
router.use(withAuthController);

// Routes
router.post("/adminlogin", (req, res) => authController.adminLogin(req, res));
router.post('/add_user', 
  (req, res, next) => authController.verifyTokenAndRole('manager')(req, res, next), 
  (req, res) => authController.addUser(req, res)
);
router.get('/user', 
  (req, res, next) => authController.verifyTokenAndRole('manager')(req, res, next), 
  (req, res) => authController.getUsers(req, res)
);
router.get("/user-profile", 
  (req, res, next) => authController.verifyTokenAndRole()(req, res, next), 
  (req, res) => authController.getUserProfile(req, res)
);
router.get("/logout", (req, res) => authController.logout(req, res));

export { router as adminRouter };