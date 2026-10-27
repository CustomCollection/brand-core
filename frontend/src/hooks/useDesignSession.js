'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { DESIGN_ENDPOINTS } from '@/lib/designEndpoints';

/**
 * useDesignSession hook
 * Manages full lifecycle of an active design editor session:
 * - Session data retrieval
 * - Category details, available colors, sizes, printing methods
 * - Per-placement canvas state across the 6 placements (fr, bk, lp, rp, ls, rs)
 * - Live metrics (width, height, dpi, quality, angle)
 * - Autosave & manual save
 */
export default function useDesignSession(sessionId) {
  const [session, setSession] = useState(null);
  const [category, setCategory] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPrintingMethod, setSelectedPrintingMethod] = useState(null);
  const [activePlacement, setActivePlacement] = useState('fr');

  // Per-placement canvas & design states
  const [placementsState, setPlacementsState] = useState({
    fr: { hasArtwork: false, canvasJson: null, widthInches: 0, heightInches: 0, dpi: 300, qualityRating: 'Good', rotationAngle: 0, previewUrl: '' },
    bk: { hasArtwork: false, canvasJson: null, widthInches: 0, heightInches: 0, dpi: 300, qualityRating: 'Good', rotationAngle: 0, previewUrl: '' },
    lp: { hasArtwork: false, canvasJson: null, widthInches: 0, heightInches: 0, dpi: 300, qualityRating: 'Good', rotationAngle: 0, previewUrl: '' },
    rp: { hasArtwork: false, canvasJson: null, widthInches: 0, heightInches: 0, dpi: 300, qualityRating: 'Good', rotationAngle: 0, previewUrl: '' },
    ls: { hasArtwork: false, canvasJson: null, widthInches: 0, heightInches: 0, dpi: 300, qualityRating: 'Good', rotationAngle: 0, previewUrl: '' },
    rs: { hasArtwork: false, canvasJson: null, widthInches: 0, heightInches: 0, dpi: 300, qualityRating: 'Good', rotationAngle: 0, previewUrl: '' },
  });

  const [activeMetrics, setActiveMetrics] = useState({
    widthInches: 0,
    heightInches: 0,
    dpi: 300,
    qualityRating: 'Good',
    rotationAngle: 0,
    hasArtwork: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'saving' | 'error' | null
  const [error, setError] = useState(null);

  // Load session from backend
  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet(DESIGN_ENDPOINTS.DESIGNER.SESSION_DETAIL(sessionId));
      setSession(data);
      if (data.category_detail) {
        setCategory(data.category_detail);
      }
      if (data.selected_color_detail) {
        setSelectedColor(data.selected_color_detail);
      } else if (data.category_detail?.default_color) {
        setSelectedColor(data.category_detail.default_color);
      } else if (data.category_detail?.colors?.length > 0) {
        setSelectedColor(data.category_detail.colors[0]);
      }

      if (data.selected_size_detail) {
        setSelectedSize(data.selected_size_detail);
      } else if (data.category_detail?.sizes?.length > 0) {
        setSelectedSize(data.category_detail.sizes[0]);
      }

      if (data.selected_printing_method_detail) {
        setSelectedPrintingMethod(data.selected_printing_method_detail);
      } else if (data.category_detail?.printing_methods?.length > 0) {
        setSelectedPrintingMethod(data.category_detail.printing_methods[0]);
      }

      // Populate existing placement data
      if (data.placements && Array.isArray(data.placements)) {
        setPlacementsState((prev) => {
          const next = { ...prev };
          data.placements.forEach((p) => {
            if (next[p.placement]) {
              next[p.placement] = {
                ...next[p.placement],
                hasArtwork: p.has_artwork,
                canvasJson: p.canvas_json,
                widthInches: parseFloat(p.width_inches) || 0,
                heightInches: parseFloat(p.height_inches) || 0,
                dpi: p.dpi || 300,
                qualityRating: p.quality_rating || 'Good',
                rotationAngle: p.rotation_angle || 0,
                previewUrl: p.preview_mockup_url || '',
                designImageUrl: p.design_image_url || '',
                designCode: p.design_code || '',
              };
            }
          });
          return next;
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load design session.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Update metrics when placement changes
  useEffect(() => {
    const current = placementsState[activePlacement];
    if (current) {
      setActiveMetrics({
        widthInches: current.widthInches,
        heightInches: current.heightInches,
        dpi: current.dpi,
        qualityRating: current.qualityRating,
        rotationAngle: current.rotationAngle,
        hasArtwork: current.hasArtwork,
      });
    }
  }, [activePlacement, placementsState]);

  // Callback from FabricCanvas whenever objects are moved, scaled, rotated, or modified
  const updatePlacementMetrics = useCallback(
    (placementCode, metrics) => {
      setPlacementsState((prev) => {
        const updated = {
          ...prev,
          [placementCode]: {
            ...prev[placementCode],
            ...metrics,
          },
        };
        return updated;
      });

      if (placementCode === activePlacement) {
        setActiveMetrics((prev) => ({
          ...prev,
          ...metrics,
        }));
      }
    },
    [activePlacement]
  );

  // Save session payload to backend
  const saveSession = useCallback(async () => {
    if (!sessionId) return;
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const placementsPayload = Object.keys(placementsState).map((code) => {
        const item = placementsState[code];
        return {
          placement: code,
          has_artwork: !!item.hasArtwork,
          canvas_json: item.canvasJson || {},
          design_image_url: item.designImageUrl || '',
          preview_mockup_url: item.previewUrl || '',
          width_inches: item.widthInches || 0,
          height_inches: item.heightInches || 0,
          dpi: item.dpi || 300,
          rotation_angle: item.rotationAngle || 0,
          quality_rating: item.qualityRating || 'Good',
        };
      });

      const payload = {
        selected_color: selectedColor?.id || null,
        selected_size: selectedSize?.id || null,
        selected_printing_method: selectedPrintingMethod?.id || null,
        placements: placementsPayload,
      };

      const res = await apiPost(DESIGN_ENDPOINTS.DESIGNER.SESSION_SAVE(sessionId), payload);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3500);
      return res;
    } catch (err) {
      setSaveStatus('error');
      setError(err.message || 'Failed to save design.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, placementsState, selectedColor, selectedSize, selectedPrintingMethod]);

  // Upload an image asset to the backend
  const uploadArtworkFile = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiPost(DESIGN_ENDPOINTS.DESIGNER.UPLOAD_ASSET, formData);
  }, []);

  return {
    session,
    category,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedPrintingMethod,
    setSelectedPrintingMethod,
    activePlacement,
    setActivePlacement,
    placementsState,
    activeMetrics,
    updatePlacementMetrics,
    isLoading,
    isSaving,
    saveStatus,
    error,
    saveSession,
    uploadArtworkFile,
    reloadSession: loadSession,
  };
}
