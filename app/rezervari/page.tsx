import BookingWizard from "@/components/pages/BookingWizard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
     title: "Rezervări Online | Hotel Traian",
     description:
          "Rezervă rapid o cameră la Hotel Traian. Verifică disponibilitatea în timp real.",
};

export default function BookingPage() {
     return (
          <>
               <Header />
               <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
                    <div className="container mx-auto">
                         <div className="text-center mb-10">
                              <h1 className="text-4xl font-serif text-primary-900 mb-4">
                                   Rezervă Sejurul Tău
                              </h1>
                              <p className="text-gray-600 max-w-2xl mx-auto">
                                   Folosește formularul de mai jos pentru a
                                   verifica disponibilitatea și a rezerva
                                   instant. Garantăm cel mai bun tarif pentru
                                   rezervările directe.
                              </p>
                         </div>

                         <BookingWizard />
                    </div>
               </main>
               <Footer />
          </>
     );
}
