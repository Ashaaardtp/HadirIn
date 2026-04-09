import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero";
import Alur from "@/components/Alur";
import Keunggulan from "@/components/Keunggulan";
import Bantuan from "@/components/Bantuan";
import Footer from "@/components/Footer";
import BackgroundSection from "@/components/BackgroundSection";

export default function Home() {
  return (
    <>
    <Navbar />

      <Hero />
      <Alur />
      <Keunggulan />
      <Bantuan />
      <Footer />
      <BackgroundSection />
    </>
  );
}
