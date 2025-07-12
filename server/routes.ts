import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import express from "express";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertSessionSchema, insertApiTokenSchema, type User } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const JWT_SECRET = process.env.JWT_SECRET || "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
} as any);

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface AuthenticatedRequest extends Request {
  user: User;
}

// Type-safe middleware wrapper
const withAuth = (handler: (req: AuthenticatedRequest, res: Response) => Promise<void | Response>) => {
  return async (req: Request, res: Response) => {
    return handler(req as AuthenticatedRequest, res);
  };
};

// Authentication middleware
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          jobRole: user.jobRole,
          company: user.company,
          resumeName: user.resumeName,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          jobRole: user.jobRole,
          company: user.company,
          resumeName: user.resumeName,
        },
        token,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User profile routes
  app.get("/api/user/profile", authenticateToken, withAuth(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      const subscription = await storage.getSubscription(user.id);
      
      // Return profile data in the format expected by the Electron app
      res.json({
        name: user.name,
        email: user.email,
        jobRole: user.jobRole || null,
        company: user.company || null,
        resume: {}, // Empty object as specified
        resumeName: user.resumeName || null,
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        } : null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }));

  app.patch("/api/user/profile", authenticateToken, withAuth(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.user.id, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        jobRole: user.jobRole,
        company: user.company,
        resumeName: user.resumeName,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }));

  // Subscription routes
  app.post("/api/create-subscription", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { priceId, plan } = req.body;
      const user = req.user;

      // Check if user already has a subscription
      const existingSubscription = await storage.getSubscription(user.id);
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.status(400).json({ message: "User already has an active subscription" });
      }

      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });
        await storage.updateUserStripeInfo(user.id, customer.id);
      }

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to database
      await storage.createSubscription({
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status: subscription.status,
        plan: plan,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      });

      await storage.updateUserStripeInfo(user.id, customer.id, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/subscription/status", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const subscription = await storage.getSubscription(req.user.id);
      
      if (!subscription) {
        return res.json({ plan: 'free', status: 'active' });
      }

      // Get current Stripe subscription data
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      
      // Update local subscription data
      await storage.updateSubscriptionByStripeId(subscription.stripeSubscriptionId, {
        status: stripeSubscription.status,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
      });

      res.json({
        plan: subscription.plan,
        status: stripeSubscription.status,
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/subscription/cancel", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const subscription = await storage.getSubscription(req.user.id);
      
      if (!subscription) {
        return res.status(404).json({ message: "No subscription found" });
      }

      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await storage.updateSubscriptionByStripeId(subscription.stripeSubscriptionId, {
        cancelAtPeriodEnd: true,
      });

      res.json({ message: "Subscription will be canceled at the end of the current period" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API Token routes
  app.get("/api/tokens", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tokens = await storage.getUserApiTokens(req.user.id);
      res.json(tokens.map(token => ({
        id: token.id,
        name: token.name,
        lastUsed: token.lastUsed,
        createdAt: token.createdAt,
      })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tokens", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name } = req.body;
      const token = crypto.randomBytes(32).toString('hex');
      
      const apiToken = await storage.createApiToken({
        userId: req.user.id,
        token,
        name: name || 'Desktop App Token',
      });

      res.json({
        id: apiToken.id,
        name: apiToken.name,
        token: apiToken.token,
        createdAt: apiToken.createdAt,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/tokens/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tokenId = parseInt(req.params.id);
      await storage.deleteApiToken(tokenId);
      res.json({ message: "Token deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sessions routes
  app.get("/api/sessions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessions = await storage.getUserSessions(req.user.id);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sessions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessionData = insertSessionSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe webhook
  app.post("/api/webhook/stripe", express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(400).send('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as any;
          await storage.updateSubscriptionByStripeId(subscription.id, {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
          break;
        
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            await storage.updateSubscriptionByStripeId(invoice.subscription as string, {
              status: 'active',
            });
          }
          break;
        
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as any;
          if (failedInvoice.subscription) {
            await storage.updateSubscriptionByStripeId(failedInvoice.subscription as string, {
              status: 'past_due',
            });
          }
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
