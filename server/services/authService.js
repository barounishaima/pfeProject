// services/authService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import User from '../models/User.js';

export default class AuthService {
  constructor(userCollection) {
    this.userCollection = userCollection;
  }

  async adminLogin(email, password) {
    const user = await this.userCollection.findOne({ email });

    if (!user) {
      throw new Error('Wrong email or password');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new Error('Wrong email or password');
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

    return {
      token,
      role: user.role,
      username: user.username
    };
  }

  async addUser(userData) {
    const hash = await bcrypt.hash(userData.password.toString(), 10);
    const user = {
      username: userData.username,
      email: userData.email,
      role: userData.role,
      phonenumber: userData.phonenumber,
      password: hash,
    };

    await this.userCollection.insertOne(user);

    const theHiveUserData = {
      login: userData.username,
      name: userData.username,
      password: userData.password, 
      roles: ['read'] 
    };
  
    await createNewUser(theHiveUserData);

    return user;
  }

  async getUsers() {
    return await this.userCollection.find({}).toArray();
  }

  async getUserProfile(userId) {
    const user = await this.userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User not found');
    }
    return {
      username: user.username,
      email: user.email,
      role: user.role
    };
  }

  async verifyToken(token, requiredRole) {
    const decoded = jwt.verify(token, "jwt_secret_key");
    const user = await this.userCollection.findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      throw new Error('User not found');
    }

    if (requiredRole && user.role !== requiredRole) {
      throw new Error('Unauthorized access');
    }

    return user;
  }
}