// controllers/authController.js
import AuthService from '../services/authService.js';

export default class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.adminLogin(email, password);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : 'localhost',
        path: '/'
      });

      res.json({
        loginStatus: true,
        ...result
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(401).json({ loginStatus: false, Error: err.message });
    }
  }

  async addUser(req, res) {
    try {
      await this.authService.addUser(req.body);
      res.json({ Status: true });
    } catch (err) {
      console.error("Add user error:", err);
      res.status(500).json({ Status: false, Error: err.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this.authService.getUsers();
      res.json({ Status: true, Result: users });
    } catch (err) {
      console.error("Get users error:", err);
      res.status(500).json({ Status: false, Error: "Query error" });
    }
  }

  async getUserProfile(req, res) {
    try {
      const profile = await this.authService.getUserProfile(req.user._id);
      res.json({ Status: true, user: profile });
    } catch (err) {
      console.error("Profile error:", err);
      res.status(500).json({ Status: false, Error: "Query error" });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : 'localhost',
        path: '/'
      });
      res.json({ Status: true, Message: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
      res.status(500).json({ Status: false, Error: "Logout failed" });
    }
  }

  verifyTokenAndRole(requiredRole) {
    return async (req, res, next) => {
      try {
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

        req.user = await this.authService.verifyToken(token, requiredRole);
        next();
      } catch (err) {
        console.error("Authentication error:", err);
        return res.status(401).json({ Status: false, Error: err.message });
      }
    };
  }
}