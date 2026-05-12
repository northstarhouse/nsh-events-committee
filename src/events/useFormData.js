import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

function mergeWithDefaults(defaultData, savedData) {
  if (!savedData) return defaultData;
  if (Array.isArray(defaultData)) {
    return Array.isArray(savedData) && savedData.length > 0 ? savedData : defaultData;
  }
  if (typeof defaultData === 'object' && defaultData !== null) {
    const result = { ...defaultData };
    if (savedData && typeof savedData === 'object') {
      Object.keys(savedData).forEach(k => {
        result[k] = mergeWithDefaults(defaultData[k], savedData[k]);
      });
    }
    return result;
  }
  return savedData !== undefined ? savedData : defaultData;
}

export function useFormData(eventId, formType, defaultData = {}) {
  const lsKey = `nsh-events-${eventId}-${formType}`;

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(lsKey);
      return saved ? mergeWithDefaults(defaultData, JSON.parse(saved)) : { ...defaultData };
    } catch {
      return { ...defaultData };
    }
  });

  const [saveStatus, setSaveStatus] = useState('loading');
  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);
  const hydratingRef = useRef(false);
  const localChangeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setSaveStatus('loading');

    supabase
      .from('event_forms')
      .select('data')
      .eq('event_id', eventId)
      .eq('form_type', formType)
      .maybeSingle()
      .then(({ data: row, error }) => {
        if (cancelled || localChangeRef.current) return;
        if (error) { setSaveStatus('error'); return; }
        if (row?.data) {
          hydratingRef.current = true;
          const merged = mergeWithDefaults(defaultData, row.data);
          setData(merged);
          try { localStorage.setItem(lsKey, JSON.stringify(merged)); } catch {}
        }
        setSaveStatus('saved');
      });

    return () => { cancelled = true; };
  }, [eventId, formType]); // eslint-disable-line react-hooks/exhaustive-deps

  const persistAll = useCallback(async (payload, { silent = false } = {}) => {
    if (!silent) setSaveStatus('saving');
    try { localStorage.setItem(lsKey, JSON.stringify(payload)); } catch {}
    const { error } = await supabase
      .from('event_forms')
      .upsert({ event_id: eventId, form_type: formType, data: payload, updated_at: new Date().toISOString() });
    if (error) { setSaveStatus('error'); return false; }
    setSaveStatus('saved');
    return true;
  }, [eventId, formType, lsKey]);

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
    setData(prev => ({ ...prev, [field]: [...(prev[field] || []), item] }));
    setSaveStatus('unsaved');
  }, []);

  const removeFromArray = useCallback((field, index) => {
    localChangeRef.current = true;
    setData(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }));
    setSaveStatus('unsaved');
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (hydratingRef.current) { hydratingRef.current = false; return; }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => persistAll(data, { silent: true }), 500);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [data, persistAll]);

  const saveNow = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return await persistAll(data);
  }, [data, persistAll]);

  return { data, updateField, updateNestedField, addToArray, removeFromArray, saveStatus, saveNow };
}
