import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      console.log(`💾 Guardando en localStorage [${key}]:`, valueToStore);
      
      // Actualizar el estado
      setStoredValue(valueToStore);
      
      // Verificar que localStorage esté disponible
      if (typeof window === 'undefined' || typeof Storage === 'undefined') {
        console.warn('⚠️ localStorage no disponible');
        return;
      }

      // Guardar en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      console.log(`✅ Guardado exitoso en localStorage [${key}]`);
      
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      
      // Manejar quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        // Limpiar datos temporales
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('temp_') || k.startsWith('cache_'))) {
            keysToRemove.push(k);
          }
        }
        
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        // Intentar guardar nuevamente
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (retryError) {
          alert('Error: No se pudo guardar la información. El almacenamiento está lleno.');
        }
      }
    }
  };

  return [storedValue, setValue] as const;
}