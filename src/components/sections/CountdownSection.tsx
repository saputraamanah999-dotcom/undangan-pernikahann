// src/components/sections/CountdownSection.tsx
'use client';
import { motion } from 'motion/react';
import { useCountdown } from '../../hooks/useCountdown';
import { Calendar, Heart } from 'lucide-react';
import { SiteConfig } from '../../types/invitation';

interface CountdownSectionProps {
  config: SiteConfig;
}

function CountdownClock({ targetDate, title, coupleNames }: { targetDate: string; title: string; coupleNames: string }) {
  const { d, h, m, s, isArrived } = useCountdown(targetDate);

  const countdownUnits = [
    { value: d, label: 'Hari' },
    { value: h, label: 'Jam' },
    { value: m, label: 'Menit' },
    { value: s, label: 'Detik' },
  ];

  const formatFriendlyDate = (dateStr: string) => {
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

  return (
    <div className="flex flex-col items-center w-full p-6 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl backdrop-blur-sm hover:border-[#C9A24B]/30 transition-all duration-300">
      <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A24B] font-extrabold font-sans mb-1">
        {title}
      </span>
      <h3 className="font-serif text-lg font-black text-white uppercase mb-5">
        {coupleNames}
      </h3>

      {isArrived ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="py-4 px-6 rounded-2xl bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-center"
        >
          <p className="font-serif text-sm font-bold text-[#C9A24B]">Hari Bahagia Telah Tiba!</p>
          <p className="text-[10px] text-white/80 mt-1 font-light">Mohon doa restu Anda semua untuk keberkahan upacara suci ini.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-4 gap-2 w-full">
          {countdownUnits.map((unit, index) => (
            <div
              key={unit.label}
              className="flex flex-col items-center p-2.5 rounded-xl bg-white/5 border border-white/10 shadow-sm"
            >
              <span className="font-sans text-xl sm:text-2xl font-black text-white leading-none">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-[#C9A24B]/80 mt-1.5 font-sans font-bold">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Date banner for this countdown */}
      <div className="mt-5 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px]">
        <Calendar className="w-3 h-3 text-[#C9A24B]" />
        <span className="tracking-wider text-white/90 font-bold font-sans uppercase">
          {formatFriendlyDate(targetDate)}
        </span>
      </div>
    </div>
  );
}

export function CountdownSection({ config }: CountdownSectionProps) {
  const isJoint = config.isJointWedding;

  return (
    <section className="relative py-16 px-6 text-center bg-gradient-to-b from-[#1a0b16] to-[#0d0309] overflow-hidden">
      {/* Background floral motif overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.06),transparent_70%)] pointer-events-none" />

      <div className="max-w-md mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-8"
        >
          {/* Section Indicator Icon */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-[#C9A24B] mb-4 animate-pulse">
              <Heart className="w-5 h-5 fill-[#C9A24B]/20 text-[#C9A24B]" />
            </div>

            <h2 className="font-serif text-3xl font-black text-white tracking-tight uppercase">
              Menuju Hari Bahagia
            </h2>
            <div className="h-[2px] w-16 bg-[#C9A24B] mt-4" />
          </div>

          {/* Double or Single Countdown clks */}
          <div className="flex flex-col gap-6 w-full">
            <CountdownClock
              targetDate={config.event.date}
              title={isJoint ? "Pernikahan Pertama" : "Upacara Suci Pawiwahan"}
              coupleNames={`${config.couple.groom.nickname} & ${config.couple.bride.nickname}`}
            />

            {isJoint && config.couple2 && config.event2 && (
              <CountdownClock
                targetDate={config.event2.date}
                title="Pernikahan Kedua"
                coupleNames={`${config.couple2.groom.nickname} & ${config.couple2.bride.nickname}`}
              />
            )}
          </div>

          <p className="text-[10px] text-[#C9A24B]/60 font-sans font-medium tracking-wide max-w-xs leading-relaxed">
            Menghitung mundur setiap detik berharga sampai kami mengikrarkan janji suci di hadapan Sang Hyang Widhi Wasa.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
