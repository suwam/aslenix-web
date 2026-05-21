import { Suspense, lazy, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { DeferredSection } from "@/components/DeferredSection";

const SiteAnnouncement = lazy(() => import("@/components/SiteAnnouncement").then((module) => ({ default: module.SiteAnnouncement })));
const TrustedBy = lazy(() => import("@/components/sections/TrustedBy").then((module) => ({ default: module.TrustedBy })));
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
  const [loadAnnouncements, setLoadAnnouncements] = useState(false);

  useEffect(() => {
    const scheduleIdle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 1600));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const id = scheduleIdle(() => setLoadAnnouncements(true));
    return () => cancelIdle(id as never);
  }, []);

  useEffect(() => {
    const isOpen = showPrivacy || showTerms;
    document.body.style.overflow = isOpen ? "hidden" : "visible";
    return () => {
      document.body.style.overflow = "visible";
    };
  }, [showPrivacy, showTerms]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Suspense fallback={null}>
        {loadAnnouncements && <SiteAnnouncement />}
      </Suspense>
      <Navbar />
      <main>
        <Hero />
        <DeferredSection minHeight="min-h-28" rootMargin="200px 0px">
          <Suspense fallback={<SectionFallback />}>
            <TrustedBy />
          </Suspense>
        </DeferredSection>
        <DeferredSection>
          <Suspense fallback={<SectionFallback />}>
            <About />
          </Suspense>
        </DeferredSection>
        <DeferredSection>
          <Suspense fallback={<SectionFallback />}>
            <Services />
          </Suspense>
        </DeferredSection>
        <DeferredSection>
          <Suspense fallback={<SectionFallback />}>
            <Projects />
          </Suspense>
        </DeferredSection>
        <DeferredSection>
          <Suspense fallback={<SectionFallback />}>
            <WhyUs />
          </Suspense>
        </DeferredSection>
        <DeferredSection>
          <Suspense fallback={<SectionFallback />}>
            <Testimonials />
          </Suspense>
        </DeferredSection>
        <DeferredSection>
          <Suspense fallback={<SectionFallback />}>
            <Blog />
          </Suspense>
        </DeferredSection>
        <DeferredSection>
          <Suspense fallback={<SectionFallback />}>
            <Contact />
          </Suspense>
        </DeferredSection>
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
