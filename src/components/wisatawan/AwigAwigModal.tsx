import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../context/I18nContext';
import type { TempleZone } from '../../types';
import {
  Shirt,
  ShieldCheck,
  CameraOff,
  ArrowDown,
  Flower2,
  AlertTriangle,
  Lock,
  XCircle,
  X,
  Check,
} from 'lucide-react';
import { StaggerContainer } from '../common/AnimationWrappers';
import { gsap } from 'gsap';

interface Props {
  temple: TempleZone | null;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'shirt': Shirt,
  'shield-check': ShieldCheck,
  'camera-off': CameraOff,
  'arrow-down': ArrowDown,
  'flower-2': Flower2,
  'alert-triangle': AlertTriangle,
  'lock': Lock,
  'x-circle': XCircle,
};

export function AwigAwigModal({ temple, onClose }: Props) {
  const { t, lang } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [attire, setAttire] = useState({
    kamen: false,
    senteng: false,
    shoulders: false,
    knees: false,
  });
  const [cuntakaAnswer, setCuntakaAnswer] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    if (temple && modalRef.current && overlayRef.current) {
      // Animate modal entrance
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, [temple]);

  const handleClose = () => {
    if (modalRef.current && overlayRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.25,
        ease: 'power2.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          onClose();
          // Reset state
          setAttire({ kamen: false, senteng: false, shoulders: false, knees: false });
          setCuntakaAnswer(null);
        },
      });
    }
  };

  if (!temple) return null;

  const allAttireChecked = Object.values(attire).every((checked) => checked);
  const canProceed = allAttireChecked && cuntakaAnswer !== null;

  const handleProceed = () => {
    if (canProceed) {
      alert(
        t(
          `You may proceed respectfully to ${temple.name}`,
          `Anda dapat melanjutkan dengan hormat ke ${lang === 'en' ? temple.name : temple.nameId}`
        )
      );
      handleClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl"
        style={{
          boxShadow: 'var(--shadow-xl), var(--glow-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 p-6 border-b"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-lg transition-all hover:bg-opacity-10"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
            }}
          >
            <X size={20} />
          </button>
          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            {lang === 'en' ? temple.name : temple.nameId}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {t('Awig-Awig Compliance', 'Kepatuhan Awig-Awig')}
          </p>
        </div>

        <div className="p-6 md:p-8">
          {/* Mandatory Attire Checklist */}
          <section className="mb-8">
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              {t('Mandatory Attire', 'Pakaian Wajib')}
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { key: 'kamen' as const, en: 'Kamen (sarong) worn', id: 'Kamen (sarung) dikenakan' },
                { key: 'senteng' as const, en: 'Senteng (sash) worn', id: 'Senteng (selendang) dikenakan' },
                { key: 'shoulders' as const, en: 'Shoulders covered', id: 'Bahu tertutup' },
                { key: 'knees' as const, en: 'Knees covered', id: 'Lutut tertutup' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: attire[item.key] ? 'var(--color-surface)' : 'transparent',
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0 rounded-lg transition-all"
                    style={{
                      width: '24px',
                      height: '24px',
                      border: `2px solid ${attire[item.key] ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: attire[item.key] ? 'var(--color-primary)' : 'transparent',
                      boxShadow: attire[item.key] ? 'var(--glow-primary)' : 'none',
                    }}
                  >
                    {attire[item.key] && <Check size={16} color="white" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={attire[item.key]}
                    onChange={(e) => setAttire({ ...attire, [item.key]: e.target.checked })}
                    className="hidden"
                  />
                  <span className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
                    {t(item.en, item.id)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Behavioral Rules */}
          <section className="mb-8">
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              {t('Behavioral Rules', 'Aturan Perilaku')}
            </h3>
            <StaggerContainer className="flex flex-col gap-3">
              {temple.rules.map((rule) => {
                const IconComponent = iconMap[rule.icon] || AlertTriangle;
                return (
                  <div
                    key={rule.id}
                    className="stagger-item glass-card flex items-start gap-3 p-4 rounded-xl"
                  >
                    <div
                      className="flex-shrink-0 p-2 rounded-lg"
                      style={{
                        background: 'var(--color-terracotta)',
                        color: 'white',
                      }}
                    >
                      <IconComponent size={18} />
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                      {t(rule.textEn, rule.textId)}
                    </span>
                  </div>
                );
              })}
            </StaggerContainer>
          </section>

          {/* Cuntaka Self-Assessment */}
          <section className="mb-8">
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              {t('Cuntaka Self-Assessment', 'Penilaian Mandiri Cuntaka')}
            </h3>
            <p
              className="text-sm mb-4 leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t(
                'Are you currently in a state of ritual impurity (cuntaka)?',
                'Apakah Anda sedang dalam keadaan cuntaka (ketidaksucian ritual)?'
              )}
            </p>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setCuntakaAnswer('no')}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all"
                style={{
                  color: cuntakaAnswer === 'no' ? 'white' : 'var(--color-text)',
                  background: cuntakaAnswer === 'no' ? 'var(--color-open)' : 'var(--color-surface)',
                  border: `2px solid ${cuntakaAnswer === 'no' ? 'var(--color-open)' : 'var(--color-border)'}`,
                  boxShadow: cuntakaAnswer === 'no' ? 'var(--glow-open)' : 'none',
                }}
              >
                {t('No', 'Tidak')}
              </button>
              <button
                onClick={() => setCuntakaAnswer('yes')}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all"
                style={{
                  color: cuntakaAnswer === 'yes' ? 'white' : 'var(--color-text)',
                  background: cuntakaAnswer === 'yes' ? 'var(--color-closed)' : 'var(--color-surface)',
                  border: `2px solid ${cuntakaAnswer === 'yes' ? 'var(--color-closed)' : 'var(--color-border)'}`,
                }}
              >
                {t('Yes', 'Ya')}
              </button>
            </div>
            <p
              className="text-xs italic leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t(
                'This response is processed in-memory only and is never stored or transmitted.',
                'Respons ini diproses hanya di memori dan tidak pernah disimpan atau dikirimkan.'
              )}
            </p>
          </section>

          {/* Proceed Button */}
          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className="btn-primary w-full"
            style={{
              opacity: canProceed ? 1 : 0.5,
              cursor: canProceed ? 'pointer' : 'not-allowed',
              background: canProceed ? 'var(--color-primary)' : 'var(--color-gray-400)',
            }}
          >
            {t('Proceed Respectfully', 'Lanjutkan dengan Hormat')}
          </button>
        </div>
      </div>
    </div>
  );
}
