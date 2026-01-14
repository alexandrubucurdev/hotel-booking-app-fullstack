"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format, differenceInDays } from "date-fns";
import { ro } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { getAvailableRooms, createBookingSession } from "@/lib/actions/booking";
import { useFormState, useFormStatus } from "react-dom";
import Button from "@/components/ui/Button"; // Folosim componenta ta existentă

// Tipuri helper
type RoomType = {
     id: string;
     name: string;
     price: number;
     available: number;
     desc: string;
};

// Mapare date statice pentru afișare (imaginile și descrierile)
const ROOM_INFO: Record<string, Partial<RoomType>> = {
     matrimoniala: {
          name: "Matrimonială",
          price: 300,
          desc: "Perfectă pentru cupluri.",
     },
     twin: { name: "Twin", price: 300, desc: "Ideală pentru prieteni." },
     tripla: {
          name: "Triplă",
          price: 400,
          desc: "Spațioasă pentru familii mici.",
     },
     cvadrupla: {
          name: "Cvadruplă",
          price: 500,
          desc: "Confort maxim pentru grupuri.",
     },
};

export default function BookingWizard() {
     const [step, setStep] = useState<1 | 2 | 3>(1);
     const [dateRange, setDateRange] = useState<DateRange | undefined>();
     const [availableRooms, setAvailableRooms] = useState<any[]>([]);
     const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
     const [loadingRooms, setLoadingRooms] = useState(false);

     // Form handling cu Server Actions
     const [state, formAction] = useFormState(createBookingSession, null);

     // Cloudflare Turnstile Script
     useEffect(() => {
          const script = document.createElement("script");
          script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
     }, []);

     // Pasul 1 -> 2: Verificare Disponibilitate
     const handleDateSelect = async () => {
          if (dateRange?.from && dateRange?.to) {
               setLoadingRooms(true);
               try {
                    const rooms = await getAvailableRooms(
                         dateRange.from,
                         dateRange.to
                    );
                    setAvailableRooms(rooms);
                    setStep(2);
               } catch (error) {
                    alert("Eroare la verificarea disponibilității");
               } finally {
                    setLoadingRooms(false);
               }
          }
     };

     const nights =
          dateRange?.from && dateRange?.to
               ? differenceInDays(dateRange.to, dateRange.from)
               : 0;

     return (
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden my-10">
               {/* Header Progres */}
               <div className="bg-primary-900 text-white p-6 flex justify-between">
                    <div
                         className={`font-bold ${
                              step >= 1 ? "text-gold-500" : "text-gray-400"
                         }`}
                    >
                         1. Perioada
                    </div>
                    <div
                         className={`font-bold ${
                              step >= 2 ? "text-gold-500" : "text-gray-400"
                         }`}
                    >
                         2. Camera
                    </div>
                    <div
                         className={`font-bold ${
                              step >= 3 ? "text-gold-500" : "text-gray-400"
                         }`}
                    >
                         3. Finalizare
                    </div>
               </div>

               <div className="p-8">
                    {/* PASUL 1: Calendar */}
                    {step === 1 && (
                         <div className="flex flex-col items-center">
                              <h2 className="text-2xl font-serif mb-6 text-primary-900">
                                   Alege perioada sejurului
                              </h2>
                              <div className="border rounded-lg p-4 bg-gray-50">
                                   <DayPicker
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        locale={ro}
                                        min={2}
                                        disabled={{ before: new Date() }}
                                        classNames={{
                                             selected:
                                                  "bg-primary-600 text-white", // Tailwind custom
                                             today: "text-primary-600 font-bold",
                                        }}
                                   />
                              </div>
                              <div className="mt-6">
                                   <Button
                                        onClick={handleDateSelect}
                                        disabled={
                                             !dateRange?.from || !dateRange?.to
                                        }
                                   >
                                        Caută Camere Disponibile
                                   </Button>
                              </div>
                         </div>
                    )}

                    {/* PASUL 2: Selectare Cameră */}
                    {step === 2 && (
                         <div>
                              <div className="flex justify-between items-center mb-6">
                                   <h2 className="text-2xl font-serif text-primary-900">
                                        Camere disponibile
                                   </h2>
                                   <button
                                        onClick={() => setStep(1)}
                                        className="text-sm underline text-gray-500"
                                   >
                                        Schimbă datele
                                   </button>
                              </div>

                              <div className="grid gap-4">
                                   {availableRooms.map((room) => {
                                        const info =
                                             ROOM_INFO[room.room_type_id];
                                        const isAvailable =
                                             room.available_count > 0;

                                        return (
                                             <div
                                                  key={room.room_type_id}
                                                  className={`border p-4 rounded-lg flex justify-between items-center transition-all ${
                                                       selectedRoom ===
                                                       room.room_type_id
                                                            ? "border-primary-600 bg-primary-50 ring-2 ring-primary-200"
                                                            : "border-gray-200"
                                                  }`}
                                                  onClick={() =>
                                                       isAvailable &&
                                                       setSelectedRoom(
                                                            room.room_type_id
                                                       )
                                                  }
                                             >
                                                  <div>
                                                       <h3 className="font-bold text-lg">
                                                            {info.name}
                                                       </h3>
                                                       <p className="text-gray-500 text-sm">
                                                            {info.desc}
                                                       </p>
                                                       <p className="text-sm mt-1">
                                                            Disponibile:{" "}
                                                            <span className="font-semibold">
                                                                 {
                                                                      room.available_count
                                                                 }
                                                            </span>
                                                       </p>
                                                  </div>
                                                  <div className="text-right">
                                                       <p className="text-xl font-bold text-primary-700">
                                                            {info.price} RON{" "}
                                                            <span className="text-xs font-normal text-gray-400">
                                                                 /noapte
                                                            </span>
                                                       </p>
                                                       {isAvailable ? (
                                                            <button
                                                                 onClick={(
                                                                      e
                                                                 ) => {
                                                                      e.stopPropagation();
                                                                      setSelectedRoom(
                                                                           room.room_type_id
                                                                      );
                                                                      setStep(
                                                                           3
                                                                      );
                                                                 }}
                                                                 className="mt-2 px-4 py-2 bg-primary-900 text-white text-sm rounded hover:bg-primary-800"
                                                            >
                                                                 Rezervă
                                                            </button>
                                                       ) : (
                                                            <span className="text-red-500 text-sm font-bold">
                                                                 Indisponibil
                                                            </span>
                                                       )}
                                                  </div>
                                             </div>
                                        );
                                   })}
                              </div>
                         </div>
                    )}

                    {/* PASUL 3: Formular Date */}
                    {step === 3 &&
                         dateRange?.from &&
                         dateRange?.to &&
                         selectedRoom && (
                              <form action={formAction} className="space-y-6">
                                   <h2 className="text-2xl font-serif mb-4 text-primary-900">
                                        Datele tale
                                   </h2>

                                   {/* Inputuri ascunse pentru datele tehnice */}
                                   <input
                                        type="hidden"
                                        name="checkIn"
                                        value={dateRange.from.toISOString()}
                                   />
                                   <input
                                        type="hidden"
                                        name="checkOut"
                                        value={dateRange.to.toISOString()}
                                   />
                                   <input
                                        type="hidden"
                                        name="roomTypeId"
                                        value={selectedRoom}
                                   />

                                   <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Nume Complet
                                             </label>
                                             <input
                                                  type="text"
                                                  name="guestName"
                                                  required
                                                  className="w-full border p-2 rounded focus:ring-primary-500"
                                                  placeholder="Ex: Popescu Ion"
                                             />
                                             {state?.error?.guestName && (
                                                  <p className="text-red-500 text-xs mt-1">
                                                       {state.error.guestName}
                                                  </p>
                                             )}
                                        </div>
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Telefon
                                             </label>
                                             <input
                                                  type="tel"
                                                  name="guestPhone"
                                                  required
                                                  className="w-full border p-2 rounded focus:ring-primary-500"
                                                  placeholder="07xx xxx xxx"
                                             />
                                             {state?.error?.guestPhone && (
                                                  <p className="text-red-500 text-xs mt-1">
                                                       {state.error.guestPhone}
                                                  </p>
                                             )}
                                        </div>
                                        <div className="md:col-span-2">
                                             <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Email
                                             </label>
                                             <input
                                                  type="email"
                                                  name="guestEmail"
                                                  required
                                                  className="w-full border p-2 rounded focus:ring-primary-500"
                                                  placeholder="nume@exemplu.com"
                                             />
                                             {state?.error?.guestEmail && (
                                                  <p className="text-red-500 text-xs mt-1">
                                                       {state.error.guestEmail}
                                                  </p>
                                             )}
                                        </div>
                                        <div className="md:col-span-2">
                                             <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Mențiuni Speciale (opțional)
                                             </label>
                                             <textarea
                                                  name="specialRequests"
                                                  className="w-full border p-2 rounded focus:ring-primary-500 h-24"
                                             ></textarea>
                                        </div>
                                   </div>

                                   {/* Sumar Plată */}
                                   <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-6">
                                        <div className="flex justify-between mb-2">
                                             <span>
                                                  Total Cazare ({nights} nopți):
                                             </span>
                                             <span className="font-bold">
                                                  {(ROOM_INFO[selectedRoom]
                                                       ?.price || 0) *
                                                       nights}{" "}
                                                  RON
                                             </span>
                                        </div>
                                        <div className="flex justify-between text-primary-700 font-bold border-t pt-2 mt-2">
                                             <span>
                                                  De plată acum (Avans 50%):
                                             </span>
                                             <span>
                                                  {Math.round(
                                                       (ROOM_INFO[selectedRoom]
                                                            ?.price || 0) *
                                                            nights *
                                                            0.5
                                                  )}{" "}
                                                  RON
                                             </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                             *Diferența se va achita la
                                             recepție. Anulare gratuită cu 72h
                                             înainte.
                                        </p>
                                   </div>

                                   {/* Cloudflare Turnstile */}
                                   <div
                                        className="cf-turnstile"
                                        data-sitekey={
                                             process.env
                                                  .NEXT_PUBLIC_TURNSTILE_SITE_KEY
                                        }
                                   ></div>
                                   {state?.error?.turnstileToken && (
                                        <p className="text-red-500 text-xs">
                                             {state.error.turnstileToken}
                                        </p>
                                   )}
                                   {state?.error?.root && (
                                        <p className="text-red-500 font-bold text-center">
                                             {state.error.root}
                                        </p>
                                   )}

                                   <div className="flex justify-between items-center mt-6">
                                        <button
                                             type="button"
                                             onClick={() => setStep(2)}
                                             className="text-gray-500 underline"
                                        >
                                             Înapoi
                                        </button>
                                        <SubmitButton />
                                   </div>
                              </form>
                         )}
               </div>
          </div>
     );
}

function SubmitButton() {
     const { pending } = useFormStatus();
     return (
          <Button type="submit" disabled={pending} className="w-full md:w-auto">
               {pending ? "Se procesează..." : "Plătește Avansul"}
          </Button>
     );
}
