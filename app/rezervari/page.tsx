import { Metadata } from "next";
import BookingWizard from "@/components/pages/BookingWizard";

export const metadata: Metadata = {
     title: "Rezervări Online", // Se va completa automat cu template-ul din layout.tsx (ex: | Hotel Traian Brașov)
     description:
          "Rezervă sejurul tău la Hotel Traian Brașov. Verifică disponibilitatea în timp real, alege camera preferată și plătește securizat avansul.",
     openGraph: {
          title: "Rezervări Online | Hotel Traian Brașov",
          description: "Garantăm cel mai bun tarif pentru rezervările directe.",
          url: "https://www.hotelultraian.ro/rezervari",
          siteName: "Hotel Traian Brașov",
          locale: "ro_RO",
          type: "website",
     },
};

export default function BookingPage() {
     return <BookingWizard />;
}
