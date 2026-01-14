"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Home, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button"; // Asigură-te că importul e corect
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
     const searchParams = useSearchParams();
     const sessionId = searchParams.get("session_id");

     // Opțional: Poți curăța coșul sau starea aici, dacă foloseai Context API

     return (
          <div className="min-h-screen bg-traian-cream flex items-center justify-center p-4">
               <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden text-center relative"
               >
                    {/* Decorativ: Bandă aurie sus */}
                    <div className="h-2 bg-traian-gold w-full"></div>

                    <div className="p-10 md:p-16 space-y-8">
                         {/* Iconiță animată */}
                         <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                   delay: 0.3,
                                   type: "spring",
                                   stiffness: 200,
                              }}
                              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                         >
                              <CheckCircle2 className="w-12 h-12 text-green-600" />
                         </motion.div>

                         <div className="space-y-4">
                              <h1 className="font-serif text-4xl font-bold text-traian-charcoal">
                                   Rezervare Confirmată!
                              </h1>
                              <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
                                   Vă mulțumim că ați ales Hotel Traian. Plata a
                                   fost procesată cu succes și am trimis
                                   detaliile rezervării pe adresa dumneavoastră
                                   de email.
                              </p>
                         </div>

                         {/* Detalii (Opțional, doar vizual) */}
                         <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 max-w-sm mx-auto">
                              <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-2">
                                   Referință Plată
                              </p>
                              <p className="text-xs text-gray-600 font-mono break-all">
                                   {sessionId ||
                                        "Procesată securizat prin Stripe"}
                              </p>
                         </div>

                         <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                              <Link href="/">
                                   <Button variant="primary" size="lg">
                                        <Home className="w-4 h-4 mr-2" />
                                        Înapoi Acasă
                                   </Button>
                              </Link>

                              <Link href="/contact">
                                   <Button variant="outline" size="lg">
                                        Contactează Recepția
                                   </Button>
                              </Link>
                         </div>
                    </div>

                    {/* Footer Card */}
                    <div className="bg-traian-charcoal py-4 text-center">
                         <p className="text-white/60 text-sm flex items-center justify-center gap-2">
                              <CalendarDays className="w-4 h-4" />
                              Vă așteptăm cu drag!
                         </p>
                    </div>
               </motion.div>
          </div>
     );
}
