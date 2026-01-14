"use client";

import { useState, useEffect } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import { differenceInDays, addDays } from "date-fns";
import { ro } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { useFormState, useFormStatus } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
     CalendarDays,
     ArrowRight,
     BedDouble,
     ChevronLeft,
     Sparkles,
     ShieldCheck,
     Wifi,
     Info,
     Clock,
     Coffee,
     UserPlus,
     Minus,
     Plus,
     CheckCircle2,
     Send, // Adaugat pentru buton daca e nevoie
} from "lucide-react";
import Image from "next/image";
import { getAvailableRooms, createBookingSession } from "@/lib/actions/booking";
import { rooms } from "@/lib/data/rooms";
import Button from "@/components/ui/Button"; // <--- IMPORTUL CERUT

// --- ANIMATII ---
const fadeIn = (delay = 0) => ({
     hidden: { opacity: 0, y: 20 },
     visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut", delay },
     },
});

const stepVariants = {
     hidden: { opacity: 0, x: 20 },
     visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
     exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};

// --- COMPONENTE STILIZATE ---

const FormInput = ({ id, label, error, type = "text", ...props }: any) => (
     <div className="relative w-full">
          <input
               id={id}
               name={id}
               type={type}
               placeholder=" "
               className={`block w-full px-4 py-3 bg-transparent border-0 border-b-2 
            appearance-none text-traian-charcoal font-medium
            border-gray-300 focus:outline-none 
            focus:ring-0 focus:border-traian-burgundy peer transition-colors
            ${error ? "border-red-500 focus:border-red-500" : ""}`}
               {...props}
          />
          <label
               htmlFor={id}
               className={`absolute text-sm text-gray-500 duration-300 
            transform -translate-y-6 scale-75 top-3 
            left-4 px-1 bg-white/80 backdrop-blur-sm
            origin-[0] 
            
            peer-placeholder-shown:scale-100
            peer-placeholder-shown:translate-y-0
            peer-placeholder-shown:left-0
            peer-placeholder-shown:px-4
            peer-placeholder-shown:bg-transparent
            
            peer-focus:scale-75
            peer-focus:-translate-y-6
            peer-focus:left-4
            peer-focus:px-1
            peer-focus:bg-white
            peer-focus:text-traian-burgundy
            
            pointer-events-none 
            ${error ? "text-red-500 peer-focus:text-red-500" : ""}
            `}
          >
               {label}
          </label>
          {error && <p className="text-xs text-red-600 mt-1 ml-4">{error}</p>}
     </div>
);

const FormTextarea = ({ id, label, ...props }: any) => (
     <div className="relative w-full">
          <textarea
               id={id}
               name={id}
               rows={3}
               placeholder=" "
               className="block w-full px-4 py-3 bg-transparent border-0 border-b-2 
            appearance-none text-traian-charcoal font-medium
            border-gray-300 focus:outline-none 
            focus:ring-0 focus:border-traian-burgundy peer resize-none transition-colors"
               {...props}
          />
          <label
               htmlFor={id}
               className="absolute text-sm text-gray-500 duration-300 
            transform -translate-y-6 scale-75 top-3 
            left-4 px-1 bg-white/80 backdrop-blur-sm
            origin-[0] 
            
            peer-placeholder-shown:scale-100
            peer-placeholder-shown:translate-y-0
            peer-placeholder-shown:left-0
            peer-placeholder-shown:px-4
            peer-placeholder-shown:bg-transparent
            
            peer-focus:scale-75
            peer-focus:-translate-y-6
            peer-focus:left-4
            peer-focus:px-1
            peer-focus:bg-white
            peer-focus:text-traian-burgundy
            
            pointer-events-none"
          >
               {label}
          </label>
     </div>
);

// Butonul de Submit care foloseste componenta importata Button
function SubmitButton() {
     const { pending } = useFormStatus();
     return (
          <Button
               type="submit"
               disabled={pending}
               variant="primary" // Presupunand ca ai varianta primary definita in Button
               size="lg"
               className="w-full uppercase tracking-wider"
          >
               {pending ? (
                    <>
                         <Sparkles className="animate-spin w-5 h-5 mr-2" />{" "}
                         Procesare...
                    </>
               ) : (
                    <>
                         Confirmă Rezervarea{" "}
                         <ArrowRight className="w-5 h-5 ml-2" />
                    </>
               )}
          </Button>
     );
}

