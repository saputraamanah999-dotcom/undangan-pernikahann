// src/components/sections/GiftEnvelopeSection.tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, CreditCard, Copy, Check, QrCode } from 'lucide-react';
import { SiteConfig } from '../../types/invitation';

interface GiftEnvelopeSectionProps {
  config: SiteConfig;
}

export function GiftEnvelopeSection({ config }: GiftEnvelopeSectionProps) {
  const { qrisImageUrl, bankAccounts } = config;
  const [showQris, setShowQris] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (num: string, idx: number) => {
    navigator.clipboard.writeText(num);
    setCopiedIndex(idx);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <section id="section-gifts" className="relative py-20 px-6 bg-gradient-to-b from-[#0d0309] via-[#1a0b16] to-[#14020f] text-center overflow-hidden">
      
      <div className="max-w-md mx-auto relative z-10 flex flex-col items-center gap-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-[#C9A24B] mb-4 animate-pulse">
            <Gift className="w-5 h-5 text-[#C9A24B]" />
          </div>
          <h2 className="font-serif text-3xl font-black text-white tracking-tight uppercase">
            Kirim Kado & Amplop
          </h2>
          <div className="h-[2px] w-12 bg-[#C9A24B] mx-auto mt-3.5 mb-3" />
          <p className="text-xs text-[#FDF6E9]/75 font-sans font-medium max-w-xs leading-relaxed">
            Doa restu Anda adalah hadiah terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih secara digital, Anda dapat menggunakan opsi berikut:
          </p>
        </motion.div>

        {/* Bank transfer cards mapping */}
        <div className="w-full flex flex-col gap-4">
          {bankAccounts.map((account, index) => (
            <motion.div
              key={account.number}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-3xl bg-white/[0.03] border-2 border-white/10 hover:border-[#C9A24B]/40 shadow-xl backdrop-blur-sm text-left flex items-start justify-between relative overflow-hidden"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/20 text-[#C9A24B] mt-0.5 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-sans font-black text-sm tracking-wider uppercase text-[#C9A24B]">
                    {account.bank}
                  </p>
                  <p className="font-sans text-lg font-black text-white tracking-wider mt-1">
                    {account.number}
                  </p>
                  <p className="text-[11px] text-[#FDF6E9]/65 font-sans mt-0.5">
                    Atas Nama: <span className="text-[#FDF6E9] font-bold">{account.holder}</span>
                  </p>
                </div>
              </div>

              {/* Copy button */}
              <button
                onClick={() => handleCopy(account.number, index)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-[#C9A24B]/10 border border-white/15 hover:border-[#C9A24B] text-[#C9A24B] cursor-pointer active:scale-90 transition-all shrink-0 self-center"
                title="Salin nomor rekening"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 font-sans">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold font-sans">Salin</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* QRIS section toggle and view */}
        <div className="w-full flex flex-col items-center">
          <button
            onClick={() => setShowQris(!showQris)}
            className="flex items-center gap-2 rounded-full bg-[#C9A24B] px-6 py-3.5 font-sans font-black text-xs tracking-wider uppercase text-white shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-white" />
            <span>{showQris ? 'Tutup Amplop QRIS' : 'Tampilkan Amplop QRIS'}</span>
          </button>

          <AnimatePresence>
            {showQris && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[280px] mt-6 bg-[#FDF6E9] rounded-3xl p-5 shadow-2xl border-2 border-[#C9A24B] flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="w-full relative bg-white rounded-2xl p-2 border border-gray-200"
                >
                  <img
                    src={qrisImageUrl}
                    alt="Amplop Digital QRIS"
                    className="w-full aspect-square object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle watermarked lock icon */}
                  <div className="absolute top-3 right-3 text-red-600 font-mono text-[9px] font-black tracking-widest bg-red-100 border border-red-200 rounded px-1.5 py-0.5">
                    QRIS CASH
                  </div>
                </motion.div>
                
                <p className="mt-3.5 text-xs font-black text-[#1a0b16] tracking-wide font-sans uppercase">
                  Pindai QRIS Amplop Digital
                </p>
                <p className="text-[10px] text-[#1a0b16]/70 font-sans font-medium mt-1 text-center px-2 leading-relaxed">
                  Dapat dipindai dengan aplikasi dompet digital apa saja (Gopay, OVO, Dana, LinkAja) atau Mobile Banking.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
