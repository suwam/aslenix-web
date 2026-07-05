import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const terms = [
  {
    title: "Acceptance of Terms",
    text: "By using the ASLENIX website and services, you agree to these terms and our commitment to a premium digital experience.",
  },
  {
    title: "Services",
    text: "ASLENIX provides design, engineering, AI, and digital product services. Project scope, timelines, and deliverables are defined in engagement agreements.",
  },
  {
    title: "User Responsibilities",
    text: "You are responsible for accurate information, lawful use of services, and timely communication throughout the collaboration.",
  },
  {
    title: "Intellectual Property",
    text: "ASLENIX retains ownership of creative assets and proprietary systems. Clients receive usage rights as defined by the project agreement.",
  },
  {
    title: "Payments",
    text: "All fees are due according to the agreement terms. Late or missed payments may delay delivery until the account is current.",
  },
  {
    title: "Liability",
    text: "ASLENIX is committed to quality, but liability is limited to direct damages and excludes indirect or consequential loss.",
  },
  {
    title: "Termination",
    text: "Either party may terminate the engagement according to the agreed contract terms, while preserving rights and obligations for work already completed.",
  },
  {
    title: "Governing Law",
    text: "These terms are governed by applicable laws and are intended to support transparent, trusted partnerships with clients worldwide.",
  },
];

export const TermsModal = ({ open, onClose }: TermsModalProps) => {
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
          aria-label="Terms and Conditions"
        >
          <motion.div
            className="absolute inset-0 bg-foreground/75 backdrop-blur-xl"
            onClick={handleOverlayClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative z-10 w-full max-w-[900px] h-[85vh] overflow-hidden rounded-[2rem] border border-foreground/10 bg-[#090b18]/95 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-[30px]"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,132,246,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,45,85,0.12),transparent_40%)] opacity-90 pointer-events-none" />
            <div className="absolute left-8 top-10 h-24 w-24 rounded-full bg-[#d946ef]/20 blur-3xl" />
            <div className="absolute right-8 bottom-12 h-24 w-24 rounded-full bg-[#3b82f6]/20 blur-3xl" />

            <div className="relative h-full overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-foreground/10">
                <div>
                  <div className="inline-flex rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Terms & Conditions
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                    Premium terms for a trusted digital partnership
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                    Clear terms that support transparent, secure engagements with ASLENIX.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 text-foreground hover:bg-foreground/10 transition-colors"
                  aria-label="Close Terms and Conditions"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="modal-scroll relative mt-6 h-[calc(85vh-170px)] overflow-y-auto pr-3 text-sm leading-7 text-foreground/80">
                {terms.map((section) => (
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
