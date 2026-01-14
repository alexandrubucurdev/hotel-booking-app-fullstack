import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
     const body = await req.text();
     const signature = headers().get("Stripe-Signature") as string;

     let event;

     try {
          event = stripe.webhooks.constructEvent(
               body,
               signature,
               process.env.STRIPE_WEBHOOK_SECRET!
          );
     } catch (err: any) {
          return new NextResponse(`Webhook Error: ${err.message}`, {
               status: 400,
          });
     }

     const supabase = await createClient(); // Adaugă await aici

     if (event.type === "checkout.session.completed") {
          const session = event.data.object as any;
          const bookingId = session.metadata.bookingId;

          // Confirmăm rezervarea
          const { error } = await supabase
               .from("bookings")
               .update({ status: "confirmed" })
               .eq("id", bookingId);

          if (error) {
               console.error("Error confirming booking:", error);
               return new NextResponse("Database Error", { status: 500 });
          }

          // Aici ai putea adăuga logica de trimitere email (Resend/SendGrid)
          // await sendConfirmationEmail(session.customer_details.email, ...);
     }

     return new NextResponse(null, { status: 200 });
}
