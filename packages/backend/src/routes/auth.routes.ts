import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import z from "zod";
import { prisma } from "../lib/prisma.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "membrain-strategic-forgetting-secret-99";

const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string(),
  }),
});

const router = Router();

// Auth: Register
router.post("/register", validateRequest(registerSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User along with default UserProfile
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        profile: {
          create: {
            domain: "general",
            lambdaDecay: 0.01,
            forgetThreshold: 0.15,
            alphaWeight: 0.25,
            betaWeight: 0.35,
            gammaWeight: 0.30,
            deltaWeight: 0.10
          }
        }
      },
      include: { profile: true }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

// Auth: Login
router.post("/login", validateRequest(loginSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

// Auth: Get current identity
router.get("/me", authenticateToken, async (req: any, res: Response) => {
  res.json({ user: { id: req.user.id, email: req.user.email } });
});

// Auth: Refresh Token
router.post("/refresh", authenticateToken, async (req: any, res: Response) => {
  const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

export default router;
