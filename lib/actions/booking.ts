"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schema de validare Zod actualizată
const bookingSchema = z.object({
     checkIn: z.date(),
     checkOut: z.date(),
     roomTypeId: z.string(),
     guestName: z.string().min(3, "Numele este prea scurt"),
     guestEmail: z.string().email("Email invalid"),
     guestPhone: z.string().min(10, "Număr de telefon invalid"),

     // Câmpuri noi adăugate
     cnp: z.string().min(5, "CNP-ul sau seria de buletin sunt obligatorii"),
     address: z.string().min(5, "Adresa completă este obligatorie"),
     terms: z.string().refine((val) => val === "on", {
          message: "Trebuie să acceptați termenii și condițiile",
     }),

     specialRequests: z.string().optional(),
     turnstileToken: z.string().min(1, "Verificarea anti-bot este obligatorie"),
});

export async function getAvailableRooms(checkIn: Date, checkOut: Date) {
     const supabase = await createClient();

     const { data, error } = await supabase.rpc("check_availability", {
          check_in_date: checkIn.toISOString(),
          check_out_date: checkOut.toISOString(),
     });

     if (error) throw new Error(error.message);
     return data;
}

export async function createBookingSession(prevState: any, formData: FormData) {
     const supabase = await createClient();

     // 1. Parsare și Validare Date - AICI ESTE FIX-UL
     const rawData = {
          // Folosim "as string || ''" pentru a transforma null in string gol
          checkIn: new Date(formData.get("checkIn") as string),
          checkOut: new Date(formData.get("checkOut") as string),
          roomTypeId: (formData.get("roomTypeId") as string) || "",
          guestName: (formData.get("guestName") as string) || "",
          guestEmail: (formData.get("guestEmail") as string) || "",
          guestPhone: (formData.get("guestPhone") as string) || "",

          // Datele noi cu protecție la null
          cnp: (formData.get("cnp") as string) || "",
          address: (formData.get("address") as string) || "",
          terms: (formData.get("terms") as string) || "", // Checkbox-ul trimite null daca nu e bifat

          specialRequests: (formData.get("specialRequests") as string) || "",
          turnstileToken:
               (formData.get("cf-turnstile-response") as string) || "",
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
          cnp,
          address,
     } = validatedFields.data;

     // 2. Validare Turnstile
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

     // --- LOGICA PENTRU ALOCARE CAMERĂ FIZICĂ ---

     // A. Luăm toate camerele fizice de acest tip
     const { data: physicalRooms } = await supabase
          .from("physical_rooms")
          .select("id")
          .eq("room_type_id", roomTypeId);

     if (!physicalRooms || physicalRooms.length === 0) {
          return {
               error: {
                    root: [
                         "Eroare internă: Nu există camere configurate în sistem.",
                    ],
               },
          };
     }

     // B. Găsim camerele ocupate în acea perioadă
     const { data: occupiedBookings } = await supabase
          .from("bookings")
          .select("assigned_room_number")
          .eq("room_type_id", roomTypeId)
          .neq("status", "cancelled")
          .lt("check_in", checkOut.toISOString())
          .gt("check_out", checkIn.toISOString());

     const occupiedRoomNumbers =
          occupiedBookings?.map((b) => b.assigned_room_number) || [];

     // C. Găsim prima cameră liberă
     const availableRoom = physicalRooms.find(
          (room) => !occupiedRoomNumbers.includes(room.id)
     );

     if (!availableRoom) {
          return {
               error: {
                    root: [
                         "Ne pare rău, ultima cameră disponibilă a fost rezervată chiar acum.",
                    ],
               },
          };
     }

     const assignedRoomNumber = availableRoom.id;
     // --------------------------------------------------

     // 4. Calcul Preț
     const { data: roomType } = await supabase
          .from("room_types")
          .select("*")
          .eq("id", roomTypeId)
          .single();

     const oneDay = 1000 * 60 * 60 * 24;
     const d1 = new Date(checkIn);
     d1.setHours(0, 0, 0, 0);
     const d2 = new Date(checkOut);
     d2.setHours(0, 0, 0, 0);
     const nights = Math.max(
          Math.round((d2.getTime() - d1.getTime()) / oneDay),
          1
     );

     const totalPrice = roomType.price_per_night * nights;
     const depositAmount = Math.round(totalPrice * 0.5);

     // 5. Creare Rezervare
     const { data: booking, error: insertError } = await supabase
          .from("bookings")
          .insert({
               check_in: checkIn,
               check_out: checkOut,
               room_type_id: roomTypeId,
               guest_name: guestName,
               guest_email: guestEmail,
               guest_phone: guestPhone,
               guest_cnp: cnp,
               guest_address: address,
               total_price: totalPrice,
               deposit_paid: depositAmount,
               status: "pending",
               assigned_room_number: assignedRoomNumber,
          })
          .select()
          .single();

     if (insertError) {
          console.error("Supabase Error:", insertError);
          return {
               error: {
                    root: ["Eroare la salvarea rezervării în baza de date."],
               },
          };
     }

     // 6. Stripe Session
     const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
               {
                    price_data: {
                         currency: "ron",
                         product_data: {
                              name: `Rezervare: ${roomType.name} - Camera ${assignedRoomNumber}`,
                              description: `Avans 50% pentru ${nights} nopți`,
                         },
                         unit_amount: depositAmount * 100,
                    },
                    quantity: 1,
               },
          ],
          metadata: {
               bookingId: booking.id,
          },
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/rezervari/succes?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/rezervari?error=cancelled`,
     });

     await supabase
          .from("bookings")
          .update({ stripe_session_id: session.id })
          .eq("id", booking.id);

     redirect(session.url!);
}
