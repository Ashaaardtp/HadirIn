import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Alur from "@/components/Alur";
import Keunggulan from "@/components/Keunggulan";
import Bantuan from "@/components/Bantuan";
import Footer from "@/components/Footer";
import BackgroundSection from "@/components/BackgroundSection";
import AuthRequiredPopup from "@/components/AuthRequiredPopup";

export default function Home() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <AuthRequiredPopup />
      </Suspense>
      <Hero />
      <Alur />
      <Keunggulan />
      <Bantuan />
      <Footer />
      <BackgroundSection />
    </>
  );
}
