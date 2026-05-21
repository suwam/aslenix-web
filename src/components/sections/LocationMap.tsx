import { motion } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const mapsUrl = "https://maps.app.goo.gl/9gCfTWWnM2oVzMSL9";
const embedUrl =
  "https://www.google.com/maps?q=M8QJ%2B25%20Kathmandu&output=embed";

export const LocationMap = () => {
  return (
    <section id="location" className="relative pb-24 sm:pb-32">
      <div className="absolute inset-x-0 top-10 h-[360px] bg-brand-gradient opacity-[0.05] blur-[140px] -z-10" />
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-accent">
                <MapPin className="h-3.5 w-3.5" />
                VISIT US
              </div>
              <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
                Find <span className="text-gradient">ASLENIX</span> in Kathmandu
              </h2>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                New Baneshwor Budhhanagar-10 Kathmandu, Nepal
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                Open in Maps <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="gradient-border glass overflow-hidden rounded-3xl p-2">
            <iframe
              title="ASLENIX location on Google Maps"
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[360px] w-full rounded-[1.25rem] border-0 sm:h-[440px]"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
