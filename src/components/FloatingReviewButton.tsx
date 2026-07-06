import { useState } from "react";
import { Star, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const sb = supabase as any;

export const FloatingReviewButton = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [quote, setQuote] = useState("");

  const submit = async () => {
    if (!name.trim()) return toast.error("Please enter your name");
    if (!quote.trim()) return toast.error("Please write a review message");

    const payload = {
      name: name.trim(),
      email: email.trim() || null,
      quote: quote.trim(),
      rating,
      active: false, // Must be approved by admin
    };

    const { error } = await sb.from("testimonials").insert(payload);

    if (error) {
      if (error.code === '42P01' || error.message.includes('column "rating"')) {
        return toast.error("System error: The database has not been upgraded yet to accept reviews.");
      }
      return toast.error(error.message);
    }

    toast.success("Thank you for your valuable feedback!");
    setOpen(false);
    // reset form
    setName("");
    setEmail("");
    setQuote("");
    setRating(5);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end group">
        {/* Tooltip */}
        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-md translate-y-1 group-hover:translate-y-0">
          Leave a Review
        </div>

        {/* Floating Button */}
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "h-14 w-14 rounded-full bg-brand-gradient text-foreground shadow-[0_14px_50px_-16px_rgba(186,230,253,0.6)] flex items-center justify-center",
            "hover:shadow-[0_20px_70px_-22px_rgba(233,213,255,0.7)] hover:scale-105 transition-all duration-200 border-0 group relative overflow-hidden"
          )}
          aria-label="Leave a review"
        >
          {/* Shine effect overlay */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20" />
          <Star className="w-6 h-6 fill-foreground text-foreground relative z-10" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-foreground/10 bg-background shadow-[0_24px_80px_-42px_rgba(0,0,0,0.9)] text-foreground rounded-2xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="p-6 relative"
              >
                <DialogTitle className="font-display text-2xl font-semibold mb-1 text-foreground">
                  How did we do?
                </DialogTitle>
                <DialogDescription className="mb-6 text-muted-foreground text-sm">
                  Your feedback helps us improve and serve you better.
                </DialogDescription>

                <div className="space-y-4">
                  {/* Rating Selector */}
                  <div className="flex gap-1 mb-2 pb-4 border-b border-foreground/10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={cn(
                            "w-8 h-8 transition-colors",
                            (hoveredStar !== null ? star <= hoveredStar : star <= rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-foreground/5 text-foreground/15 hover:text-yellow-200"
                          )} 
                        />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="review-name" className="text-foreground/90 text-sm font-medium">Full Name *</Label>
                    <Input 
                      id="review-name" 
                      placeholder="John Doe" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="bg-background border border-foreground/10 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent rounded-xl shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="review-email" className="text-foreground/90 text-sm font-medium">Email <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Input 
                      id="review-email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border border-foreground/10 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent rounded-xl shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="review-quote" className="text-foreground/90 text-sm font-medium">Your Review *</Label>
                    <Textarea 
                      id="review-quote" 
                      placeholder="What was your experience like?" 
                      rows={4} 
                      value={quote} 
                      onChange={(e) => setQuote(e.target.value)}
                      className="bg-background border border-foreground/10 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent resize-none rounded-xl shadow-sm p-3"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-foreground/10 mt-2">
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="hero" className="w-full rounded-xl border-0" onClick={submit}>
                      Submit Review
                    </Button>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};
