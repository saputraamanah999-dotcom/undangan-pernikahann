// src/components/sections/RsvpForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, SITE_ID } from '../../lib/firebase/client';
import { Sparkles, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { triggerFireworks } from '../ui/FireworksEffect';

const rsvpSchema = z.object({
  name: z.string().min(2, { message: 'Nama lengkap minimal 2 karakter.' }),
  attendance: z.enum(['hadir', 'tidak', 'ragu']),
  totalGuests: z.number().min(1, { message: 'Minimal 1 tamu.' }).max(10, { message: 'Maksimal 10 tamu.' }),
  message: z.string().min(5, { message: 'Pesan minimal 5 karakter.' }).max(300, { message: 'Pesan maksimal 300 karakter.' }),
});

type RsvpFormValues = z.infer<typeof rsvpSchema>;

interface RsvpFormProps {
  initialGuestName: string;
}

export function RsvpForm({ initialGuestName }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: '',
      attendance: 'hadir',
      totalGuests: 1,
      message: '',
    },
  });

  // Autofill name from URL guest tracker
  useEffect(() => {
    if (initialGuestName && initialGuestName !== 'Bapak/Ibu/Saudara/i') {
      setValue('name', initialGuestName);
    }
  }, [initialGuestName, setValue]);

  const onSubmit = async (data: RsvpFormValues) => {
    setIsSubmitting(true);
    try {
      const id = crypto.randomUUID();
      const timestamp = serverTimestamp();

      // 1. Save RSVP to Firestore
      await setDoc(doc(db, `sites/${SITE_ID}/rsvp/${id}`), {
        guestName: data.name,
        attendance: data.attendance,
        totalGuest: data.totalGuests,
        createdAt: timestamp,
      });

      // 2. Add wishes directly to Guestbook collection so they appear live!
      await addDoc(collection(db, `sites/${SITE_ID}/guestbook`), {
        name: data.name,
        message: data.message,
        attendance: data.attendance,
        createdAt: timestamp,
      });

      setIsSuccess(true);
      // Trigger multiple celebratory fireworks bursts
      triggerFireworks({ x: 30, y: 30 });
      setTimeout(() => triggerFireworks({ x: 70, y: 25 }), 300);
      setTimeout(() => triggerFireworks({ x: 50, y: 40 }), 650);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error("Error saving RSVP / wishes:", e);
      alert("Ada kendala koneksi saat menyimpan RSVP Anda. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="section-rsvp" className="relative py-20 px-6 bg-[#0d0309] text-center overflow-hidden">
      
      {/* Background radial gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#C9A24B]/5 blur-2xl pointer-events-none" />

      <div className="max-w-md mx-auto relative z-10 flex flex-col items-center gap-8">
        
        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-[#C9A24B] mb-4">
            <Sparkles className="w-5 h-5 text-[#C9A24B]" />
          </div>
          <h2 className="font-serif text-3xl font-black text-white tracking-tight uppercase">
            Konfirmasi Kehadiran
          </h2>
          <div className="h-[2px] w-12 bg-[#C9A24B] mx-auto mt-3.5 mb-3" />
          <p className="text-xs text-[#FDF6E9]/75 font-sans font-medium max-w-xs leading-relaxed">
            Berikan konfirmasi kehadiran serta kirimkan restu/ucapan untuk kedua mempelai secara langsung.
          </p>
        </motion.div>

        {/* Content Box */}
        <div className="w-full rounded-3xl border-2 border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-sm text-left relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: [1.15, 0.95, 1] }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="flex flex-col items-center text-center py-8"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
                <h3 className="font-serif text-2xl font-black text-white uppercase tracking-tight">Konfirmasi Terkirim!</h3>
                <p className="text-xs text-[#FDF6E9]/75 font-sans font-medium mt-2 max-w-xs leading-relaxed">
                  Terima kasih atas konfirmasi kehadiran Anda. Doa restu Anda telah dipublikasikan di buku tamu.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 rounded-full border-2 border-[#C9A24B] px-6 py-2.5 text-xs text-[#C9A24B] font-bold uppercase tracking-wider active:scale-95 transition cursor-pointer"
                >
                  Kirim Konfirmasi Baru
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-5"
              >
                {/* Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name-input" className="text-xs font-bold uppercase tracking-wider text-[#C9A24B] font-sans">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="name-input"
                    placeholder="Contoh: I Wayan Sudarsa"
                    {...register('name')}
                    className="w-full bg-[#1b0814]/75 border-2 border-white/10 focus:border-[#C9A24B] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/40 outline-none transition-all"
                  />
                  {errors.name && (
                    <span className="text-[11px] text-red-400 mt-0.5 font-bold font-sans">{errors.name.message}</span>
                  )}
                </div>

                {/* Attendance selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#C9A24B] font-sans">
                    Konfirmasi Kehadiran
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['hadir', 'tidak', 'ragu'].map((status) => (
                      <label
                        key={status}
                        className="cursor-pointer flex flex-col items-center justify-center py-3.5 rounded-2xl border-2 border-white/10 bg-black/30 text-[10px] text-white/70 font-bold uppercase tracking-wider select-none transition-all duration-300 hover:border-[#C9A24B]/40 has-[:checked]:bg-[#C9A24B] has-[:checked]:border-[#C9A24B] has-[:checked]:text-[#1a0b16]"
                      >
                        <input
                          type="radio"
                          value={status}
                          {...register('attendance')}
                          className="sr-only"
                        />
                        <span>{status === 'tidak' ? 'Tidak Hadir' : status === 'hadir' ? 'Hadir' : 'Ragu-ragu'}</span>
                      </label>
                    ))}
                  </div>
                  {errors.attendance && (
                    <span className="text-[11px] text-red-400 mt-0.5 font-bold font-sans">{errors.attendance.message}</span>
                  )}
                </div>

                {/* Total Guests Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="total-guests-input" className="text-xs font-bold uppercase tracking-wider text-[#C9A24B] font-sans">
                    Jumlah Tamu Hadir (Termasuk Anda)
                  </label>
                  <input
                    type="number"
                    id="total-guests-input"
                    min="1"
                    max="10"
                    {...register('totalGuests', { valueAsNumber: true })}
                    className="w-full bg-[#1b0814]/75 border-2 border-white/10 focus:border-[#C9A24B] rounded-2xl px-4 py-3.5 text-sm text-white outline-none transition-all"
                  />
                  {errors.totalGuests && (
                    <span className="text-[11px] text-red-400 mt-0.5 font-bold font-sans">{errors.totalGuests.message}</span>
                  )}
                </div>

                {/* Blessings Message Textbox */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="wishes-input" className="text-xs font-bold uppercase tracking-wider text-[#C9A24B] font-sans">
                    Restu / Ucapan Bahagia
                  </label>
                  <textarea
                    id="wishes-input"
                    rows={4}
                    placeholder="Tuliskan ucapan selamat dan restu hangat Anda untuk mempelai..."
                    {...register('message')}
                    className="w-full bg-[#1b0814]/75 border-2 border-white/10 focus:border-[#C9A24B] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/40 outline-none resize-none transition-all"
                  />
                  {errors.message && (
                    <span className="text-[11px] text-red-400 mt-0.5 font-bold font-sans">{errors.message.message}</span>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C9A24B] px-6 py-4 font-sans font-black text-xs tracking-wider uppercase text-black shadow-lg hover:brightness-110 disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-black" />
                      <span>Kirim Konfirmasi Kehadiran</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
