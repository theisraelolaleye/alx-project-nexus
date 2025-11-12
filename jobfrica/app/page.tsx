import { Navbar } from "@/components/layout/landingpage/Navbar";
import { Hero } from "@/components/layout/landingpage/Hero";
import { Categories } from "@/components/layout/landingpage/Categories";
import { FeaturedJobs } from "@/components/layout/landingpage/FeaturedJobs";
import { HowItWorks } from "@/components/layout/landingpage/HowItWorks";
import { CTASection } from "@/components/layout/landingpage/CTASection";
import { Footer } from "@/components/layout/landingpage/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedJobs />
      <HowItWorks />
      <CTASection />
      <Footer />
    </main>
  );
}
