import { useState, useEffect, useCallback, useRef } from 'react';

export function useFormData(eventId, formType, defaultData = {}) {
  const key = `nsh-events-${eventId}-${formType}`;

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? { ...defaultData, ...JSON.parse(saved) } : { ...defaultData };
    } catch {
      return { ...defaultData };
    }
  });

  const [saveStatus, setSaveStatus] = useState('saved');
  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  const updateField = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    setSaveStatus('unsaved');
  }, []);

  const updateNestedField = useCallback((parentField, index, childField, value) => {
    setData(prev => {
      const arr = [...(prev[parentField] || [])];
      arr[index] = { ...arr[index], [childField]: value };
      return { ...prev, [parentField]: arr };
    });
    setSaveStatus('unsaved');
  }, []);

  const addToArray = useCallback((field, item) => {
    setData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), item],
    }));
    setSaveStatus('unsaved');
  }, []);

  const removeFromArray = useCallback((field, index) => {
    setData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
    setSaveStatus('unsaved');
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to save form data:', err);
        setSaveStatus('error');
      }
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, key]);

  return { data, updateField, updateNestedField, addToArray, removeFromArray, saveStatus };
}
