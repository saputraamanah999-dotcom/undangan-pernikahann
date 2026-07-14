// src/components/sections/EventDetailSection.tsx
'use client';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';
import { SiteConfig } from '../../types/invitation';
import { WeatherWidget } from '../ui/WeatherWidget';

interface EventDetailSectionProps {
  config: SiteConfig;
}

export function EventDetailSection({ config }: EventDetailSectionProps) {
  const { event, event2, reception, reception2, isJointWedding } = config;

  const getFriendlyDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Tanggal Bahagia';
    }
  };

  // Google Calendar render URL helper
  const getGoogleCalendarUrl = (title: string, dateStr: string, locationName: string, address: string) => {
    const details = `Undangan Pernikahan Suci.\n\nLokasi: ${address}\nUndangan Online: ${window.location.origin}`;
    const startObj = new Date(dateStr || "");
    const endObj = new Date(startObj.getTime() + (3 * 60 * 60 * 1000)); // 3 hours duration

    const formatUTC = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${formatUTC(startObj)}/${formatUTC(endObj)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(locationName + ", " + address)}&dates=${dates}`;
  };

  return (
    <section id="section-events" className="relative py-20 px-6 bg-gradient-to-b from-[#0d0309] via-[#1a0b16] to-[#0d0309] text-center overflow-hidden">
      
      {/* Visual Accent Dividers */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A24B]/35 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A24B]/35 to-transparent" />

      <div className="max-w-md mx-auto relative z-10 flex flex-col gap-12">
        
        {/* Header Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A24B] font-extrabold font-sans">Waktu & Tempat</span>
          <h2 className="font-serif text-3xl font-black text-white mt-1.5 tracking-tight uppercase">
            Acara Sakral
          </h2>
          <div className="h-[2px] w-12 bg-[#C9A24B] mx-auto mt-3.5" />
        </motion.div>

        {/* Ceremony Card (Pawiwahan 1) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative rounded-3xl p-6 bg-white/[0.03] border-2 border-white/10 hover:border-[#C9A24B]/40 shadow-xl backdrop-blur-sm overflow-hidden text-left"
        >
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#C9A24B]/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3.5 border-b border-white/10 pb-4 mb-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-[#C9A24B]">
              <Sparkles className="w-5 h-5 text-[#C9A24B]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-black text-white uppercase tracking-tight">
                {isJointWedding ? "Pawiwahan I" : "Upacara Pawiwahan"}
              </h3>
              <p className="text-[9px] uppercase tracking-wider text-[#C9A24B] font-extrabold font-sans mt-0.5">
                {isJointWedding ? `${config.couple.groom.nickname} & ${config.couple.bride.nickname}` : "Sumpah Suci & Akad"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs text-[#FDF6E9]/90 font-sans font-medium">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-sm">{getFriendlyDate(event.date)}</p>
                <p className="text-[11px] text-[#FDF6E9]/65 font-sans mt-0.5 font-normal">Waktu Indonesia Tengah (WITA)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-sm">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-sm">{event.locationName}</p>
                <p className="leading-relaxed mt-1 text-[#FDF6E9]/75 font-normal">{event.address}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex gap-3">
            <a
              href={getGoogleCalendarUrl(isJointWedding ? `Pawiwahan I: ${config.couple.groom.nickname} & ${config.couple.bride.nickname}` : "Upacara Pawiwahan", event.date, event.locationName, event.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#C9A24B]/40 text-[11px] font-sans font-bold uppercase tracking-wider text-white transition-all active:scale-95 text-center cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Kalender</span>
            </a>
            <a
              href={event.mapsExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#C9A24B] border border-[#C9A24B]/30 text-[11px] font-sans font-bold uppercase tracking-wider text-white shadow-md shadow-[#C9A24B]/10 transition-all hover:brightness-110 active:scale-95 text-center cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>Petunjuk</span>
            </a>
          </div>
        </motion.div>

        {/* Ceremony Card (Pawiwahan 2 - Joint Wedding Only) */}
        {isJointWedding && config.couple2 && event2 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative rounded-3xl p-6 bg-white/[0.03] border-2 border-white/10 hover:border-[#C9A24B]/40 shadow-xl backdrop-blur-sm overflow-hidden text-left"
          >
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#C9A24B]/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-3.5 border-b border-white/10 pb-4 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-[#C9A24B]">
                <Sparkles className="w-5 h-5 text-[#C9A24B]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-black text-white uppercase tracking-tight">Pawiwahan II</h3>
                <p className="text-[9px] uppercase tracking-wider text-[#C9A24B] font-extrabold font-sans mt-0.5">
                  {config.couple2.groom.nickname} & {config.couple2.bride.nickname}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs text-[#FDF6E9]/90 font-sans font-medium">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">{getFriendlyDate(event2.date)}</p>
                  <p className="text-[11px] text-[#FDF6E9]/65 font-sans mt-0.5 font-normal">Waktu Indonesia Tengah (WITA)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">{event2.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">{event2.locationName}</p>
                  <p className="leading-relaxed mt-1 text-[#FDF6E9]/75 font-normal">{event2.address}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex gap-3">
              <a
                href={getGoogleCalendarUrl(`Pawiwahan II: ${config.couple2.groom.nickname} & ${config.couple2.bride.nickname}`, event2.date, event2.locationName, event2.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#C9A24B]/40 text-[11px] font-sans font-bold uppercase tracking-wider text-white transition-all active:scale-95 text-center cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C9A24B]" />
                <span>Kalender</span>
              </a>
              <a
                href={event2.mapsExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#C9A24B] border border-[#C9A24B]/30 text-[11px] font-sans font-bold uppercase tracking-wider text-white shadow-md shadow-[#C9A24B]/10 transition-all hover:brightness-110 active:scale-95 text-center cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>Petunjuk</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* Reception Card (Resepsi) */}
        {reception && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1 }}
            className="relative rounded-3xl p-6 bg-white/[0.03] border-2 border-white/10 hover:border-[#C9A24B]/40 shadow-xl backdrop-blur-sm overflow-hidden text-left"
          >
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#C9A24B]/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-3.5 border-b border-white/10 pb-4 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-[#C9A24B]">
                <Sparkles className="w-5 h-5 text-[#C9A24B]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-black text-white uppercase tracking-tight">Resepsi Pernikahan</h3>
                <p className="text-[9px] uppercase tracking-wider text-[#C9A24B] font-extrabold font-sans mt-0.5">
                  {isJointWedding ? "Acara Syukuran Bersama" : "Ramah Tamah & Jamuan"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs text-[#FDF6E9]/90 font-sans font-medium">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">{getFriendlyDate(reception.date)}</p>
                  <p className="text-[11px] text-[#FDF6E9]/65 font-sans mt-0.5 font-normal">Waktu Indonesia Tengah (WITA)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">{reception.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">{reception.locationName}</p>
                  <p className="leading-relaxed mt-1 text-[#FDF6E9]/75 font-normal">{reception.address}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex gap-3">
              <a
                href={getGoogleCalendarUrl(isJointWedding ? "Resepsi Pernikahan Bersama" : "Resepsi Pernikahan", reception.date, reception.locationName, reception.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#C9A24B]/40 text-[11px] font-sans font-bold uppercase tracking-wider text-white transition-all active:scale-95 text-center cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C9A24B]" />
                <span>Kalender</span>
              </a>
              <a
                href={reception.mapsExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#C9A24B] border border-[#C9A24B]/30 text-[11px] font-sans font-bold uppercase tracking-wider text-white shadow-md shadow-[#C9A24B]/10 transition-all hover:brightness-110 active:scale-95 text-center cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>Petunjuk</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* Elegant Weather Widget */}
        <WeatherWidget />

      </div>
    </section>
  );
}
