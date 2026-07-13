// src/components/sections/MapsSection.tsx
'use client';
import { motion } from 'motion/react';
import { MapPin, Navigation } from 'lucide-react';
import { SiteConfig } from '../../types/invitation';

interface MapsSectionProps {
  config: SiteConfig;
}

export function MapsSection({ config }: MapsSectionProps) {
  const { event } = config;

  return (
    <section id="section-maps" className="relative py-16 px-6 bg-[#0d0309] text-center overflow-hidden">
      
      <div className="max-w-md mx-auto relative z-10 flex flex-col gap-8">
        
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-[#C9A24B] mx-auto mb-4">
            <MapPin className="w-5 h-5 animate-bounce text-[#C9A24B]" />
          </div>
          <h2 className="font-serif text-3xl font-black text-white tracking-tight uppercase">
            Petunjuk Lokasi
          </h2>
          <div className="h-[2px] w-12 bg-[#C9A24B] mx-auto mt-3.5" />
        </motion.div>

        {/* Maps Iframe Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="rounded-3xl overflow-hidden border-2 border-white/10 shadow-xl bg-white/[0.02] p-2.5 backdrop-blur-sm"
        >
          {/* Elegant embedded iframe */}
          <div className="w-full h-72 rounded-2xl overflow-hidden bg-purple-950/20 relative">
            <iframe
              src={event.mapsEmbedUrl}
              className="w-full h-full border-0 grayscale invert-[0.9] hue-rotate-[290deg] brightness-[0.95] contrast-[1.05]"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Pernikahan Griya Agung Sanur"
            />
          </div>
          
          {/* Card footer description */}
          <div className="p-4 text-left">
            <p className="font-sans font-black text-[#C9A24B] text-sm flex items-center gap-1.5 uppercase tracking-wide">
              <MapPin className="w-4 h-4 text-[#C9A24B]" />
              <span>{event.locationName}</span>
            </p>
            <p className="text-[11px] text-[#FDF6E9]/75 font-sans font-medium mt-1.5 leading-relaxed">
              {event.address}
            </p>
            
            <a
              href={event.mapsExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C9A24B] px-6 py-3.5 font-sans font-black text-xs tracking-wider uppercase text-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-black text-black" />
              <span>Buka di Google Maps</span>
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
