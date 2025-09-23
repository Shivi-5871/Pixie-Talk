
import { HeroSection } from "@/components/hero-section";
import { FeatureSection } from "@/components/feature-section";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DashboardHeader } from "@/components/dashboard/header";
import { getSession } from "@/lib/auth";
import { DevtoolsRemover } from "@/components/devtools-remover";

export default async function Home() {
  const session = await getSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <DevtoolsRemover />
      {/* Key forces re-render when auth changes */}
      <div key={isLoggedIn ? 'logged-in' : 'logged-out'}>
        {isLoggedIn ? <DashboardHeader /> : <Navbar />}
      </div>
      <main>
        <HeroSection />
        <FeatureSection />
      </main>
      <Footer />
    </div>
  );
}