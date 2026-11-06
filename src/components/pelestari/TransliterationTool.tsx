import { useState, useRef } from 'react';
import { Info, Copy, ArrowLeftRight } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { aksaraMappings } from '../../data';

type Direction = 'latin-to-aksara' | 'aksara-to-latin';

export function TransliterationTool() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState<Direction>('latin-to-aksara');
  const [showReference, setShowReference] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Convert Latin to Aksara Bali
  const latinToAksara = (text: string): string => {
    let result = '';
    let i = 0;
    const lowerText = text.toLowerCase();

    while (i < lowerText.length) {
      let matched = false;

      // Try matching 3-char patterns first, then 2-char, then 1-char
      for (let len = 3; len >= 1; len--) {
        const substr = lowerText.substring(i, i + len);
        const mapping = aksaraMappings.find(m => m.latin === substr);

        if (mapping) {
          result += mapping.aksara;
          i += len;
          matched = true;
          break;
        }
      }

      // If no match found, keep the original character (spaces, punctuation, etc)
      if (!matched) {
        result += text[i];
        i++;
      }
    }

    return result;
  };

  // Convert Aksara Bali to Latin
  const aksaraToLatin = (text: string): string => {
    let result = '';

    for (const char of text) {
      const mapping = aksaraMappings.find(m => m.aksara === char);
      if (mapping) {
        result += mapping.latin;
      } else {
        result += char; // Keep spaces and other characters
      }
    }

    return result;
  };

  const handleInputChange = (value: string) => {
    setInput(value);

    if (direction === 'latin-to-aksara') {
      setOutput(latinToAksara(value));
    } else {
      setOutput(aksaraToLatin(value));
    }
  };

  const toggleDirection = () => {
    const newDirection = direction === 'latin-to-aksara' ? 'aksara-to-latin' : 'latin-to-aksara';
    setDirection(newDirection);

    // Swap input and output
    const newInput = output;
    const newOutput = input;
    setInput(newInput);
    setOutput(newOutput);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with direction toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'var(--color-text)',
          margin: 0
        }}>
          {t('Transliteration Tool', 'Alat Transliterasi')}
        </h3>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={toggleDirection}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              minHeight: '44px',
            }}
          >
            <ArrowLeftRight size={16} />
            {direction === 'latin-to-aksara'
              ? t('Latin → Aksara', 'Latin → Aksara')
              : t('Aksara → Latin', 'Aksara → Latin')}
          </button>

          <button
            onClick={() => setShowReference(!showReference)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              color: 'var(--color-text)',
            }}
            aria-label={t('Show reference', 'Tampilkan referensi')}
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Conversion areas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem',
      }}>
        <div style={{ display: 'contents' }}>
          {/* Input area */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label htmlFor="transliteration-input" style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text)'
            }}>
              {direction === 'latin-to-aksara'
                ? t('Latin Script', 'Tulisan Latin')
                : t('Aksara Bali', 'Aksara Bali')}
            </label>
            <textarea
              id="transliteration-input"
              aria-describedby="transliteration-input-count"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={direction === 'latin-to-aksara'
                ? t('Type in Latin...', 'Ketik dalam Latin...')
                : t('Type in Aksara Bali...', 'Ketik dalam Aksara Bali...')}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '0.75rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                fontFamily: direction === 'latin-to-aksara' ? 'monospace' : 'inherit',
                color: 'var(--color-text)',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <div id="transliteration-input-count" aria-live="polite" style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)'
            }}>
              {input.length} {t('characters', 'karakter')}
            </div>
          </div>

          {/* Output area */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label htmlFor="transliteration-output" style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text)'
            }}>
              {direction === 'latin-to-aksara'
                ? t('Aksara Bali', 'Aksara Bali')
                : t('Latin Script', 'Tulisan Latin')}
            </label>
            <div
              id="transliteration-output"
              ref={outputRef}
              role="status"
              aria-live="polite"
              aria-label={t('Transliteration output', 'Hasil transliterasi')}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '0.75rem',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '1.25rem',
                fontFamily: direction === 'aksara-to-latin' ? 'monospace' : 'inherit',
                color: 'var(--color-text)',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                boxSizing: 'border-box',
              }}
            >
              {output || t('Output will appear here...', 'Hasil akan muncul di sini...')}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)'
              }}>
                {output.length} {t('characters', 'karakter')}
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!output}
                aria-disabled={!output}
                aria-label={t('Copy output to clipboard', 'Salin hasil ke papan klip')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: output ? 'var(--color-amber)' : 'var(--color-surface)',
                  color: output ? '#1F2937' : 'var(--color-text-muted)',
                  border: '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  cursor: output ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  minHeight: '44px',
                }}
              >
                <Copy size={14} />
                {t('Copy', 'Salin')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reference modal/panel */}
      {showReference && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--color-text)'
          }}>
            {t('Character Reference', 'Referensi Karakter')}
          </h4>

          {['wianjana', 'suara', 'numeral', 'sign'].map(category => {
            const items = aksaraMappings.filter(m => m.category === category);
            if (items.length === 0) return null;

            const categoryLabel = {
              wianjana: t('Consonants (Wianjana)', 'Konsonan (Wianjana)'),
              suara: t('Vowels (Suara)', 'Vokal (Suara)'),
              numeral: t('Numerals', 'Angka'),
              sign: t('Signs', 'Tanda'),
            }[category];

            return (
              <div key={category} style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--color-terracotta)',
                  marginBottom: '0.5rem'
                }}>
                  {categoryLabel}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: '0.5rem'
                }}>
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div style={{
                        fontSize: '1.5rem',
                        marginBottom: '0.25rem',
                        color: 'var(--color-text)'
                      }}>
                        {item.aksara}
                      </div>
                      <div style={{
                        color: 'var(--color-text-muted)',
                        fontFamily: 'monospace'
                      }}>
                        {item.latin}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
