// src/components/ui/SenderBadge.tsx
import { VerifiedBadge } from './VerifiedBadge';

const SENDER_STYLE: Record<string, { label: string; className: string }> = {
  mempelai: { label: 'Dari Mempelai', className: 'bg-[#C9A24B]/20 text-[#C9A24B] border border-[#C9A24B]/30' },
  keluarga: { label: 'Dari Keluarga', className: 'bg-white/10 text-white/80 border border-white/20' },
  developer: { label: 'Saputra Developer', className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
};

export function SenderBadge({ senderType }: { senderType: 'mempelai' | 'keluarga' | 'developer' }) {
  const s = SENDER_STYLE[senderType] ?? SENDER_STYLE.keluarga;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-sans ${s.className}`}>
      <span>{s.label}</span>
      {senderType === 'developer' && <VerifiedBadge size={13} />}
    </span>
  );
}