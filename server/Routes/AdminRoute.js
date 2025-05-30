import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { connectDB } from "../utils/db.js";
import User from '../models/User.js';

const router = express.Router();
let userCollection;

const initializeDB = async () => {
  try {
    const db = await connectDB();
    userCollection = db.collection('users');
    console.log("Database collections initialized");
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err;
  }
};

// Middleware to verify JWT and roles
const verifyTokenAndRole = (requiredRole) => async (req, res, next) => {
  try {
    // Accept token from either header or cookie
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ Status: false, Error: "Not authenticated" });
    }
    console.log('✅ Decoded token:', decoded);
    const decoded = jwt.verify(token, "jwt_secret_key");

    const user = await userCollection.findOne({ _id: new ObjectId(decoded.userId) });
    console.log('🔍 Fetched user from DB:', user); 
    if (!user) {
      return res.status(401).json({ Status: false, Error: "User not found" });
    }

    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({ Status: false, Error: "Unauthorized access" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ Status: false, Error: "Invalid token" });
  }
};

router.use(async (req, res, next) => {
  try {
    if (!userCollection) {
      await initializeDB();
    }
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

// =======================
// ADMIN LOGIN
// =======================
router.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ loginStatus: false, Error: "Wrong email or password" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ loginStatus: false, Error: "Wrong email or password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email
      },
      "jwt_secret_key",
      { expiresIn: "1d" }
    );

    // Optional: still set cookie if you want dual support
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : 'localhost',
      path: '/'
    });

    return res.json({
      loginStatus: true,
      token,
      role: user.role,
      username: user.username
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ loginStatus: false, Error: "Server error" });
  }
});

// =======================
// MANAGER-ONLY ROUTES
// =======================
router.post('/add_user', verifyTokenAndRole('manager'), async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password.toString(), 10);
    const user = {
      username: req.body.username,
      email: req.body.email,
      role: req.body.role,
      phonenumber: req.body.phonenumber,
      password: hash,
    };
    await userCollection.insertOne(user);
    return res.json({ Status: true });
  } catch (err) {
    console.error("Add user error:", err);
    return res.status(500).json({ Status: false, Error: err.message });
  }
});

router.get('/user', verifyTokenAndRole('manager'), async (req, res) => {
  try {
    const users = await userCollection.find({}).toArray();
    return res.json({ Status: true, Result: users });
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ Status: false, Error: "Query error" });
  }
});

// =======================
// COMMON ROUTES (All Roles)
// =======================
router.get("/user-profile", verifyTokenAndRole(), async (req, res) => {
  try {
    return res.json({
      Status: true,
      user: {
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ Status: false, Error: "Query error" });
  }
});

// =======================
// LOGOUT
// =======================
router.get("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : 'localhost',
      path: '/'
    });
    return res.json({ Status: true, Message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ Status: false, Error: "Logout failed" });
  }
});

export { router as adminRouter };
