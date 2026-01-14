"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schema de validare Zod
const bookingSchema = z.object({
     checkIn: z.date(),
     checkOut: z.date(),
     roomTypeId: z.string(),
     guestName: z.string().min(3, "Numele este prea scurt"),
     guestEmail: z.string().email("Email invalid"),
     guestPhone: z.string().min(10, "Număr de telefon invalid"),
     specialRequests: z.string().optional(),
     turnstileToken: z.string().min(1, "Verificarea anti-bot este obligatorie"),
});

export async function getAvailableRooms(checkIn: Date, checkOut: Date) {
     const supabase = createClient();

     // Apelăm funcția RPC creată în SQL
     const { data, error } = await supabase.rpc("check_availability", {
          check_in_date: checkIn.toISOString(),
          check_out_date: checkOut.toISOString(),
     });

     if (error) throw new Error(error.message);
     return data; // Array cu { room_type_id, available_count }
}

export async function createBookingSession(prevState: any, formData: FormData) {
     const supabase = createClient();

     // 1. Parsare și Validare Date
     const rawData = {
          checkIn: new Date(formData.get("checkIn") as string),
          checkOut: new Date(formData.get("checkOut") as string),
          roomTypeId: formData.get("roomTypeId"),
          guestName: formData.get("guestName"),
          guestEmail: formData.get("guestEmail"),
          guestPhone: formData.get("guestPhone"),
          specialRequests: formData.get("specialRequests"),
          turnstileToken: formData.get("cf-turnstile-response"), // Cloudflare token
     };

     const validatedFields = bookingSchema.safeParse(rawData);

     if (!validatedFields.success) {
          return { error: validatedFields.error.flatten().fieldErrors };
     }

     const {
          checkIn,
          checkOut,
          roomTypeId,
          guestName,
          guestEmail,
          guestPhone,
     } = validatedFields.data;

     // 2. Validare Turnstile (Server-side check)
     const cfVerify = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
               method: "POST",
               body: JSON.stringify({
                    secret: process.env.CLOUDFLARE_SECRET_KEY,
                    response: rawData.turnstileToken,
               }),
               headers: { "Content-Type": "application/json" },
          }
     );
     const cfResult = await cfVerify.json();
     if (!cfResult.success)
          return { error: { turnstileToken: ["Validare anti-bot eșuată"] } };

     // 3. Verificare Disponibilitate Atomică (Double Check)
     const { data: availability } = await supabase.rpc("check_availability", {
          check_in_date: checkIn.toISOString(),
          check_out_date: checkOut.toISOString(),
     });

     const roomStatus = availability.find(
          (r: any) => r.room_type_id === roomTypeId
     );
     if (!roomStatus || roomStatus.available_count <= 0) {
          return {
               error: {
                    root: [
                         "Această cameră nu mai este disponibilă pentru perioada selectată.",
                    ],
               },
          };
     }

     // 4. Calcul Preț (Fetch din DB pentru siguranță, nu din frontend)
     const { data: roomType } = await supabase
          .from("room_types")
          .select("*")
          .eq("id", roomTypeId)
          .single();

     const nights = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
     );
     const totalPrice = roomType.price_per_night * nights;
     const depositAmount = Math.round(totalPrice * 0.5); // 50% avans

     // 5. Creare "Booking Pending" în DB (Rezervăm slotul temporar)
     const { data: booking, error: insertError } = await supabase
          .from("bookings")
          .insert({
               check_in: checkIn,
               check_out: checkOut,
               room_type_id: roomTypeId,
               guest_name: guestName,
               guest_email: guestEmail,
               guest_phone: guestPhone,
               total_price: totalPrice,
               deposit_paid: depositAmount,
               status: "pending", // Important: e pending până plătește
          })
          .select()
          .single();

     if (insertError)
          return { error: { root: ["Eroare la crearea rezervării."] } };

     // 6. Creare Stripe Checkout Session
     const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
               {
                    price_data: {
                         currency: "ron",
                         product_data: {
                              name: `Rezervare: ${roomType.name}`,
                              description: `Avans 50% pentru ${nights} nopți (${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()})`,
                         },
                         unit_amount: depositAmount * 100, // Stripe folosește bani (cents)
                    },
                    quantity: 1,
               },
          ],
          metadata: {
               bookingId: booking.id, // Legătura cu DB
          },
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/rezervari/succes?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/rezervari?error=cancelled`,
     });

     // Updatăm booking-ul cu ID-ul sesiunii pentru a putea face match la webhook
     await supabase
          .from("bookings")
          .update({ stripe_session_id: session.id })
          .eq("id", booking.id);

     redirect(session.url!);
}
