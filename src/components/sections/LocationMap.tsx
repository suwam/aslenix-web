import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmpx-api-loader': any;
      'gmpx-store-locator': any;
    }
  }
}

const mapsUrl = "https://maps.app.goo.gl/9gCfTWWnM2oVzMSL9";

const CONFIGURATION = {
  "locations": [
    {"title":"ASLENIX TECH AND SOLUTION","address1":"Durga Marg","address2":"Kathmandu, Nepal","coords":{"lat":27.6866207,"lng":85.3313799},"placeId":"ChIJL41gSsIZ6zkR5BXIbP9bz8M"}
  ],
  "mapOptions": {"center":{"lat":27.6866207,"lng":85.3313799},"fullscreenControl":true,"mapTypeControl":false,"streetViewControl":false,"zoom":15,"zoomControl":true,"maxZoom":17,"mapId":""},
  "mapsApiKey": "YOUR_API_KEY_HERE",
  "capabilities": {"input":true,"autocomplete":true,"directions":false,"distanceMatrix":true,"details":false,"actions":false}
};

export const LocationMap = () => {
  const locatorRef = useRef<any>(null);

  useEffect(() => {
    // Add the Extended Component Library script dynamically
    if (!document.querySelector('script[src*="@googlemaps/extended-component-library"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.15/index.min.js";
      document.head.appendChild(script);
    }

    const initLocator = async () => {
      await customElements.whenDefined('gmpx-store-locator');
      if (locatorRef.current) {
        locatorRef.current.configureFromQuickBuilder(CONFIGURATION);
      }
    };

    initLocator();
  }, []);

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
                Durga Marg, Kathmandu, Nepal
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                Open in Maps <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="gradient-border glass overflow-hidden rounded-3xl p-2">
            <div className="h-[360px] w-full rounded-[1.25rem] border-0 sm:h-[440px] overflow-hidden bg-white">
              <gmpx-api-loader key="YOUR_API_KEY_HERE" solution-channel="GMP_QB_locatorplus_v11_cABD"></gmpx-api-loader>
              <gmpx-store-locator ref={locatorRef} map-id="DEMO_MAP_ID"></gmpx-store-locator>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
