import { Suspense, lazy, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SiteAnnouncement } from "@/components/SiteAnnouncement";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { DeferredSection } from "@/components/DeferredSection";

const About = lazy(() => import("@/components/sections/About").then((module) => ({ default: module.About })));
const Services = lazy(() => import("@/components/sections/Services").then((module) => ({ default: module.Services })));
const Projects = lazy(() => import("@/components/sections/Projects").then((module) => ({ default: module.Projects })));
const WhyUs = lazy(() => import("@/components/sections/WhyUs").then((module) => ({ default: module.WhyUs })));
const Testimonials = lazy(() => import("@/components/sections/Testimonials").then((module) => ({ default: module.Testimonials })));
const Blog = lazy(() => import("@/components/sections/Blog").then((module) => ({ default: module.Blog })));
const Contact = lazy(() => import("@/components/sections/Contact").then((module) => ({ default: module.Contact })));
const PrivacyModal = lazy(() => import("@/components/PrivacyModal").then((module) => ({ default: module.PrivacyModal })));
const TermsModal = lazy(() => import("@/components/TermsModal").then((module) => ({ default: module.TermsModal })));

const SectionFallback = () => <div className="min-h-32" aria-hidden="true" />;

const Index = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const isOpen = showPrivacy || showTerms;
    document.body.style.overflow = isOpen ? "hidden" : "visible";
    return () => {
      document.body.style.overflow = "visible";
    };
  }, [showPrivacy, showTerms]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteAnnouncement />
      <Navbar />
      <main>
        <Hero />
        <DeferredSection minHeight="min-h-28" rootMargin="500px 0px">
          <TrustedBy />
        </DeferredSection>
        <Suspense fallback={<SectionFallback />}>
          <DeferredSection>
            <About />
          </DeferredSection>
          <DeferredSection>
            <Services />
          </DeferredSection>
          <DeferredSection>
            <Projects />
          </DeferredSection>
          <DeferredSection>
            <WhyUs />
          </DeferredSection>
          <DeferredSection>
            <Testimonials />
          </DeferredSection>
          <DeferredSection>
            <Blog />
          </DeferredSection>
          <DeferredSection>
            <Contact />
          </DeferredSection>
        </Suspense>
      </main>
      <Footer onOpenPrivacy={() => setShowPrivacy(true)} onOpenTerms={() => setShowTerms(true)} />
      <Suspense fallback={null}>
        {showPrivacy && <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />}
        {showTerms && <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />}
      </Suspense>
      <WhatsAppButton />
    </div>
  );
};

export default Index;
