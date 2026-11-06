import { useState } from 'react';
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
  Check,
} from 'lucide-react';
import { StaggerContainer } from '../common/AnimationWrappers';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

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

  const [attire, setAttire] = useState({
    kamen: false,
    senteng: false,
    shoulders: false,
    knees: false,
  });
  const [cuntakaAnswer, setCuntakaAnswer] = useState<'yes' | 'no' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset transient state whenever the temple selection changes
  const resetState = () => {
    setAttire({ kamen: false, senteng: false, shoulders: false, knees: false });
    setCuntakaAnswer(null);
    setShowConfirm(false);
  };

  if (!temple) return null;

  const allAttireChecked = Object.values(attire).every((checked) => checked);
  const canProceed = allAttireChecked && cuntakaAnswer !== null;
  const templeName = lang === 'en' ? temple.name : temple.nameId;

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleProceedClick = () => {
    if (canProceed) setShowConfirm(true);
  };

  const handleProceedConfirmed = () => {
    setShowConfirm(false);
    handleClose();
  };

  return (
    <>
      <Modal
        title={templeName}
        subtitle={t('Awig-Awig Compliance', 'Kepatuhan Awig-Awig')}
        onClose={handleClose}
        maxWidth={640}
      >
        {/* Mandatory Attire Checklist */}
        <section aria-labelledby="attire-heading" style={{ marginBottom: '32px' }}>
          <h3 id="attire-heading" className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            {t('Mandatory Attire', 'Pakaian Wajib')}
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }} role="group" aria-labelledby="attire-heading">
            {([
              { key: 'kamen' as const, en: 'Kamen (sarong) worn', id: 'Kamen (sarung) dikenakan' },
              { key: 'senteng' as const, en: 'Senteng (sash) worn', id: 'Senteng (selendang) dikenakan' },
              { key: 'shoulders' as const, en: 'Shoulders covered', id: 'Bahu tertutup' },
              { key: 'knees' as const, en: 'Knees covered', id: 'Lutut tertutup' },
            ] as const).map((item) => {
              const checked = attire[item.key];
              const id = `attire-${item.key}`;
              return (
                <li key={item.key}>
                  <label
                    htmlFor={id}
                    className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: checked ? 'var(--color-surface)' : 'transparent',
                      border: `1px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      minHeight: '56px',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="flex items-center justify-center flex-shrink-0 rounded-lg transition-all"
                      style={{
                        width: '28px',
                        height: '28px',
                        border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: checked ? 'var(--color-primary)' : 'transparent',
                        boxShadow: checked ? 'var(--glow-primary)' : 'none',
                      }}
                    >
                      {checked && <Check size={18} color="white" strokeWidth={3} />}
                    </span>
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setAttire((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                      style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px' }}
                      aria-checked={checked}
                    />
                    <span className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
                      {t(item.en, item.id)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Behavioral Rules */}
        <section aria-labelledby="rules-heading" style={{ marginBottom: '32px' }}>
          <h3 id="rules-heading" className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            {t('Behavioral Rules', 'Aturan Perilaku')}
          </h3>
          <StaggerContainer className="flex flex-col gap-3">
            {temple.rules.map((rule) => {
              const IconComponent = iconMap[rule.icon] || AlertTriangle;
              return (
                <div key={rule.id} className="stagger-item glass-card flex items-start gap-3 p-4 rounded-xl">
                  <div
                    aria-hidden="true"
                    className="flex-shrink-0 p-2 rounded-lg"
                    style={{ background: 'var(--color-terracotta)', color: 'white' }}
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
        <section aria-labelledby="cuntaka-heading" style={{ marginBottom: '32px' }}>
          <h3 id="cuntaka-heading" className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {t('Cuntaka Self-Assessment', 'Penilaian Mandiri Cuntaka')}
          </h3>
          <p id="cuntaka-desc" className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {t('Are you currently in a state of ritual impurity (cuntaka)?', 'Apakah Anda sedang dalam keadaan cuntaka (ketidaksucian ritual)?')}
          </p>
          <div role="radiogroup" aria-labelledby="cuntaka-heading" aria-describedby="cuntaka-desc" className="flex gap-3 mb-3">
            <button
              type="button"
              role="radio"
              aria-checked={cuntakaAnswer === 'no'}
              onClick={() => setCuntakaAnswer('no')}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              style={{
                color: cuntakaAnswer === 'no' ? 'white' : 'var(--color-text)',
                background: cuntakaAnswer === 'no' ? 'var(--color-open)' : 'var(--color-surface)',
                border: `2px solid ${cuntakaAnswer === 'no' ? 'var(--color-open)' : 'var(--color-border)'}`,
                boxShadow: cuntakaAnswer === 'no' ? 'var(--glow-open)' : 'none',
                minHeight: '44px',
                cursor: 'pointer',
              }}
            >
              {t('No', 'Tidak')}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={cuntakaAnswer === 'yes'}
              onClick={() => setCuntakaAnswer('yes')}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              style={{
                color: cuntakaAnswer === 'yes' ? 'white' : 'var(--color-text)',
                background: cuntakaAnswer === 'yes' ? 'var(--color-closed)' : 'var(--color-surface)',
                border: `2px solid ${cuntakaAnswer === 'yes' ? 'var(--color-closed)' : 'var(--color-border)'}`,
                boxShadow: cuntakaAnswer === 'yes' ? '0 0 15px rgba(220,38,38,0.3)' : 'none',
                minHeight: '44px',
                cursor: 'pointer',
              }}
            >
              {t('Yes', 'Ya')}
            </button>
          </div>
          <p className="text-xs italic leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {t(
              'This response is processed in-memory only and is never stored or transmitted.',
              'Respons ini diproses hanya di memori dan tidak pernah disimpan atau dikirimkan.'
            )}
          </p>
        </section>

        {/* Proceed Button */}
        <button
          type="button"
          onClick={handleProceedClick}
          disabled={!canProceed}
          aria-disabled={!canProceed}
          aria-describedby={!canProceed ? 'proceed-hint' : undefined}
          className="btn-primary w-full"
          style={{
            opacity: canProceed ? 1 : 0.55,
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          {t('Proceed Respectfully', 'Lanjutkan dengan Hormat')}
        </button>
        {!canProceed && (
          <p id="proceed-hint" role="status" style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            {t('Please complete all attire checks and answer the cuntaka question.', 'Mohon lengkapi semua pemeriksaan pakaian dan jawab pertanyaan cuntaka.')}
          </p>
        )}
      </Modal>

      <ConfirmDialog
        open={showConfirm}
        title={t('Proceed respectfully?', 'Lanjutkan dengan hormat?')}
        message={t(
          `You may proceed respectfully to ${templeName}. Please continue with reverence.`,
          `Anda dapat melanjutkan dengan hormat ke ${templeName}. Mohon lanjutkan dengan penuh hormat.`
        )}
        confirmLabel={t('Confirm', 'Konfirmasi')}
        cancelLabel={t('Cancel', 'Batal')}
        onConfirm={handleProceedConfirmed}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
