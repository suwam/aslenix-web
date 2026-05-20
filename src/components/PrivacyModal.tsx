import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
}

const content = [
  {
    title: "Introduction",
    text: "ASLENIX values your privacy. This policy explains how we collect, use, and protect your personal information when you interact with our website and services.",
  },
  {
    title: "Information Collection",
    text: "We collect information you provide directly, such as email addresses and project details, plus technical data from website usage to improve platform performance and deliver a premium experience.",
  },
  {
    title: "Cookies",
    text: "Cookies and similar technologies help us remember your preferences, analyze site traffic, and deliver a smoother, more personalized browsing experience.",
  },
  {
    title: "Security",
    text: "We protect your information with industry-standard safeguards, secure hosting, and encryption, while continuously refining our systems to keep data safe.",
  },
  {
    title: "Third-Party Services",
    text: "We may share data with trusted service providers who support our website and analytics, but we do not sell your personal information to third parties.",
  },
  {
    title: "User Rights",
    text: "You can request access, correction, or deletion of your personal data, and opt out of marketing communications to maintain control over your information.",
  },
  {
    title: "Contact",
    text: "For questions about this policy, email info.aslenix.np@gmail.com and our team will respond with clarity and care.",
  },
];

export const PrivacyModal = ({ open, onClose }: PrivacyModalProps) => {
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Privacy Policy"
        >
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-xl"
            onClick={handleOverlayClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative z-10 w-full max-w-[900px] h-[85vh] overflow-hidden rounded-[2rem] border border-white/10 bg-[#090b18]/95 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-[30px]"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,45,85,0.16),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.12),transparent_40%)] opacity-90 pointer-events-none" />
            <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[#ff2d92]/20 blur-3xl" />
            <div className="absolute left-8 bottom-10 h-24 w-24 rounded-full bg-[#6d28d9]/20 blur-3xl" />

            <div className="relative h-full overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Privacy Policy
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                    ASLENIX data trust & transparency
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                    A premium privacy experience backed by strong protection, clarity, and control.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
                  aria-label="Close Privacy Policy"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="modal-scroll relative mt-6 h-[calc(85vh-170px)] overflow-y-auto pr-3 text-sm leading-7 text-white/80">
                {content.map((section) => (
                  <section key={section.title} className="space-y-4 scroll-mt-8">
                    <h3 className="text-xl font-semibold text-gradient">{section.title}</h3>
                    <p>{section.text}</p>
                  </section>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
