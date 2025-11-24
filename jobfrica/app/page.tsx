// import { Navbar } from "@/components/common";
import { Hero } from "@/components/landingpage/Hero";
import { Categories } from "@/components/landingpage/Categories";
import { FeaturedJobs } from "@/components/landingpage/FeaturedJobs";
import { HowItWorks } from "@/components/landingpage/HowItWorks";
import { CTASection } from "@/components/landingpage/CTASection";
import { Footer } from "@/components/common";

export default function Home() {
  return (
    <main className="min-h-screen">

      <Hero />
      <Categories />
      <FeaturedJobs />
      <HowItWorks />
      <CTASection />

    </main>
  );
}
