import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { TransliterationTool } from '../components/pelestari/TransliterationTool';
import { WritingPractice } from '../components/pelestari/WritingPractice';
import { HeritageArchive } from '../components/pelestari/HeritageArchive';

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
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
      }}>
        {/* Page header */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--color-text)',
            margin: '0 0 0.5rem 0',
          }}>
            {t('Gate 3: Pelestari', 'Gerbang 3: Pelestari')}
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}>
            {t(
              'Script & Heritage Preservation',
              'Pelestarian Aksara & Warisan'
            )}
          </p>
        </header>

        {/* Tab navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '2px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '500',
                minHeight: '44px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {t(tab.labelEn, tab.labelId)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius)',
          padding: '2rem 1rem',
          boxShadow: 'var(--shadow)',
        }}>
          {activeTab === 'transliteration' && <TransliterationTool />}
          {activeTab === 'practice' && <WritingPractice />}
          {activeTab === 'archive' && <HeritageArchive />}
        </div>
      </div>
    </div>
  );
}
