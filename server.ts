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

  // 1. Logs de depuração no topo absoluto
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      console.log(`[DEBUG] API Request: ${req.method} ${req.originalUrl} from ${req.ip}`);
    }
    next();
  });

  // --- API ROUTER ---
  const api = express.Router();

  // Middleware to ensure all /api responses are JSON
  api.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // 1. Stripe Webhook (needs raw body, MUST be before json() middleware)
  api.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    console.log("[API] Webhook received");
    try {
      const stripe = getStripe();
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        console.warn("[API] Webhook missing signature or secret");
        return res.status(400).send('Webhook Error: Missing signature or secret');
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log(`[API] Webhook event: ${event.type}`);
      res.json({ received: true });
    } catch (err: any) {
      console.error(`❌ Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // 2. JSON Middleware for remaining API routes
  api.use(express.json());

  // 3. Health Check
  api.get("/health", (req, res) => {
    const sk = process.env.STRIPE_SECRET_KEY || "";
    const pk = process.env.VITE_STRIPE_PUBLIC_KEY || "";
    const wh = process.env.STRIPE_WEBHOOK_SECRET || "";
    
    res.json({ 
      status: "ok",
      timestamp: new Date().toISOString(),
      stripe: {
        secret_detected: !!sk,
        public_detected: !!pk,
        webhook_detected: !!wh,
        test_mode: sk.startsWith('sk_test_') || pk.startsWith('pk_test_')
      }
    });
  });

  // 4. Create Checkout Session
  api.post("/create-checkout-session", async (req, res) => {
    console.log(`[API] Create session request`);
    try {
      const { items, currency = "usd", origin: clientOrigin } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Missing or empty items array" });
      }

      const stripe = getStripe();
      
      // Detecção robusta de origem para o iFrame do AI Studio
      const forwardedProto = req.headers['x-forwarded-proto'];
      const protocol = typeof forwardedProto === 'string' ? forwardedProto : req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const origin = clientOrigin || req.headers.origin || `${protocol}://${host}`;
      
      console.log(`[Stripe] Creating session. Host: ${host}, Proto: ${protocol}, Origin: ${origin}`);

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

      console.log(`[API] Session created: ${session.id}`);
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("❌ Stripe Session Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // 5. API 404 Handler (Catch all API routes that didn't match)
  api.all("*", (req, res) => {
    const errorMsg = `API route not found: ${req.method} ${req.originalUrl}`;
    console.warn(`[API] 404: ${errorMsg}`);
    res.status(404).json({ 
      error: errorMsg,
      hint: "Check if the frontend is calling the correct URL with the /api prefix"
    });
  });

  // Mount the API router
  app.use("/api", api);

  // --- Vite / Static Assets ---
  // Ensure we don't serve index.html for missed /api routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found (fallback)" });
  });

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
