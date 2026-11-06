import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { TransliterationTool } from '../components/pelestari/TransliterationTool';
import { WritingPractice } from '../components/pelestari/WritingPractice';
import { HeritageArchive } from '../components/pelestari/HeritageArchive';
import { FadeIn } from '../components/common/AnimationWrappers';

type Tab = 'transliteration' | 'practice' | 'archive';

export function PelestariPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('transliteration');

  const tabs: { id: Tab; labelEn: string; labelId: string }[] = [
    { id: 'transliteration', labelEn: 'Transliteration', labelId: 'Transliterasi' },
    { id: 'practice', labelEn: 'Writing Practice', labelId: 'Latihan Menulis' },
    { id: 'archive', labelEn: 'Heritage Archive', labelId: 'Arsip Warisan' },
  ];

  return (
    <div style={{ background: 'var(--color-bg)', padding: 'clamp(32px, 6vw, 64px) 16px clamp(48px, 6vw, 80px)' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto' }}>
        {/* Hero — clean, centered */}
        <FadeIn delay={0.1}>
          <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '32px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {t('Cultural Preservation', 'Pelestarian Budaya')}
            </span>
            <h1 className="hero-title" style={{ color: 'var(--color-text)', margin: 0 }}>
              {t('Script & Heritage', 'Aksara & Warisan')}
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                color: 'var(--color-text-muted)',
                margin: 0,
                maxWidth: '640px',
                lineHeight: 1.6,
              }}
            >
              {t(
                'Preserve Aksara Bali through transliteration, guided practice, and the digital archive.',
                'Lestarikan Aksara Bali melalui transliterasi, latihan terbimbing, dan arsip digital.'
              )}
            </p>
          </div>
        </FadeIn>

        {/* Tab navigation */}
        <FadeIn delay={0.2}>
          <div
            role="tablist"
            aria-label={t('Pelestari sections', 'Bagian Pelestari')}
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '24px',
              padding: '6px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)',
              overflowX: 'auto',
            }}
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`pelestari-panel-${tab.id}`}
                  id={`pelestari-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text)',
                    border: `1px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 700 : 500,
                    minHeight: '44px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t(tab.labelEn, tab.labelId)}
                </button>
              );
            })}
          </div>
        </FadeIn>

        {/* Tab content */}
        <FadeIn delay={0.3}>
          <div
            role="tabpanel"
            id={`pelestari-panel-${activeTab}`}
            aria-labelledby={`pelestari-tab-${activeTab}`}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: 'clamp(16px, 3vw, 32px)',
              boxShadow: 'var(--shadow)',
            }}
          >
            {activeTab === 'transliteration' && <TransliterationTool />}
            {activeTab === 'practice' && <WritingPractice />}
            {activeTab === 'archive' && <HeritageArchive />}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
