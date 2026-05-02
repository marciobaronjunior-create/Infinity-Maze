import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Lazy initialization of Stripe to avoid crash if key is missing
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required. Please set it in Settings > Environment Variables.");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();

  // API Health Check
  app.get("/api/health", (req, res) => {
    const sk = process.env.STRIPE_SECRET_KEY || "";
    const pk = process.env.VITE_STRIPE_PUBLIC_KEY || "";
    const wh = process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
    
    console.log(`[Health] Checking Stripe configuration... SK: ${!!sk}, PK: ${!!pk}`);

    res.json({ 
      status: "ok",
      timestamp: new Date().toISOString(),
      stripe_secret_key: {
        detected: !!sk,
        valid_prefix: sk.startsWith('sk_') || sk.startsWith('rk_'),
        mode: sk.startsWith('sk_test') || sk.startsWith('rk_test') ? 'test' : 'live',
        length: sk.length
      },
      stripe_public_key: {
        detected: !!pk,
        valid_prefix: pk.startsWith('pk_'),
        mode: pk.startsWith('pk_test') ? 'test' : 'live',
        length: pk.length
      },
      stripe_webhook_secret: {
        detected: !!wh,
        valid_prefix: wh.startsWith('whsec_'),
        prefix_received: wh.substring(0, 6),
        length: wh.length
      },
      node_env: process.env.NODE_ENV || 'development'
    });
  });

  // Stripe Webhook FIRST (requires raw body)
  app.post("/api/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const stripe = getStripe();
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        return res.status(400).send('Webhook Error: Missing signature or secret');
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💰 Payment Successful for session:', session.id);
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error(`❌ Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Request logging for other API routes
  app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.url}`);
    next();
  });

  // Global JSON parser for other API routes
  app.use("/api", express.json());

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { items, currency = "usd", origin: clientOrigin } = req.body;
      console.log(`[Stripe] Creating session for items:`, items);
      
      const stripe = getStripe();
      const origin = clientOrigin || req.headers.origin || `${req.protocol}://${req.get('host')}`;
      console.log(`[Stripe] Using origin for redirects: ${origin}`);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: currency,
            product_data: {
              name: item.name,
              description: item.description,
            },
            unit_amount: item.amount,
          },
          quantity: 1,
        })),
        mode: "payment",
        success_url: `${origin}/store?success=true`,
        cancel_url: `${origin}/store?canceled=true`,
      });

      console.log(`[Stripe] Session created: ${session.id}, URL: ${session.url}`);
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("❌ Stripe Session Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Stripe Secret Key Detected: ${!!process.env.STRIPE_SECRET_KEY}`);
  });
}

startServer().catch(err => {
    console.error("Failed to start server:", err);
});
