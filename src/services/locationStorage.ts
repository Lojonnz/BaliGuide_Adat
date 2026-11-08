import { useState, useEffect } from 'react';
import type { TempleZone } from '../types';
import { temples as defaultTemples } from '../data';

const STORAGE_KEY = 'baliguide_temple_locations_v1';
const EVENT_KEY = 'baliguide_temple_locations_changed';

/**
 * Validates whether coordinates fall approximately within the Bali province bounding box.
 * Latitude roughly between -9.10 and -8.00
 * Longitude roughly between 114.40 and 115.80
 */
export function isBaliCoordinate(lat: number, lng: number): boolean {
  return lat >= -9.1 && lat <= -8.0 && lng >= 114.4 && lng <= 115.8;
}

/**
 * Retrieve saved temples from localStorage, falling back to default seed data.
 */
export function getStoredTemples(): TempleZone[] {
  if (typeof window === 'undefined') {
    return defaultTemples;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultTemples;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to read temples from localStorage, using defaults:', error);
  }
  return defaultTemples;
}

/**
 * Persist temples list to localStorage and dispatch custom change event.
 */
export function saveStoredTemples(temples: TempleZone[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(temples));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: temples }));
  } catch (error) {
    console.error('Failed to save temples to localStorage:', error);
  }
}

/**
 * Add or update a temple location.
 */
export function upsertTemple(temple: TempleZone): TempleZone[] {
  const current = getStoredTemples();
  const existingIdx = current.findIndex((item) => item.id === temple.id);
  let updated: TempleZone[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = temple;
  } else {
    updated = [...current, temple];
  }
  saveStoredTemples(updated);
  return updated;
}

/**
 * Delete a temple location by id.
 */
export function deleteTemple(id: string): TempleZone[] {
  const current = getStoredTemples();
  const updated = current.filter((item) => item.id !== id);
  saveStoredTemples(updated);
  return updated;
}

/**
 * Reset stored locations to original default seed data.
 */
export function resetTemplesToDefault(): TempleZone[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  saveStoredTemples(defaultTemples);
  return defaultTemples;
}

/**
 * React hook to access and subscribe to real-time changes in temple locations.
 */
export function useTempleLocations(): {
  temples: TempleZone[];
  saveTemple: (temple: TempleZone) => void;
  removeTemple: (id: string) => void;
  resetDefaults: () => void;
} {
  const [temples, setTemples] = useState<TempleZone[]>(() => getStoredTemples());

  useEffect(() => {
    // Sync if localStorage changes in another tab or component
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setTemples(getStoredTemples());
      }
    };

    const handleCustomChange = (event: Event) => {
      const customEvent = event as CustomEvent<TempleZone[]>;
      if (customEvent.detail) {
        setTemples(customEvent.detail);
      } else {
        setTemples(getStoredTemples());
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(EVENT_KEY, handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(EVENT_KEY, handleCustomChange);
    };
  }, []);

  const saveTemple = (temple: TempleZone) => {
    const updated = upsertTemple(temple);
    setTemples(updated);
  };

  const removeTemple = (id: string) => {
    const updated = deleteTemple(id);
    setTemples(updated);
  };

  const resetDefaults = () => {
    const reset = resetTemplesToDefault();
    setTemples(reset);
  };

  return {
    temples,
    saveTemple,
    removeTemple,
    resetDefaults,
  };
}
