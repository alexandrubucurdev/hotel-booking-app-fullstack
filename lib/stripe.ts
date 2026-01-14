import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
     throw new Error("STRIPE_SECRET_KEY lipseste din env");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
     apiVersion: null, // sau cea mai recentă versiune
     typescript: true,
});
