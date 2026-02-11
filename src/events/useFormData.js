import { useState, useEffect, useCallback, useRef } from 'react';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

export function useFormData(eventId, formType, defaultData = {}) {
  const key = `nsh-events-${eventId}-${formType}`;
  const remoteEnabled = Boolean(GOOGLE_SCRIPT_URL);

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? { ...defaultData, ...JSON.parse(saved) } : { ...defaultData };
    } catch {
      return { ...defaultData };
    }
  });

  const [saveStatus, setSaveStatus] = useState(remoteEnabled ? 'loading' : 'saved');
  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);
  const hydratingRef = useRef(false);
  const localChangeRef = useRef(false);

  const persistToLocal = useCallback((payload) => {
    try {
      localStorage.setItem(key, JSON.stringify(payload));
      return true;
    } catch (err) {
      console.error('Failed to save form data locally:', err);
      return false;
    }
  }, [key]);

  const persistToRemote = useCallback(async (payload) => {
    if (!remoteEnabled) return true;
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveFormData',
          eventId,
          formType,
          data: payload,
        }),
      });
      const result = await response.json();
      return Boolean(result && result.success);
    } catch (err) {
      console.error('Failed to save form data to Google Sheets:', err);
      return false;
    }
  }, [eventId, formType, remoteEnabled]);

  const persistAll = useCallback(async (payload, { silent = false } = {}) => {
    if (!silent) setSaveStatus('saving');
    const localOk = persistToLocal(payload);
    const remoteOk = await persistToRemote(payload);
    if (localOk && remoteOk) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('error');
    }
  }, [persistToLocal, persistToRemote]);

  const updateField = useCallback((field, value) => {
    localChangeRef.current = true;
    setData(prev => ({ ...prev, [field]: value }));
    setSaveStatus('unsaved');
  }, []);

  const updateNestedField = useCallback((parentField, index, childField, value) => {
    localChangeRef.current = true;
    setData(prev => {
      const arr = [...(prev[parentField] || [])];
      arr[index] = { ...arr[index], [childField]: value };
      return { ...prev, [parentField]: arr };
    });
    setSaveStatus('unsaved');
  }, []);

  const addToArray = useCallback((field, item) => {
    localChangeRef.current = true;
    setData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), item],
    }));
    setSaveStatus('unsaved');
  }, []);

  const removeFromArray = useCallback((field, index) => {
    localChangeRef.current = true;
    setData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
    setSaveStatus('unsaved');
  }, []);

  useEffect(() => {
    if (!remoteEnabled) return;

    let cancelled = false;
    const controller = new AbortController();

    const loadRemote = async () => {
      setSaveStatus('loading');
      try {
        const params = new URLSearchParams({
          action: 'getFormData',
          eventId: String(eventId),
          formType,
        });
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!result || !result.success) throw new Error(result?.error || 'Load failed');
        if (cancelled || localChangeRef.current) return;
        hydratingRef.current = true;
        const merged = { ...defaultData, ...(result.data || {}) };
        setData(merged);
        persistToLocal(merged);
        setSaveStatus('saved');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load form data from Google Sheets:', err);
          setSaveStatus('error');
        }
      }
    };

    loadRemote();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [eventId, formType, remoteEnabled, defaultData, persistToLocal]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (hydratingRef.current) {
      hydratingRef.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      persistAll(data, { silent: true });
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, persistAll]);

  const saveNow = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    persistAll(data);
  }, [data, persistAll]);

  return { data, updateField, updateNestedField, addToArray, removeFromArray, saveStatus, saveNow };
}
