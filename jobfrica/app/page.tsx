'use client';
// import { Navbar } from "@/components/common";
import { Hero } from "@/components/landingpage/Hero";
import { Categories } from "@/components/landingpage/Categories";
import { FeaturedJobs } from "@/components/landingpage/FeaturedJobs";
import { HowItWorks } from "@/components/landingpage/HowItWorks";
import { CTASection } from "@/components/landingpage/CTASection";
import { Footer } from "@/components/common";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    console.log('Health check ping to backend API');
    fetch(process.env.NEXT_PUBLIC_API_URL + '/health/')
    console.log('Health check ping sent');
  }, []);


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
