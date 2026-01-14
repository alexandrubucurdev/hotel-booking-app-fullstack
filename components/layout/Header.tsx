"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
     Menu,
     X,
     Phone,
     Mail,
     Home,
     BedDouble,
     Image as ImageIcon,
     Info,
     MapPin,
     FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Button from "@/components/ui/Button";

const navigation = [
     { name: "Acasă", href: "/", icon: Home },
     { name: "Camere", href: "/camere", icon: BedDouble },
     { name: "Galerie", href: "/galerie", icon: ImageIcon },
     { name: "Despre Noi", href: "/despre", icon: Info },
     { name: "Locația", href: "/locatie", icon: MapPin },
     { name: "Convocator Acționari", href: "/actionari", icon: FileText },
     { name: "Contact", href: "/contact", icon: Phone },
];

const mobileMenuVariants = {
     hidden: {
          opacity: 0,
          height: 0,
          transition: { duration: 0.3, ease: "easeInOut" },
     },
     visible: {
          opacity: 1,
          height: "auto",
          transition: { duration: 0.3, ease: "easeInOut" },
     },
};

const MD_BREAKPOINT = 768;

export default function Header() {
     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
     const [isScrolled, setIsScrolled] = useState(false);
     const [isVisible, setIsVisible] = useState(true);
     const [lastScrollY, setLastScrollY] = useState(0);
     const pathname = usePathname();

     const headerRef = useRef(null);
     const [headerHeight, setHeaderHeight] = useState(0);

     const [isMediumOrLarger, setIsMediumOrLarger] = useState(false);

     useEffect(() => {
          const checkScreenSize = () => {
               setIsMediumOrLarger(window.innerWidth >= MD_BREAKPOINT);
          };
          checkScreenSize();
          window.addEventListener("resize", checkScreenSize);
          return () => window.removeEventListener("resize", checkScreenSize);
     }, []);

     useEffect(() => {
          if (mobileMenuOpen) {
               document.body.style.overflow = "hidden";
          } else {
               document.body.style.overflow = "";
          }
          return () => {
               document.body.style.overflow = "";
          };
     }, [mobileMenuOpen]);

     useEffect(() => {
          const handleScroll = () => {
               const currentScrollY = window.scrollY;
               setIsScrolled(currentScrollY > 10);

               if (currentScrollY < lastScrollY || currentScrollY < 100) {
                    setIsVisible(true);
               } else if (
                    currentScrollY > lastScrollY &&
                    currentScrollY > 100 &&
                    !mobileMenuOpen
               ) {
                    setIsVisible(false);
                    setMobileMenuOpen(false);
               }
               setLastScrollY(currentScrollY);
          };

          window.addEventListener("scroll", handleScroll);
          return () => window.removeEventListener("scroll", handleScroll);
     }, [lastScrollY, mobileMenuOpen]);

     useEffect(() => {
          const timer = setTimeout(() => {
               if (isVisible && headerRef.current) {
                    setHeaderHeight(headerRef.current.offsetHeight);
               }
          }, 350);

          return () => clearTimeout(timer);
     }, [isScrolled, isVisible, pathname, isMediumOrLarger]);

     const headerVariants = {
          visible: { y: 0 },
          hidden: { y: "-100%" },
     };

     return (
          <>
               <motion.div
                    className="fixed top-0 left-0 right-0 z-50"
                    variants={headerVariants}
                    animate={isVisible ? "visible" : "hidden"}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
               >
                    <div ref={headerRef}>
                         {/* Bara gri de contact */}
                         <AnimatePresence>
                              {!isScrolled && isMediumOrLarger && (
                                   <motion.div
                                        className="bg-traian-charcoal text-white overflow-hidden"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                             duration: 0.3,
                                             ease: "easeInOut",
                                        }}
                                   >
                                        <div className="py-2">
                                             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                                  <div className="flex justify-between items-center text-sm">
                                                       <div className="flex items-center space-x-6">
                                                            {/* Telefon Header */}
                                                            <div className="flex items-center space-x-2">
                                                                 <Phone className="h-4 w-4" />
                                                                 <div className="flex items-center space-x-2">
                                                                      <a
                                                                           href="tel:+40268333065"
                                                                           className="hover:text-traian-gold transition-colors"
                                                                      >
                                                                           +40
                                                                           268
                                                                           333
                                                                           065
                                                                      </a>
                                                                      <span className="text-gray-500">
                                                                           /
                                                                      </span>
                                                                      <a
                                                                           href="tel:+40746332414"
                                                                           className="hover:text-traian-gold transition-colors"
                                                                      >
                                                                           +40
                                                                           746
                                                                           332
                                                                           414
                                                                      </a>
                                                                 </div>
                                                            </div>

                                                            {/* Email */}
                                                            <a
                                                                 href="mailto:hoteltraianbrasov@gmail.com"
                                                                 className="flex items-center space-x-2 hover:text-traian-gold transition-colors"
                                                            >
                                                                 <Mail className="h-4 w-4" />
                                                                 <span className="break-all">
                                                                      hoteltraianbrasov@gmail.com
                                                                 </span>
                                                            </a>
                                                       </div>
                                                       <div className="text-traian-gold">
                                                            Str. Lunii nr. 7,
                                                            Brașov
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </motion.div>
                              )}
                         </AnimatePresence>

                         {/* Header-ul principal */}
                         <header
                              className={`w-full transition-colors duration-300 ${
                                   isScrolled
                                        ? "bg-white/95 backdrop-blur-xl border-b border-gray-100"
                                        : "bg-white/90 backdrop-blur-sm"
                              } ${
                                   isScrolled && !mobileMenuOpen
                                        ? "shadow-2xl"
                                        : ""
                              }`}
                         >
                              <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                   <div
                                        className={`flex justify-between items-center transition-all duration-300 ${
                                             isScrolled ? "py-3" : "py-4"
                                        }`}
                                   >
                                        {/* Logo */}
                                        <div className="flex-shrink-0">
                                             <Link href="/">
                                                  <div
                                                       className={`transition-all duration-300 ${
                                                            isScrolled
                                                                 ? "scale-90"
                                                                 : "scale-100"
                                                       }`}
                                                  >
                                                       <Image
                                                            src="/logo/logo.svg"
                                                            alt="Logo"
                                                            width={150}
                                                            height={40}
                                                            className={`w-auto transition-all duration-300 ${
                                                                 isScrolled
                                                                      ? "h-10"
                                                                      : "h-12"
                                                            }`}
                                                       />
                                                  </div>
                                             </Link>
                                        </div>

                                        {/* Navigație Desktop */}
                                        <div className="hidden text-center px-8 lg:block">
                                             <div
                                                  className={`flex items-center transition-all duration-300 ${
                                                       isScrolled
                                                            ? "space-x-6"
                                                            : "space-x-8"
                                                  }`}
                                             >
                                                  {navigation.map((item) => {
                                                       const isActive =
                                                            pathname ===
                                                            item.href;
                                                       return (
                                                            <Link
                                                                 key={item.name}
                                                                 href={
                                                                      item.href
                                                                 }
                                                                 className={`group flex items-center space-x-1 font-medium transition-all duration-200 relative ${
                                                                      isScrolled
                                                                           ? "text-sm"
                                                                           : "text-base"
                                                                 } ${
                                                                      isActive
                                                                           ? "text-traian-burgundy"
                                                                           : "text-traian-charcoal hover:text-traian-burgundy"
                                                                 }`}
                                                            >
                                                                 {item.name}
                                                                 <span
                                                                      className={`absolute -bottom-1 left-0 h-0.5 bg-traian-burgundy transition-all duration-300 ${
                                                                           isActive
                                                                                ? "w-full"
                                                                                : "w-0 group-hover:w-full"
                                                                      }`}
                                                                 ></span>
                                                            </Link>
                                                       );
                                                  })}
                                                  <a
                                                       href="/rezervari"
                                                       className={`bg-traian-burgundy text-white rounded-lg hover:bg-traian-burgundy/90 transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg ${
                                                            isScrolled
                                                                 ? "px-4 py-1.5 text-sm"
                                                                 : "px-6 py-2 text-base"
                                                       }`}
                                                  >
                                                       Rezervă Acum
                                                  </a>
                                             </div>
                                        </div>

                                        {/* Buton Meniu Mobil */}
                                        <div className="lg:hidden">
                                             <button
                                                  type="button"
                                                  className="text-traian-charcoal hover:text-traian-burgundy transition-all duration-200 hover:scale-110"
                                                  onClick={() =>
                                                       setMobileMenuOpen(
                                                            !mobileMenuOpen
                                                       )
                                                  }
                                                  aria-expanded={mobileMenuOpen}
                                                  aria-controls="mobile-menu-panel"
                                             >
                                                  <span className="sr-only">
                                                       Open main menu
                                                  </span>
                                                  {mobileMenuOpen ? (
                                                       <X
                                                            className={`transition-all duration-200 ${
                                                                 isScrolled
                                                                      ? "h-5 w-5"
                                                                      : "h-6 w-6"
                                                            }`}
                                                            aria-hidden="true"
                                                       />
                                                  ) : (
                                                       <Menu
                                                            className={`transition-all duration-200 ${
                                                                 isScrolled
                                                                      ? "h-5 w-5"
                                                                      : "h-6 w-6"
                                                            }`}
                                                            aria-hidden="true"
                                                       />
                                                  )}
                                             </button>
                                        </div>
                                   </div>
                              </nav>
                         </header>
                    </div>

                    {/* --- Meniul Mobil --- */}
                    <AnimatePresence>
                         {mobileMenuOpen && (
                              <motion.div
                                   id="mobile-menu-panel"
                                   className="lg:hidden bg-white border-t border-gray-200 overflow-hidden"
                                   initial="hidden"
                                   animate="visible"
                                   exit="hidden"
                                   variants={mobileMenuVariants}
                              >
                                   <div className="space-y-1 px-2 pb-3 pt-2">
                                        {navigation.map((item, index) => {
                                             const isActive =
                                                  pathname === item.href;
                                             const Icon = item.icon;
                                             return (
                                                  <Link
                                                       key={item.name}
                                                       href={item.href}
                                                       className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-all duration-200 transform hover:translate-x-2 ${
                                                            isActive
                                                                 ? "bg-gray-100 text-traian-burgundy"
                                                                 : "text-traian-charcoal hover:text-traian-burgundy hover:bg-gray-50"
                                                       } ${
                                                            mobileMenuOpen
                                                                 ? "opacity-100 translate-x-0"
                                                                 : "opacity-0 -translate-x-4"
                                                       }`}
                                                       style={{
                                                            transitionDelay:
                                                                 mobileMenuOpen
                                                                      ? `${
                                                                             index *
                                                                             50
                                                                        }ms`
                                                                      : "0ms",
                                                       }}
                                                       onClick={() =>
                                                            setMobileMenuOpen(
                                                                 false
                                                            )
                                                       }
                                                  >
                                                       <Icon className="w-5 h-5 mr-3" />
                                                       {item.name}
                                                  </Link>
                                             );
                                        })}
                                        <div
                                             className={`pt-4 transition-all duration-300 ${
                                                  mobileMenuOpen
                                                       ? "opacity-100 translate-y-0"
                                                       : "opacity-0 translate-y-4"
                                             }`}
                                             style={{
                                                  transitionDelay:
                                                       mobileMenuOpen
                                                            ? "300ms"
                                                            : "0ms",
                                             }}
                                        >
                                             <a
                                                  href="/rezervari"
                                                  className="hidden md:block w-full text-center bg-traian-burgundy text-white px-6 py-3 rounded-lg font-medium hover:bg-traian-burgundy/90 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                                  onClick={() =>
                                                       setMobileMenuOpen(false)
                                                  }
                                             >
                                                  Rezervă Acum
                                             </a>
                                             <a
                                                  href="/rezervari"
                                                  className="block md:hidden w-full text-center bg-traian-burgundy text-white px-6 py-3 rounded-lg font-medium hover:bg-traian-burgundy/90 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                                  onClick={() =>
                                                       setMobileMenuOpen(false)
                                                  }
                                             >
                                                  Rezervă Acum
                                             </a>
                                             <div
                                                  className={`pt-4 border-t border-gray-200 mt-4 transition-all duration-300 ${
                                                       mobileMenuOpen
                                                            ? "opacity-100 translate-y-0"
                                                            : "opacity-0 translate-y-4"
                                                  }`}
                                                  style={{
                                                       transitionDelay:
                                                            mobileMenuOpen
                                                                 ? "400ms"
                                                                 : "0ms",
                                                  }}
                                             >
                                                  <div className="flex flex-col space-y-2 text-sm text-gray-600">
                                                       {/* Telefon Mobil - Rămâne vertical pentru spațiu */}
                                                       <div className="flex items-start space-x-2">
                                                            <Phone className="h-4 w-4 mt-1" />
                                                            <div className="flex flex-col">
                                                                 <a href="tel:+40268333065">
                                                                      +40 268
                                                                      333 065
                                                                 </a>
                                                                 <a href="tel:+40746332414">
                                                                      +40 746
                                                                      332 414
                                                                 </a>
                                                            </div>
                                                       </div>

                                                       <a
                                                            href="mailto:hoteltraianbrasov@gmail.com"
                                                            className="flex items-center space-x-2"
                                                       >
                                                            <Mail className="h-4 w-4" />
                                                            <span className="break-all">
                                                                 hoteltraianbrasov@gmail.com
                                                            </span>
                                                       </a>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </motion.div>
                         )}
                    </AnimatePresence>
               </motion.div>

               {/* Spacer-ul dinamic */}
               <motion.div
                    animate={{ height: headerHeight }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
               />
          </>
     );
}