// Counter Component
const GuestCounter = ({ label, value, onChange, min = 1, max = 5 }: any) => (
     <div className="flex items-center justify-between bg-white p-3 border-b border-gray-100 last:border-0">
          <span className="text-sm font-semibold text-traian-charcoal">
               {label}
          </span>
          <div className="flex items-center gap-4">
               <button
                    type="button"
                    onClick={() => value > min && onChange(value - 1)}
                    className={`p-1 rounded-full transition-colors ${
                         value <= min
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-traian-burgundy hover:bg-traian-cream"
                    }`}
                    disabled={value <= min}
               >
                    <Minus className="w-4 h-4" />
               </button>
               <span className="w-4 text-center font-serif font-bold text-traian-charcoal text-lg">
                    {value}
               </span>
               <button
                    type="button"
                    onClick={() => value < max && onChange(value + 1)}
                    className={`p-1 rounded-full transition-colors ${
                         value >= max
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-traian-burgundy hover:bg-traian-cream"
                    }`}
                    disabled={value >= max}
               >
                    <Plus className="w-4 h-4" />
               </button>
          </div>
     </div>
);

export default function BookingWizard() {
     const [step, setStep] = useState<1 | 2 | 3>(1);
     const [dateRange, setDateRange] = useState<DateRange | undefined>({
          from: new Date(),
          to: addDays(new Date(), 1),
     });
     const [adults, setAdults] = useState(2);
     const [children, setChildren] = useState(0);

     const [availabilityData, setAvailabilityData] = useState<any[]>([]);
     const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
     const [loadingRooms, setLoadingRooms] = useState(false);
     const [state, formAction] = useFormState(createBookingSession, null);

     useEffect(() => {
          const script = document.createElement("script");
          script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
          return () => {
               if (document.body.contains(script))
                    document.body.removeChild(script);
          };
     }, []);

     const handleCheckAvailability = async () => {
          if (dateRange?.from && dateRange?.to) {
               setLoadingRooms(true);
               try {
                    const data = await getAvailableRooms(
                         dateRange.from,
                         dateRange.to
                    );
                    setAvailabilityData(data);
                    setStep(2);
                    window.scrollTo({ top: 100, behavior: "smooth" });
               } catch (error) {
                    alert("A apărut o eroare. Vă rugăm încercați din nou.");
               } finally {
                    setLoadingRooms(false);
               }
          }
     };

     const nights =
          dateRange?.from && dateRange?.to
               ? Math.max(differenceInDays(dateRange.to, dateRange.from), 1)
               : 0;

     const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

     const calendarStyles = `
    .rdp { --rdp-cell-size: 45px; --rdp-accent-color: #8B1538; margin: 0; font-family: 'Inter', sans-serif; }
    .rdp-months { justify-content: center; gap: 2rem; }
    .rdp-caption_label { font-family: 'Playfair Display', serif; color: #2D3748; font-size: 1.4rem; font-weight: 700; padding-bottom: 0.5rem; }
    .rdp-head_cell { color: #8B1538; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 0.5rem; }
    .rdp-day { font-size: 1rem; border-radius: 4px; transition: all 0.2s; color: #2D3748; }
    .rdp-day_selected:not(.rdp-day_outside) { background-color: #8B1538 !important; color: white !important; font-weight: bold; }
    .rdp-day_range_middle { background-color: #F7FAFC !important; color: #8B1538 !important; border-top: 1px solid #fee2e2; border-bottom: 1px solid #fee2e2; border-radius: 0 !important; }
    .rdp-day_today { font-weight: bold; color: #D4AF37; border-bottom: 2px solid #D4AF37; }
    .rdp-day:hover:not(.rdp-day_selected) { background-color: #F7FAFC; color: #8B1538; font-weight: bold; border: 1px solid #D4AF37; }
    @media (max-width: 640px) { .rdp { --rdp-cell-size: 36px; } }
  `;

     return (
          <div className="min-h-screen bg-traian-cream flex flex-col font-sans">
               <style>{calendarStyles}</style>

               {/* --- HERO SECTION --- */}
               <section
                    className="bg-traian-charcoal text-white py-20 relative"
                    style={{
                         backgroundImage:
                              "radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
                         backgroundSize: "10px 10px",
                    }}
               >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                         <motion.div
                              initial="hidden"
                              animate="visible"
                              variants={fadeIn()}
                              className="space-y-4"
                         >
                              <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-6">
                                   Rezervă Sejurul
                              </h1>
                              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                                   Experimentează eleganța Hotelului Traian.
                                   Selectează perioada și camera dorită.
                              </p>

                              <div className="flex justify-center items-center gap-4 mt-8 text-sm tracking-widest uppercase font-semibold text-traian-gold/80">
                                   <span
                                        className={
                                             step >= 1
                                                  ? "text-traian-gold"
                                                  : "text-gray-600"
                                        }
                                   >
                                        1. Dată
                                   </span>
                                   <div className="w-8 h-[1px] bg-gray-600"></div>
                                   <span
                                        className={
                                             step >= 2
                                                  ? "text-traian-gold"
                                                  : "text-gray-600"
                                        }
                                   >
                                        2. Cameră
                                   </span>
                                   <div className="w-8 h-[1px] bg-gray-600"></div>
                                   <span
                                        className={
                                             step >= 3
                                                  ? "text-traian-gold"
                                                  : "text-gray-600"
                                        }
                                   >
                                        3. Finalizare
                                   </span>
                              </div>
                         </motion.div>
                    </div>
               </section>

               {/* --- MAIN CONTENT --- */}
               <section className="py-16 relative z-20 ">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                              {/* --- LEFT COLUMN (WIZARD) --- */}
                              <div className="lg:col-span-8">
                                   <motion.div
                                        className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px]"
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeIn(0.2)}
                                   >
                                        <AnimatePresence mode="wait">
                                             {/* === PASUL 1: CALENDAR & DETALII === */}
                                             {step === 1 && (
                                                  <motion.div
                                                       key="step1"
                                                       variants={stepVariants}
                                                       initial="hidden"
                                                       animate="visible"
                                                       exit="exit"
                                                       className="p-6 lg:p-12"
                                                  >
                                                       <div className="text-center mb-10">
                                                            <h2 className="font-serif text-3xl font-bold text-traian-charcoal mb-2">
                                                                 Selectează
                                                                 Perioada
                                                            </h2>
                                                            <div className="w-16 h-1 bg-traian-gold mx-auto rounded-full mb-4"></div>
                                                            <p className="text-gray-500">
                                                                 Tarifele și
                                                                 disponibilitatea
                                                                 sunt
                                                                 actualizate în
                                                                 timp real.
                                                            </p>
                                                       </div>

                                                       {/* Layout GRID pentru Calendar (Stanga) si Controale (Dreapta) */}
                                                       <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-10 items-stretch">
                                                            {/* 1. Calendarul - Ocupa mai mult spatiu */}
                                                            <div className="xl:col-span-7 bg-gray-50 p-6 rounded-xl border border-gray-100 flex justify-center items-center">
                                                                 <DayPicker
                                                                      mode="range"
                                                                      selected={
                                                                           dateRange
                                                                      }
                                                                      onSelect={
                                                                           setDateRange
                                                                      }
                                                                      numberOfMonths={
                                                                           1
                                                                      }
                                                                      pagedNavigation
                                                                      locale={
                                                                           ro
                                                                      }
                                                                      min={1}
                                                                      disabled={{
                                                                           before: new Date(),
                                                                      }}
                                                                      className="m-0"
                                                                 />
                                                            </div>

                                                            {/* 2. Controalele (Oaspeti + Orar) - Aliniate in dreapta, aceeasi inaltime */}
                                                            <div className="xl:col-span-5 flex flex-col gap-6 h-full">
                                                                 {/* Card Oaspeti */}
                                                                 <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex-1 flex flex-col justify-center">
                                                                      <h3 className="font-serif text-lg font-bold text-traian-charcoal flex items-center gap-2 mb-4 pb-2 border-b border-gray-200/50">
                                                                           <UserPlus className="w-4 h-4 text-traian-burgundy" />{" "}
                                                                           Oaspeți
                                                                      </h3>
                                                                      <div className="space-y-1">
                                                                           <GuestCounter
                                                                                label="Adulți"
                                                                                value={
                                                                                     adults
                                                                                }
                                                                                onChange={
                                                                                     setAdults
                                                                                }
                                                                           />
                                                                           <GuestCounter
                                                                                label="Copii"
                                                                                value={
                                                                                     children
                                                                                }
                                                                                onChange={
                                                                                     setChildren
                                                                                }
                                                                                min={
                                                                                     0
                                                                                }
                                                                           />
                                                                      </div>
                                                                 </div>

                                                                 {/* Card Orar */}
                                                                 <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex-1 flex flex-col justify-center">
                                                                      <h3 className="font-serif text-lg font-bold text-traian-charcoal flex items-center gap-2 mb-4 pb-2 border-b border-gray-200/50">
                                                                           <Clock className="w-4 h-4 text-traian-burgundy" />{" "}
                                                                           Orar
                                                                           Cazare
                                                                      </h3>
                                                                      <div className="space-y-3">
                                                                           <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                                                                                <span className="text-gray-600 text-sm">
                                                                                     Check-in
                                                                                </span>
                                                                                <span className="font-bold text-traian-charcoal font-serif">
                                                                                     12:00
                                                                                </span>
                                                                           </div>
                                                                           <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                                                                                <span className="text-gray-600 text-sm">
                                                                                     Check-out
                                                                                </span>
                                                                                <span className="font-bold text-traian-charcoal font-serif">
                                                                                     12:00
                                                                                </span>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>

                                                       <div className="mt-8">
                                                            <Button
                                                                 onClick={
                                                                      handleCheckAvailability
                                                                 }
                                                                 disabled={
                                                                      !dateRange?.from ||
                                                                      !dateRange?.to ||
                                                                      loadingRooms
                                                                 }
                                                                 variant="primary"
                                                                 size="lg"
                                                                 className="w-full uppercase tracking-wider"
                                                            >
                                                                 {loadingRooms ? (
                                                                      <>
                                                                           <Sparkles className="animate-spin w-5 h-5 mr-2" />{" "}
                                                                           Se
                                                                           verifică...
                                                                      </>
                                                                 ) : (
                                                                      <>
                                                                           Verifică
                                                                           Disponibilitatea{" "}
                                                                           <ArrowRight className="w-5 h-5 ml-2" />
                                                                      </>
                                                                 )}
                                                            </Button>
                                                       </div>
                                                  </motion.div>
                                             )}

                                             {/* === PASUL 2: LISTA CAMERE === */}
                                             {step === 2 && (
                                                  <motion.div
                                                       key="step2"
                                                       variants={stepVariants}
                                                       initial="hidden"
                                                       animate="visible"
                                                       exit="exit"
                                                       className="p-6 lg:p-10 bg-gray-50/50"
                                                  >
                                                       <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                                            <div>
                                                                 <h2 className="font-serif text-xl font-bold text-traian-charcoal">
                                                                      Camere
                                                                      Disponibile
                                                                 </h2>
                                                                 <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                                                                      <CalendarDays className="w-4 h-4 text-traian-burgundy" />
                                                                      {dateRange?.from?.toLocaleDateString(
                                                                           "ro"
                                                                      )}{" "}
                                                                      -{" "}
                                                                      {dateRange?.to?.toLocaleDateString(
                                                                           "ro"
                                                                      )}
                                                                 </p>
                                                            </div>
                                                            <button
                                                                 onClick={() =>
                                                                      setStep(1)
                                                                 }
                                                                 className="text-sm font-bold text-traian-burgundy hover:text-traian-charcoal flex items-center gap-1 transition-colors px-4 py-2 hover:bg-traian-cream rounded-lg"
                                                            >
                                                                 <ChevronLeft className="w-4 h-4" />{" "}
                                                                 Modifică
                                                            </button>
                                                       </div>

                                                       <div className="space-y-6">
                                                            {rooms.map(
                                                                 (room) => {
                                                                      const availabilityInfo =
                                                                           availabilityData.find(
                                                                                (
                                                                                     a
                                                                                ) =>
                                                                                     a.room_type_id ===
                                                                                     room.id
                                                                           );
                                                                      const isAvailable =
                                                                           availabilityInfo &&
                                                                           availabilityInfo.available_count >
                                                                                0;
                                                                      const isSelected =
                                                                           selectedRoomId ===
                                                                           room.id;

                                                                      return (
                                                                           <div
                                                                                key={
                                                                                     room.id
                                                                                }
                                                                                onClick={() =>
                                                                                     isAvailable &&
                                                                                     (setSelectedRoomId(
                                                                                          room.id
                                                                                     ),
                                                                                     setStep(
                                                                                          3
                                                                                     ))
                                                                                }
                                                                                className={`
                                group relative bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-pointer
                                ${
                                     !isAvailable
                                          ? "opacity-60 grayscale cursor-not-allowed"
                                          : "hover:shadow-xl hover:-translate-y-1"
                                }
                                ${
                                     isSelected
                                          ? "ring-2 ring-traian-gold shadow-lg"
                                          : "shadow-sm border border-gray-100"
                                }
                              `}
                                                                           >
                                                                                <div className="flex flex-col md:flex-row h-full">
                                                                                     {/* Image Section */}
                                                                                     <div className="w-full md:w-72 h-64 md:h-auto relative overflow-hidden">
                                                                                          <Image
                                                                                               src={
                                                                                                    room
                                                                                                         .images[0]
                                                                                               }
                                                                                               alt={
                                                                                                    room.name
                                                                                               }
                                                                                               fill
                                                                                               className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                                                          />
                                                                                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                                                                          <div className="absolute bottom-3 left-3 flex gap-2">
                                                                                               <span className="bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-traian-charcoal shadow-sm uppercase tracking-wide">
                                                                                                    Max{" "}
                                                                                                    {
                                                                                                         room.capacity
                                                                                                    }{" "}
                                                                                                    Pers.
                                                                                               </span>
                                                                                          </div>
                                                                                     </div>

                                                                                     {/* Content Section */}
                                                                                     <div className="flex-1 p-6 flex flex-col justify-between">
                                                                                          <div>
                                                                                               <div className="flex justify-between items-start mb-2">
                                                                                                    <h4 className="font-serif text-2xl font-bold text-traian-charcoal group-hover:text-traian-burgundy transition-colors">
                                                                                                         {
                                                                                                              room.name
                                                                                                         }
                                                                                                    </h4>
                                                                                                    <div className="text-right">
                                                                                                         <span className="block text-2xl font-bold text-traian-burgundy font-serif">
                                                                                                              {room.price *
                                                                                                                   nights}{" "}
                                                                                                              <span className="text-sm font-sans font-normal text-gray-500">
                                                                                                                   RON
                                                                                                              </span>
                                                                                                         </span>
                                                                                                         <span className="text-xs text-gray-400 block mt-1">
                                                                                                              total
                                                                                                              pentru{" "}
                                                                                                              {
                                                                                                                   nights
                                                                                                              }{" "}
                                                                                                              {nights ===
                                                                                                              1
                                                                                                                   ? "noapte"
                                                                                                                   : "nopți"}
                                                                                                         </span>
                                                                                                    </div>
                                                                                               </div>
                                                                                               <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                                                                                    {
                                                                                                         room.description
                                                                                                    }
                                                                                               </p>

                                                                                               {/* Facilities */}
                                                                                               <div className="flex gap-4 text-xs font-medium text-gray-500 border-t border-gray-100 pt-4">
                                                                                                    <span className="flex items-center gap-1.5">
                                                                                                         <Wifi className="w-3.5 h-3.5 text-traian-gold" />{" "}
                                                                                                         WiFi
                                                                                                         Gratuit
                                                                                                    </span>
                                                                                                    <span className="flex items-center gap-1.5">
                                                                                                         <BedDouble className="w-3.5 h-3.5 text-traian-gold" />{" "}
                                                                                                         Pat
                                                                                                         King
                                                                                                    </span>
                                                                                                    <span className="flex items-center gap-1.5">
                                                                                                         <Coffee className="w-3.5 h-3.5 text-traian-gold" />{" "}
                                                                                                         Mic
                                                                                                         Dejun
                                                                                                    </span>
                                                                                               </div>
                                                                                          </div>

                                                                                          <div className="mt-6 flex justify-end">
                                                                                               {isAvailable ? (
                                                                                                    <Button
                                                                                                         variant="primary"
                                                                                                         size="sm"
                                                                                                         className="pointer-events-none"
                                                                                                    >
                                                                                                         Alege
                                                                                                         Camera{" "}
                                                                                                         <ArrowRight className="ml-2 w-4 h-4" />
                                                                                                    </Button>
                                                                                               ) : (
                                                                                                    <span className="text-red-500 font-bold text-sm uppercase flex items-center bg-red-50 px-3 py-1 rounded">
                                                                                                         Indisponibil
                                                                                                    </span>
                                                                                               )}
                                                                                          </div>
                                                                                     </div>
                                                                                </div>
                                                                           </div>
                                                                      );
                                                                 }
                                                            )}
                                                       </div>
                                                  </motion.div>
                                             )}

                                             {/* === PASUL 3: FORMULAR === */}
                                             {step === 3 && (
                                                  <motion.div
                                                       key="step3"
                                                       variants={stepVariants}
                                                       initial="hidden"
                                                       animate="visible"
                                                       exit="exit"
                                                       className="p-6 lg:p-12"
                                                  >
                                                       <div className="flex items-center mb-10 pb-6 border-b border-gray-100">
                                                            <button
                                                                 onClick={() =>
                                                                      setStep(2)
                                                                 }
                                                                 className="mr-6 text-gray-400 hover:text-traian-burgundy p-2 hover:bg-traian-cream rounded-full transition-colors"
                                                            >
                                                                 <ChevronLeft className="w-6 h-6" />
                                                            </button>
                                                            <div>
                                                                 <h2 className="font-serif text-3xl font-bold text-traian-charcoal">
                                                                      Finalizare
                                                                      Rezervare
                                                                 </h2>
                                                                 <p className="text-gray-500 text-sm mt-1">
                                                                      Completează
                                                                      datele
                                                                      pentru a
                                                                      confirma
                                                                      rezervarea.
                                                                 </p>
                                                            </div>
                                                       </div>

                                                       {/* Info Alert */}
                                                       <div className="bg-traian-cream border-l-4 border-traian-gold p-4 mb-8 flex gap-4 items-start">
                                                            <Info className="h-6 w-6 text-traian-burgundy mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                 <h4 className="text-sm font-bold text-traian-charcoal uppercase tracking-wide mb-1">
                                                                      Politica
                                                                      de Plată
                                                                 </h4>
                                                                 <p className="text-sm text-gray-600 leading-relaxed">
                                                                      Se percepe
                                                                      un avans
                                                                      de{" "}
                                                                      <strong>
                                                                           50%
                                                                      </strong>
                                                                      .
                                                                      Diferența
                                                                      se achită
                                                                      la
                                                                      recepție
                                                                      la
                                                                      momentul
                                                                      sosirii.
                                                                      Veți primi
                                                                      instrucțiunile
                                                                      de plată
                                                                      pe email.
                                                                 </p>
                                                            </div>
                                                       </div>

                                                       <form
                                                            action={formAction}
                                                            className="space-y-8"
                                                       >
                                                            {/* Hidden Inputs */}
                                                            <input
                                                                 type="hidden"
                                                                 name="checkIn"
                                                                 value={dateRange!.from!.toISOString()}
                                                            />
                                                            <input
                                                                 type="hidden"
                                                                 name="checkOut"
                                                                 value={dateRange!.to!.toISOString()}
                                                            />
                                                            <input
                                                                 type="hidden"
                                                                 name="roomTypeId"
                                                                 value={
                                                                      selectedRoomId!
                                                                 }
                                                            />
                                                            <input
                                                                 type="hidden"
                                                                 name="adults"
                                                                 value={adults}
                                                            />
                                                            <input
                                                                 type="hidden"
                                                                 name="children"
                                                                 value={
                                                                      children
                                                                 }
                                                            />

                                                            <div className="space-y-8">
                                                                 <FormInput
                                                                      id="guestName"
                                                                      label="Nume și Prenume"
                                                                      error={
                                                                           state
                                                                                ?.error
                                                                                ?.guestName
                                                                      }
                                                                 />
                                                                 <div className="grid md:grid-cols-2 gap-8">
                                                                      <FormInput
                                                                           id="guestPhone"
                                                                           label="Număr Telefon"
                                                                           type="tel"
                                                                           error={
                                                                                state
                                                                                     ?.error
                                                                                     ?.guestPhone
                                                                           }
                                                                      />
                                                                      <FormInput
                                                                           id="guestEmail"
                                                                           label="Adresă Email"
                                                                           type="email"
                                                                           error={
                                                                                state
                                                                                     ?.error
                                                                                     ?.guestEmail
                                                                           }
                                                                      />
                                                                 </div>
                                                                 <FormTextarea
                                                                      id="specialRequests"
                                                                      label="Cereri Speciale (Opțional)"
                                                                 />
                                                            </div>

                                                            {/* Turnstile */}
                                                            <div className="flex flex-col items-center gap-2 pt-4">
                                                                 <div
                                                                      className="cf-turnstile"
                                                                      data-sitekey={
                                                                           process
                                                                                .env
                                                                                .NEXT_PUBLIC_TURNSTILE_SITE_KEY
                                                                      }
                                                                 ></div>
                                                                 {state?.error
                                                                      ?.turnstileToken && (
                                                                      <p className="text-red-500 text-xs">
                                                                           {
                                                                                state
                                                                                     .error
                                                                                     .turnstileToken
                                                                           }
                                                                      </p>
                                                                 )}
                                                            </div>

                                                            <div className="hidden lg:block pt-6">
                                                                 <SubmitButton />
                                                            </div>
                                                            {/* Mobile Button Sticky */}
                                                            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] border-t border-gray-100 z-50">
                                                                 <SubmitButton />
                                                            </div>
                                                       </form>
                                                  </motion.div>
                                             )}
                                        </AnimatePresence>
                                   </motion.div>
                              </div>

                              {/* --- RIGHT COLUMN (SUMMARY STICKY) --- */}
                              <div className="lg:col-span-4 relative ">
                                   <div className="sticky top-8 space-y-6">
                                        {/* Card Sumar - Design Premium */}
                                        <motion.div
                                             className="bg-traian-charcoal text-white rounded-2xl p-8 shadow-2xl border-t-4 border-traian-gold overflow-hidden relative"
                                             initial="hidden"
                                             animate="visible"
                                             variants={fadeIn(0.4)}
                                        >
                                             {/* Pattern Decorativ */}
                                             <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>

                                             <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4 relative z-10">
                                                  <h3 className="font-serif text-2xl font-bold text-traian-gold flex items-center gap-3">
                                                       <ShieldCheck className="w-6 h-6" />{" "}
                                                       Sumar Sejur
                                                  </h3>
                                             </div>

                                             <div className="space-y-6 relative z-10 text-sm font-light tracking-wide">
                                                  {/* Date */}
                                                  <div className="flex justify-between items-start">
                                                       <div className="text-gray-400 uppercase text-xs font-bold tracking-widest mt-1">
                                                            Perioada
                                                       </div>
                                                       <div className="text-right">
                                                            <div className="font-medium text-lg">
                                                                 {dateRange?.from
                                                                      ? dateRange.from.toLocaleDateString(
                                                                             "ro"
                                                                        )
                                                                      : "..."}
                                                            </div>
                                                            <div className="text-gray-500 text-xs my-1">
                                                                 până la
                                                            </div>
                                                            <div className="font-medium text-lg">
                                                                 {dateRange?.to
                                                                      ? dateRange.to.toLocaleDateString(
                                                                             "ro"
                                                                        )
                                                                      : "..."}
                                                            </div>
                                                       </div>
                                                  </div>

                                                  <div className="h-px bg-white/10 w-full"></div>

                                                  {/* Durata */}
                                                  <div className="flex justify-between items-center">
                                                       <div className="text-gray-400 uppercase text-xs font-bold tracking-widest">
                                                            Durată
                                                       </div>
                                                       <div className="font-bold text-xl text-traian-cream font-serif">
                                                            {nights}{" "}
                                                            {nights === 1
                                                                 ? "Noapte"
                                                                 : "Nopți"}
                                                       </div>
                                                  </div>

                                                  {/* Camera Selectată */}
                                                  {selectedRoom && (
                                                       <div className="bg-white/5 rounded-lg p-4 mt-2 border border-white/10 animate-fade-in">
                                                            <div className="text-traian-gold text-xs uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                                                                 <CheckCircle2 className="w-3 h-3" />{" "}
                                                                 Camera
                                                                 Selectată
                                                            </div>
                                                            <div className="font-serif text-xl leading-tight text-white mb-2">
                                                                 {
                                                                      selectedRoom.name
                                                                 }
                                                            </div>
                                                            <div className="text-gray-400 text-xs flex gap-2">
                                                                 <span>
                                                                      {adults}{" "}
                                                                      Adulți
                                                                 </span>{" "}
                                                                 &bull;{" "}
                                                                 <span>
                                                                      {children}{" "}
                                                                      Copii
                                                                 </span>
                                                            </div>
                                                       </div>
                                                  )}

                                                  {/* Total Pret */}
                                                  {nights > 0 &&
                                                  selectedRoom ? (
                                                       <div className="mt-8 pt-6 border-t border-white/20">
                                                            <div className="flex justify-between items-end mb-2">
                                                                 <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">
                                                                      Total
                                                                      Estimativ
                                                                 </span>
                                                                 <span className="text-2xl font-bold text-white font-serif">
                                                                      {selectedRoom.price *
                                                                           nights}{" "}
                                                                      RON
                                                                 </span>
                                                            </div>

                                                            <div className="bg-gradient-to-r from-traian-gold to-yellow-600 text-traian-charcoal rounded-lg p-4 mt-4 text-center shadow-lg transform scale-105">
                                                                 <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
                                                                      Avans
                                                                      Necesar
                                                                      (50%)
                                                                 </p>
                                                                 <p className="text-3xl font-serif font-bold">
                                                                      {Math.round(
                                                                           selectedRoom.price *
                                                                                nights *
                                                                                0.5
                                                                      )}{" "}
                                                                      RON
                                                                 </p>
                                                            </div>
                                                       </div>
                                                  ) : (
                                                       <div className="mt-8 pt-6 border-t border-white/10 text-center text-gray-500 italic text-sm">
                                                            {step === 1
                                                                 ? "Selectează perioada pentru calcul"
                                                                 : "Alege o cameră pentru total"}
                                                       </div>
                                                  )}
                                             </div>
                                        </motion.div>

                                        {/* Card Suport - Stil Clean */}
                                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-traian-gold/10 hidden lg:block text-center">
                                             <h4 className="font-serif text-lg font-bold text-traian-charcoal mb-2">
                                                  Ai nevoie de ajutor?
                                             </h4>
                                             <p className="text-sm text-gray-500 mb-4 px-4">
                                                  Pentru grupuri mari sau cereri
                                                  speciale, contactează direct
                                                  recepția.
                                             </p>
                                             <a
                                                  href="tel:+40268333065"
                                                  className="inline-block text-traian-burgundy font-bold text-lg hover:underline decoration-2 underline-offset-4"
                                             >
                                                  +40 746 332 414
                                             </a>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </section>
          </div>
     );
}
