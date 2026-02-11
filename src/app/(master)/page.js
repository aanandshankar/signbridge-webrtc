import ProcessSection from "@/components/custom/Home/ProcessSection";
import FeaturesGrid from "@/components/custom/Home/FeaturesGrid";
import CTASection from "@/components/custom/Home/CTASection";
import HeroSection from "@/components/custom/Home/HeroSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProcessSection />
      <FeaturesGrid />
      <CTASection />
    </main>
  );
}
