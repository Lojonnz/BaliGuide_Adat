import { useState } from 'react';
import { Box, BookOpen, Image as ImageIcon, X, Download, Share2, Search } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { heritageItems } from '../../data';
import type { HeritageItem } from '../../types';

type FilterType = 'all' | '3d-model' | 'lontar' | 'photo';

export function HeritageArchive() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<HeritageItem | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const getTypeIcon = (type: HeritageItem['type']) => {
    switch (type) {
      case '3d-model': return <Box size={20} />;
      case 'lontar': return <BookOpen size={20} />;
      case 'photo': return <ImageIcon size={20} />;
    }
  };

  const getTypeBadgeColor = (type: HeritageItem['type']) => {
    switch (type) {
      case '3d-model': return { bg: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)' };
      case 'lontar': return { bg: 'rgba(245, 158, 11, 0.1)', color: 'rgb(245, 158, 11)' };
      case 'photo': return { bg: 'rgba(107, 114, 128, 0.1)', color: 'rgb(107, 114, 128)' };
    }
  };

  const getTypeLabel = (type: HeritageItem['type']) => {
    switch (type) {
      case '3d-model': return t('3D Model', 'Model 3D');
      case 'lontar': return t('Lontar', 'Lontar');
      case 'photo': return t('Photo', 'Foto');
    }
  };

  const filteredItems = heritageItems.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descriptionId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--color-text)',
        margin: 0
      }}>
        {t('Heritage Archive', 'Arsip Warisan')}
      </h3>

      {/* Search bar */}
      <div style={{ position: 'relative' }}>
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('Search archive...', 'Cari arsip...')}
          style={{
            width: '100%',
            padding: '0.75rem 0.75rem 0.75rem 2.75rem',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: '1rem',
            color: 'var(--color-text)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filter buttons */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {(['all', '3d-model', 'lontar', 'photo'] as FilterType[]).map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filter === filterType ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === filterType ? 'white' : 'var(--color-text)',
              border: filter === filterType ? 'none' : '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              minHeight: '44px',
            }}
          >
            {filterType === 'all'
              ? t('All', 'Semua')
              : getTypeLabel(filterType as HeritageItem['type'])}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div style={{
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)'
      }}>
        {filteredItems.length} {t('items', 'item')}
      </div>

      {/* Grid of cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {filteredItems.map(item => {
          const typeColors = getTypeBadgeColor(item.type);
          const isExpanded = expandedDescriptions.has(item.id);
          const description = lang === 'en' ? item.description : item.descriptionId;
          const title = lang === 'en' ? item.title : item.titleId;

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
              }}
            >
              {/* Placeholder image */}
              <div style={{
                width: '100%',
                height: '160px',
                backgroundColor: typeColors.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: typeColors.color,
              }}>
                {getTypeIcon(item.type)}
              </div>

              {/* Card content */}
              <div style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                flex: 1,
              }}>
                {/* Type badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: typeColors.bg,
                  color: typeColors.color,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  alignSelf: 'flex-start',
                }}>
                  {getTypeIcon(item.type)}
                  {getTypeLabel(item.type)}
                </div>

                {/* Title */}
                <h4 style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--color-text)',
                }}>
                  {title}
                </h4>

                {/* Description */}
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5,
                }}>
                  {isExpanded ? description : truncateText(description)}
                  {description.length > 100 && (
                    <button
                      onClick={() => toggleDescription(item.id)}
                      style={{
                        marginLeft: '0.25rem',
                        color: 'var(--color-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      {isExpanded ? t('show less', 'sembunyikan') : t('read more', 'baca lebih')}
                    </button>
                  )}
                </p>

                {/* Metadata */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  marginTop: 'auto',
                }}>
                  <div>{item.owner}</div>
                  <div>{item.year}</div>
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: 'var(--radius-sm)',
                    alignSelf: 'flex-start',
                    fontFamily: 'monospace',
                  }}>
                    {item.license}
                  </div>
                </div>

                {/* View details button */}
                <button
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    minHeight: '44px',
                    marginTop: '0.5rem',
                  }}
                >
                  {t('View Details', 'Lihat Detail')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results */}
      {filteredItems.length === 0 && (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          {t('No items found', 'Tidak ada item ditemukan')}
        </div>
      )}

      {/* Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--color-text)'
              }}>
                {lang === 'en' ? selectedItem.title : selectedItem.titleId}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '1.5rem' }}>
              {/* Large placeholder image */}
              <div style={{
                width: '100%',
                height: '300px',
                backgroundColor: getTypeBadgeColor(selectedItem.type).bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius)',
                marginBottom: '1.5rem',
                color: getTypeBadgeColor(selectedItem.type).color,
              }}>
                <div style={{ transform: 'scale(3)' }}>
                  {getTypeIcon(selectedItem.type)}
                </div>
              </div>

              {/* Full description */}
              <p style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                color: 'var(--color-text)',
                lineHeight: 1.6,
              }}>
                {lang === 'en' ? selectedItem.description : selectedItem.descriptionId}
              </p>

              {/* Metadata grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '0.5rem 1rem',
                fontSize: '0.875rem',
                padding: '1rem',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius)',
                marginBottom: '1rem',
              }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                  {t('Type:', 'Tipe:')}
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  {getTypeLabel(selectedItem.type)}
                </div>

                <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                  {t('Owner:', 'Pemilik:')}
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  {selectedItem.owner}
                </div>

                <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                  {t('Year:', 'Tahun:')}
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  {selectedItem.year}
                </div>

                <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                  {t('License:', 'Lisensi:')}
                </div>
                <div style={{
                  color: 'var(--color-text-muted)',
                  fontFamily: 'monospace'
                }}>
                  {selectedItem.license}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
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
                  <Download size={16} />
                  {t('Download', 'Unduh')}
                </button>
                <button
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    minHeight: '44px',
                  }}
                >
                  <Share2 size={16} />
                  {t('Share', 'Bagikan')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
