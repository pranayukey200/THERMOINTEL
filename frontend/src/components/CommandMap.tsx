import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibreFallback from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPoint, TargetLocation } from '../types';
import { useLanguage } from '../context/LanguageContext';

const maplibregl = typeof window !== 'undefined' && (window as any).maplibregl
  ? (window as any).maplibregl
  : maplibreFallback;

const MapLibreMap = maplibregl.Map;
const NavigationControl = maplibregl.NavigationControl;
const ScaleControl = maplibregl.ScaleControl;
const Popup = maplibregl.Popup;
const Marker = maplibregl.Marker;
type MapInstance = any;
type PopupInstance = any;
type MarkerInstance = any;
type GeoJSONSource = any;
import {
  Compass,
  Layers,
  Map as MapIcon,
  Globe,
  Radio,
  Eye,
  ShieldAlert
} from 'lucide-react';

interface CommandMapProps {
  points: MapPoint[];
  selectedSourceId: number | null;
  onSelectSource: (sourceId: number) => void;
  isLoading: boolean;
  showHeatmapExternal?: boolean;
  onToggleHeatmap?: (val: boolean) => void;
  selectedRiskBand?: string;
  onSelectRiskBand?: (band: string) => void;
  targetLocation?: TargetLocation | null;
  onResetLocation?: () => void;
  showHazardZones?: boolean;
  clusterSourceIds?: number[];
}

type BasemapMode = 'satellite' | 'standard';

// Helper to generate geodesic circle coordinates
function generateGeodesicCircle(center: [number, number], radiusMeters: number, steps: number = 64): [number, number][] {
  const [lon, lat] = center;
  const coords: [number, number][] = [];
  const km = radiusMeters / 1000;
  const distanceX = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lon + x, lat + y]);
  }
  coords.push(coords[0]);
  return coords;
}

// Classification Color Palette:
// Orange: Industrial Fire | Red: Wildfire | Yellow: Agricultural Burning | Violet: Mining Thermal | Green: Unlabeled/Uncertain | White: Needs Review
export const getClassificationColor = (classification?: string): string => {
  if (!classification) return '#22C55E';
  const c = classification.toLowerCase();
  if (c.includes('industrial fire')) return '#F97316'; // orange
  if (c.includes('wildfire') || c.includes('forest')) return '#EF4444'; // red
  if (c.includes('agricultural') || c.includes('burn')) return '#EAB308'; // yellow
  if (c.includes('mining')) return '#8B5CF6'; // violet
  if (c.includes('flare') || c.includes('review')) return '#FFFFFF'; // white (needs review / gas flare)
  if (c.includes('persistent industrial')) return '#F97316'; // orange
  if (c.includes('uncertain') || c.includes('low evidence') || c.includes('unlabeled')) return '#22C55E'; // green
  return '#22C55E';
};

// Export explicit Color Name helper ("Classification Name — Color")
export const getClassificationColorName = (classification?: string): string => {
  if (!classification) return 'Green';
  const c = classification.toLowerCase();
  if (c.includes('industrial fire')) return 'Orange';
  if (c.includes('wildfire') || c.includes('forest')) return 'Red';
  if (c.includes('agricultural') || c.includes('burn')) return 'Yellow';
  if (c.includes('mining')) return 'Violet';
  if (c.includes('flare') || c.includes('review')) return 'White';
  if (c.includes('persistent industrial')) return 'Orange';
  if (c.includes('uncertain') || c.includes('low evidence') || c.includes('unlabeled')) return 'Green';
  return 'Green';
};

// Helper expressions for thermal circles:
// All hotspot points are visible across India:
// Baseline / uncertain green dots are cleanly visible (0.65 opacity) with a subtle border,
// while active emergency classes (industrial orange, wildfire red, agricultural yellow, mining violet, flare white)
// pop with full 0.95 opacity and prominent size.
export const getThermalCircleOpacity = (heatmap: boolean): any => [
  'case',
  ['==', ['coalesce', ['get', 'classification_color'], ''], '#22C55E'],
  heatmap ? 0.2 : 0.65,
  ['in', ['get', 'classification'], ['literal', ['Uncertain / Low Evidence', 'Unlabeled', 'Low Evidence']]],
  heatmap ? 0.2 : 0.65,
  heatmap ? 0.45 : 0.95
];

export const getThermalCircleStrokeOpacity = (): any => [
  'case',
  ['==', ['coalesce', ['get', 'classification_color'], ''], '#22C55E'],
  0.5,
  ['in', ['get', 'classification'], ['literal', ['Uncertain / Low Evidence', 'Unlabeled', 'Low Evidence']]],
  0.5,
  0.95
];

export const getThermalCircleStrokeWidth = (): any => [
  'case',
  ['==', ['coalesce', ['get', 'classification_color'], ''], '#22C55E'],
  1.0,
  ['in', ['get', 'classification'], ['literal', ['Uncertain / Low Evidence', 'Unlabeled', 'Low Evidence']]],
  1.0,
  1.5
];

export const getThermalCircleRadius = (): any => [
  'interpolate',
  ['linear'],
  ['zoom'],
  2,
  ['case', ['==', ['coalesce', ['get', 'classification_color'], ''], '#22C55E'], 2.6, 4.0],
  5,
  ['case', ['==', ['coalesce', ['get', 'classification_color'], ''], '#22C55E'], 3.8, 6.5],
  8,
  ['case', ['==', ['coalesce', ['get', 'classification_color'], ''], '#22C55E'], 5.8, 9.5],
  12,
  ['case', ['==', ['coalesce', ['get', 'classification_color'], ''], '#22C55E'], 9.5, 15.0],
  16,
  ['case', ['==', ['coalesce', ['get', 'classification_color'], ''], '#22C55E'], 14.0, 22.0]
];

// Unified Basemap Style with pre-mounted raster basemaps for instant switching without layer loss
const UNIFIED_STYLE: any = {
  version: 8,
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: '&copy; Esri World Imagery'
    },
    'esri-labels': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: '&copy; Esri World Boundaries and Places'
    },
    'osm-standard': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'basemap-satellite',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19,
      layout: { visibility: 'visible' }
    },
    {
      id: 'basemap-labels',
      type: 'raster',
      source: 'esri-labels',
      minzoom: 0,
      maxzoom: 19,
      layout: { visibility: 'visible' }
    },
    {
      id: 'basemap-standard',
      type: 'raster',
      source: 'osm-standard',
      minzoom: 0,
      maxzoom: 19,
      layout: { visibility: 'none' }
    }
  ]
};

export const CommandMap: React.FC<CommandMapProps> = ({
  points,
  selectedSourceId,
  onSelectSource,
  isLoading,
  showHeatmapExternal,
  onToggleHeatmap,
  selectedRiskBand = '',
  onSelectRiskBand,
  targetLocation,
  onResetLocation,
  showHazardZones = true,
  clusterSourceIds = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const hoverPopupRef = useRef<PopupInstance | null>(null);
  const targetMarkerRef = useRef<MarkerInstance | null>(null);
  const isFlyingRef = useRef<boolean>(false);

  const { t } = useLanguage();
  const [basemap, setBasemap] = useState<BasemapMode>('satellite');
  const [isGlobe, setIsGlobe] = useState<boolean>(false);
  const [is3DTilt, setIs3DTilt] = useState<boolean>(false);
  const [internalHeatmap, setInternalHeatmap] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lon: number; zoom: number }>({
    lat: 22.5000,
    lon: 82.0000,
    zoom: 4.6
  });

  const showHeatmap = showHeatmapExternal !== undefined ? showHeatmapExternal : internalHeatmap;

  const setHeatmapMode = (val: boolean) => {
    if (onToggleHeatmap) {
      onToggleHeatmap(val);
    } else {
      setInternalHeatmap(val);
    }
  };

  // Convert points array to GeoJSON FeatureCollection
  const createGeoJSON = useCallback((): any => {
    if (!Array.isArray(points)) return { type: 'FeatureCollection', features: [] };

    const features: any[] = [];
    points.forEach((pt) => {
      const lat = pt.lat ?? pt.latitude;
      const lon = pt.lon ?? pt.longitude;
      const id = pt.id ?? pt.thermal_source_id;

      if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon) || id === undefined) {
        return;
      }

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties: {
          id,
          risk_band: pt.risk_band,
          risk_score: pt.risk_score || 0,
          classification: pt.classification,
          classification_color: getClassificationColor(pt.classification),
          anomaly_status: pt.anomaly_status,
          mean_frp: pt.mean_frp || 0,
          max_frp: pt.max_frp || 0,
          satellite_status: pt.satellite_evidence_status,
          industrial_score: pt.industrial_context_score || 0
        }
      });
    });

    return { type: 'FeatureCollection', features };
  }, [points]);

  // Generate GeoJSON for Tactical Hazard Buffers around selected source
  const createHazardGeoJSON = useCallback((): any => {
    if (!selectedSourceId || !Array.isArray(points)) {
      return { type: 'FeatureCollection', features: [] };
    }

    const selectedPt = points.find((p) => (p.id ?? p.thermal_source_id) === selectedSourceId);
    if (!selectedPt) return { type: 'FeatureCollection', features: [] };

    const lat = selectedPt.lat ?? selectedPt.latitude;
    const lon = selectedPt.lon ?? selectedPt.longitude;
    if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
      return { type: 'FeatureCollection', features: [] };
    }

    const center: [number, number] = [lon, lat];

    // 500m Primary Blast Cordon, 2000m Toxic Vapor Plume, 5000m Outer Evacuation Zone
    const poly500 = generateGeodesicCircle(center, 500);
    const poly2000 = generateGeodesicCircle(center, 2000);
    const poly5000 = generateGeodesicCircle(center, 5000);

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [poly5000] },
          properties: {
            zone: 'EVACUATION',
            name: 'Contingency Evacuation Staging (5.0 km)',
            radius_m: 5000,
            fill_color: 'rgba(234, 179, 8, 0.08)',
            stroke_color: '#EAB308'
          }
        },
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [poly2000] },
          properties: {
            zone: 'TOXIC_PLUME',
            name: 'Hazardous Vapor Dispersion Cordon (2.0 km)',
            radius_m: 2000,
            fill_color: 'rgba(249, 115, 22, 0.14)',
            stroke_color: '#F97316'
          }
        },
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [poly500] },
          properties: {
            zone: 'BLAST',
            name: 'Primary Thermal Blast Exclusion Perimeter (500 m)',
            radius_m: 500,
            fill_color: 'rgba(239, 68, 68, 0.28)',
            stroke_color: '#EF4444'
          }
        }
      ]
    };
  }, [selectedSourceId, points]);

  // Setup MapLibre Layers
  const setupLayers = useCallback((map: MapInstance) => {
    // 1. Tactical Hazard Buffers Source & Layers (Underneath points)
    if (!map.getSource('hazard-buffers')) {
      map.addSource('hazard-buffers', {
        type: 'geojson',
        data: createHazardGeoJSON()
      });

      map.addLayer({
        id: 'hazard-buffers-fill',
        type: 'fill',
        source: 'hazard-buffers',
        paint: {
          'fill-color': ['get', 'fill_color'],
          'fill-opacity': 0.8
        }
      });

      map.addLayer({
        id: 'hazard-buffers-line',
        type: 'line',
        source: 'hazard-buffers',
        paint: {
          'line-color': ['get', 'stroke_color'],
          'line-width': 1.8,
          'line-dasharray': [3, 2]
        }
      });
    }

    // 2. Thermal Points GeoJSON Source with Dynamic Clustering
    if (!map.getSource('thermal-sources')) {
      const initialData = createGeoJSON();
      console.log('[CommandMap setupLayers] Adding thermal-sources with clustering. Features:', initialData?.features?.length);
      map.addSource('thermal-sources', {
        type: 'geojson',
        data: initialData,
        cluster: true,
        clusterMaxZoom: 11, // At zoom 12+, clusters unpack into individual points
        clusterRadius: 50
      });
    }

    // 2b. Dedicated Unclustered Thermal GeoJSON Source for Continuous GPU Heatmap
    // Essential: MapLibre heatmap layers ignore points inside clusters. By using an unclustered source,
    // all 15,436 thermal points are smoothly rendered across India on the GPU at all zoom levels.
    if (!map.getSource('thermal-heat-source')) {
      const initialData = createGeoJSON();
      map.addSource('thermal-heat-source', {
        type: 'geojson',
        data: initialData,
        cluster: false
      });

      // Heatmap Layer (GPU Accelerated) on unclustered points
      map.addLayer({
        id: 'thermal-heat',
        type: 'heatmap',
        source: 'thermal-heat-source',
        layout: {
          visibility: showHeatmap ? 'visible' : 'none'
        },
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'risk_score'],
            0, 0.25,
            30, 0.5,
            60, 0.9,
            100, 1.5
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.8,
            5, 1.6,
            9, 3.2
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(59, 130, 246, 0)',
            0.15, 'rgba(59, 130, 246, 0.65)',
            0.35, '#10B981',
            0.6, '#F59E0B',
            0.8, '#F97316',
            1.0, '#EF4444'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 12,
            5, 24,
            8, 40,
            12, 60
          ],
          'heatmap-opacity': 0.88
        }
      });
    }

    // Cluster Radiant Outer Halo Layer
    if (!map.getLayer('thermal-clusters-halo')) {
      map.addLayer({
        id: 'thermal-clusters-halo',
        type: 'circle',
        source: 'thermal-sources',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            'rgba(245, 158, 11, 0.25)',
            50,
            'rgba(249, 115, 22, 0.30)',
            200,
            'rgba(239, 68, 68, 0.35)',
            1000,
            'rgba(220, 38, 38, 0.40)'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            26,
            50,
            34,
            200,
            42,
            1000,
            52
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': [
            'step',
            ['get', 'point_count'],
            'rgba(245, 158, 11, 0.8)',
            50,
            'rgba(249, 115, 22, 0.8)',
            200,
            'rgba(239, 68, 68, 0.9)',
            1000,
            'rgba(220, 38, 38, 0.95)'
          ]
        }
      });

      // Clustered Points Layer (Color-coded by cluster density count)
      map.addLayer({
        id: 'thermal-clusters',
        type: 'circle',
        source: 'thermal-sources',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#F59E0B', // amber for < 50 points
            50,
            '#F97316', // orange for 50-200 points
            200,
            '#EF4444', // red for 200-1000 points
            1000,
            '#DC2626'  // deep red for > 1000 points
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            50,
            24,
            200,
            30,
            1000,
            38
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.92
        }
      });

      // Cluster Count Text Label Layer
      map.addLayer({
        id: 'thermal-cluster-count',
        type: 'symbol',
        source: 'thermal-sources',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold'],
          'text-size': 13,
          'text-allow-overlap': true,
          'text-ignore-placement': true
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': 'rgba(0, 0, 0, 0.85)',
          'text-halo-width': 1.5
        }
      });

      // 1. Critical and High-Risk Radiant Outer Beacon Halo (Unclustered individual points)
      map.addLayer({
        id: 'thermal-critical-halo',
        type: 'circle',
        source: 'thermal-sources',
        filter: ['all', ['!', ['has', 'point_count']], ['in', ['get', 'risk_band'], ['literal', ['CRITICAL', 'HIGH']]]],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 7.0,
            5, 11.0,
            8, 16.0,
            12, 24.0,
            16, 36.0
          ],
          'circle-color': [
            'match',
            ['get', 'risk_band'],
            'CRITICAL', 'rgba(239, 68, 68, 0.4)',
            'HIGH', 'rgba(249, 115, 22, 0.35)',
            'rgba(0, 0, 0, 0)'
          ],
          'circle-stroke-color': [
            'match',
            ['get', 'risk_band'],
            'CRITICAL', '#EF4444',
            'HIGH', '#F97316',
            '#EF4444'
          ],
          'circle-stroke-width': 2.0,
          'circle-stroke-opacity': 0.95
        }
      });

      // 2. Base Thermal Hotspots Circles Layer (High-Contrast Stroke - Unclustered individual points)
      map.addLayer({
        id: 'thermal-circles',
        type: 'circle',
        source: 'thermal-sources',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'coalesce',
            ['get', 'classification_color'],
            [
              'match',
              ['get', 'classification'],
              'Industrial Fire', '#F97316',
              'Persistent Industrial Thermal Activity', '#F97316',
              'Wildfire / Forest Fire', '#EF4444',
              'Agricultural Burning', '#EAB308',
              'Mining / Industrial Thermal', '#8B5CF6',
              'Gas Flare', '#FFFFFF',
              'Needs Review', '#FFFFFF',
              'Uncertain / Low Evidence', '#22C55E',
              /* fallback */ '#22C55E'
            ]
          ],
          'circle-radius': getThermalCircleRadius(),
          'circle-stroke-color': [
            'case',
            ['==', ['coalesce', ['get', 'classification_color'], ''], '#FFFFFF'],
            '#000000',
            ['in', ['get', 'classification'], ['literal', ['Gas Flare', 'Needs Review']]],
            '#000000',
            '#FFFFFF'
          ],
          'circle-stroke-width': getThermalCircleStrokeWidth(),
          'circle-stroke-opacity': getThermalCircleStrokeOpacity(),
          'circle-opacity': getThermalCircleOpacity(showHeatmap)
        }
      });

      // Selection Glow Circle Layer
      map.addLayer({
        id: 'selected-point-glow',
        type: 'circle',
        source: 'thermal-sources',
        filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'id'], selectedSourceId || -1]],
        paint: {
          'circle-radius': 18,
          'circle-color': 'rgba(59, 130, 246, 0.25)',
          'circle-stroke-color': '#60A5FA',
          'circle-stroke-width': 2.5
        }
      });

      const hasClusterInit = Array.isArray(clusterSourceIds) && clusterSourceIds.length > 0;
      const initClusterFilter: any = hasClusterInit
        ? ['all', ['!', ['has', 'point_count']], ['in', ['get', 'id'], ['literal', clusterSourceIds]]]
        : ['==', ['get', 'id'], -999999];

      // Correlated Cluster Members Glow Layer
      map.addLayer({
        id: 'cluster-members-glow',
        type: 'circle',
        source: 'thermal-sources',
        filter: initClusterFilter,
        paint: {
          'circle-radius': 22,
          'circle-color': 'rgba(217, 83, 30, 0.22)',
          'circle-stroke-color': '#D9531E',
          'circle-stroke-width': 2.5
        }
      });

      // Correlated Cluster Members Pulse Core
      map.addLayer({
        id: 'cluster-members-pulse',
        type: 'circle',
        source: 'thermal-sources',
        filter: initClusterFilter,
        paint: {
          'circle-radius': 8,
          'circle-color': '#D9531E',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 1.5,
          'circle-opacity': 0.85
        }
      });
    }
  }, [createGeoJSON, createHazardGeoJSON, selectedSourceId, showHeatmap, clusterSourceIds]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: UNIFIED_STYLE,
      center: [82.0, 22.5],
      zoom: 4.6,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

    map.addControl(new NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
    map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-right');

    map.on('load', () => {
      setupLayers(map);
      setMapLoaded(true);
    });

    // Mouse coordinates readout
    map.on('mousemove', (e: any) => {
      setMouseCoords({
        lat: Number(e.lngLat.lat.toFixed(4)),
        lon: Number(e.lngLat.lng.toFixed(4)),
        zoom: Number(map.getZoom().toFixed(1))
      });
    });

    // WebGL Raycasting Hover Tooltip
    const handleFeatureHover = (e: any) => {
      if (!e.features || e.features.length === 0) return;
      map.getCanvas().style.cursor = 'pointer';

      const feat = e.features[0];
      const props = feat.properties as any;
      const coords = (feat.geometry as any).coordinates.slice();

      const riskColor =
        props.risk_band === 'CRITICAL' ? '#EF4444' :
        props.risk_band === 'HIGH' ? '#F97316' :
        props.risk_band === 'MODERATE' ? '#F59E0B' : '#0284C7';

      const classColor = props.classification_color || getClassificationColor(props.classification);
      const colorName = getClassificationColorName(props.classification);

      const tooltipContent = `
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; line-height: 1.4; color: #E2E8F0; padding: 10px 12px; min-width: 260px; background: #0F172A; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #60A5FA;">SRC #${props.id}</span>
            <span style="background: ${riskColor}; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 4px; letter-spacing: 0.5px;">
              ${props.risk_band} (${Number(props.risk_score).toFixed(1)})
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="color: #94A3B8;">Classification:</span>
            <span style="font-weight: 600; color: #F8FAFC; text-align: right; max-width: 175px; display: flex; align-items: center; justify-content: flex-end; gap: 5px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${classColor}; border: 1px solid ${classColor === '#FFFFFF' ? '#000' : 'rgba(255,255,255,0.5)'}; flex-shrink: 0;"></span>
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${props.classification} — ${colorName}</span>
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94A3B8;">Radiative FRP:</span>
            <span style="font-weight: 700; color: #38BDF8;">${Number(props.mean_frp).toFixed(1)} MW (Peak: ${Number(props.max_frp).toFixed(1)})</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94A3B8;">Anomaly:</span>
            <span style="color: ${props.anomaly_status?.includes('CRITICAL') ? '#F87171' : props.anomaly_status?.includes('ABNORMAL') ? '#FB923C' : '#4ADE80'}; font-weight: 600;">${props.anomaly_status}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #94A3B8;">Industrial Index:</span>
            <span style="color: #E2E8F0;">${props.industrial_score}/100</span>
          </div>
          <div style="border-top: 1px solid #1E293B; padding-top: 5px; text-align: center; color: #93C5FD; font-size: 10px;">
            Click target to inspect dossier &amp; hazard buffer
          </div>
        </div>
      `;

      if (!hoverPopupRef.current) {
        hoverPopupRef.current = new Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'tactical-hud-popup',
          offset: [0, -12]
        });
      }

      hoverPopupRef.current.setLngLat(coords).setHTML(tooltipContent).addTo(map);
    };

    const handleFeatureLeave = () => {
      map.getCanvas().style.cursor = '';
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove();
      }
    };

    const handleFeatureClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['thermal-circles', 'thermal-critical-halo', 'selected-point-glow', 'cluster-members-glow', 'cluster-members-pulse']
      });
      if (!features || features.length === 0) return;
      const feat = features[0];
      const id = feat.properties?.id;
      const coords = (feat.geometry as any)?.coordinates?.slice();

      if (id !== undefined && coords && coords.length === 2) {
        const currentZoom = map.getZoom();
        // Dramatic tactical zoom: zoom in by 3.0 levels up to high-res satellite view (15.2 - 16.0)
        const targetZoom = Math.min(Math.max(currentZoom + 3.0, 15.2), 16.0);

        console.log(`[CommandMap] FlyTo hotspot #${id}: coords=[${coords}], from zoom=${currentZoom.toFixed(1)} to targetZoom=${targetZoom.toFixed(1)}`);

        isFlyingRef.current = true;

        map.flyTo({
          center: coords,
          zoom: targetZoom,
          pitch: 0, // Flat nadir view - NO TILTATION
          bearing: 0,
          duration: 1100,
          essential: true
        });

        // Open intelligence dossier popup after camera swoops in and settles
        setTimeout(() => {
          isFlyingRef.current = false;
          onSelectSource(id);
        }, 1050);
      } else if (id !== undefined) {
        onSelectSource(id);
      }
    };

    const handleClusterClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['thermal-clusters', 'thermal-cluster-count', 'thermal-clusters-halo']
      });
      if (!features || features.length === 0) return;
      const feat = features[0];
      const pointCount = Number(feat.properties?.point_count || 10);
      const coords = (feat.geometry as any)?.coordinates?.slice() || [e.lngLat.lng, e.lngLat.lat];

      const currentZoom = map.getZoom();
      // Animated cluster expansion zoom:
      // If large cluster (>500), advance by 2.6 zoom levels
      // If medium cluster (50-500), advance by 3.2 zoom levels
      // If small cluster (<=50) or currentZoom >= 9, zoom directly to 12.5 so it immediately unpacks into individual points!
      let targetZoom: number;
      if (pointCount <= 50 || currentZoom >= 9.0) {
        targetZoom = 12.5;
      } else if (pointCount <= 200) {
        targetZoom = Math.min(currentZoom + 3.2, 12.5);
      } else {
        targetZoom = Math.min(currentZoom + 2.6, 12.5);
      }

      console.log(`[CommandMap] Cluster click: count=${pointCount}, coords=[${coords}], from zoom=${currentZoom.toFixed(1)} to targetZoom=${targetZoom.toFixed(1)}`);

      map.flyTo({
        center: coords,
        zoom: targetZoom,
        pitch: 0, // Flat nadir view - NO TILTATION
        bearing: 0,
        duration: 900,
        essential: true
      });
    };

    // Cluster layer interactions (halo, circle, and count text)
    const clusterLayers = ['thermal-clusters', 'thermal-cluster-count', 'thermal-clusters-halo'];
    clusterLayers.forEach((layerId) => {
      map.on('click', layerId, handleClusterClick);
      map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
    });

    // Unclustered point interactions
    const pointLayers = ['thermal-circles', 'thermal-critical-halo', 'selected-point-glow', 'cluster-members-glow', 'cluster-members-pulse'];
    pointLayers.forEach((layerId) => {
      map.on('click', layerId, handleFeatureClick);
      map.on('mousemove', layerId, handleFeatureHover);
      map.on('mouseleave', layerId, handleFeatureLeave);
    });

    mapRef.current = map;
    (window as any)._mapInstance = map;

    return () => {
      if (hoverPopupRef.current) hoverPopupRef.current.remove();
      if (targetMarkerRef.current) targetMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON sources when points change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const src = map.getSource('thermal-sources') as GeoJSONSource | undefined;
    const heatSrc = map.getSource('thermal-heat-source') as GeoJSONSource | undefined;
    const data = createGeoJSON();
    if (src) {
      src.setData(data);
    }
    if (heatSrc) {
      heatSrc.setData(data);
    }

    // Camera animation after filtration:
    // Smoothly animate & fit bounds to filtered subset
    if (Array.isArray(points) && points.length > 0 && !targetLocation) {
      if (points.length === 1) {
        const pt = points[0];
        const lat = pt.lat ?? pt.latitude;
        const lon = pt.lon ?? pt.longitude;
        const id = pt.id ?? pt.thermal_source_id;

        if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
          map.flyTo({
            center: [lon, lat],
            zoom: 12,
            pitch: 0,
            duration: 1100
          });

          if (targetMarkerRef.current) {
            targetMarkerRef.current.remove();
            targetMarkerRef.current = null;
          }

          const isCrit = pt.risk_band === 'CRITICAL';
          const ringColor = isCrit ? '#EF4444' : '#F97316';
          const el = document.createElement('div');
          el.className = 'tactical-radar-marker';
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <span style="position: absolute; width: 60px; height: 60px; border-radius: 50%; border: 2.5px solid ${ringColor}; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.85;"></span>
              <span style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${isCrit ? 'rgba(239, 68, 68, 0.3)' : 'rgba(249, 115, 22, 0.25)'}; border: 1.5px dashed ${ringColor};"></span>
              <span style="width: 15px; height: 15px; border-radius: 50%; background: ${ringColor}; border: 2.5px solid #FFFFFF; box-shadow: 0 0 16px ${ringColor};"></span>
            </div>
          `;

          el.onclick = () => {
            if (id !== undefined) onSelectSource(id);
          };

          const marker = new Marker({ element: el })
            .setLngLat([lon, lat])
            .setPopup(
              new Popup({ offset: [0, -18], closeButton: false, className: 'tactical-hud-popup' }).setHTML(`
                <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: 10px 12px; background: #0F172A; color: #F8FAFC; border-radius: 8px; font-size: 11px; border: 1px solid ${ringColor}; min-width: 200px; box-shadow: 0 12px 28px -4px rgba(0,0,0,0.75);">
                  <div style="font-weight: 800; color: ${ringColor}; font-size: 12px; margin-bottom: 2px;">
                    SOURCE #${id} [${pt.risk_band || 'TARGET'}]
                  </div>
                  <div style="color: #E2E8F0; font-size: 11px;">${pt.classification || 'Thermal Hotspot'}</div>
                  <div style="color: #94A3B8; font-size: 10px; margin-top: 2px;">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</div>
                  <div style="color: #38BDF8; font-weight: 700; margin-top: 3px;">FRP: ${Number(pt.mean_frp || 0).toFixed(1)} MW</div>
                  <div style="color: #93C5FD; font-size: 9px; margin-top: 4px; border-top: 1px solid #334155; padding-top: 3px; text-align: center;">
                    Click beacon to inspect dossier &amp; hazard zone
                  </div>
                </div>
              `)
            )
            .addTo(map);

          targetMarkerRef.current = marker;
          marker.togglePopup();
        }
      } else if (points.length < 15436) {
        // Multi-point filtered subset: compute bounding box and animate camera smoothly
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        let valid = 0;
        for (const pt of points) {
          const lat = pt.lat ?? pt.latitude;
          const lon = pt.lon ?? pt.longitude;
          if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
            valid++;
          }
        }
        if (valid > 0 && minLat <= maxLat && minLon <= maxLon) {
          map.fitBounds([[minLon, minLat], [maxLon, maxLat]], {
            padding: { top: 120, bottom: 80, left: 340, right: 100 },
            maxZoom: 11,
            duration: 1200
          });
        }
        if (targetMarkerRef.current) {
          targetMarkerRef.current.remove();
          targetMarkerRef.current = null;
        }
      } else {
        // Full dataset (15,436) reset
        if (targetMarkerRef.current) {
          targetMarkerRef.current.remove();
          targetMarkerRef.current = null;
        }
      }
    }
  }, [points, mapLoaded, is3DTilt, targetLocation, onSelectSource, createGeoJSON]);

  // Update Hazard Buffers & Selection Highlight when selectedSourceId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Update selection filter
    if (map.getLayer('selected-point-glow')) {
      map.setFilter('selected-point-glow', [
        'all',
        ['!', ['has', 'point_count']],
        ['==', ['get', 'id'], selectedSourceId || -1]
      ]);
    }

    // Update hazard buffers polygon source
    const hazardSrc = map.getSource('hazard-buffers') as GeoJSONSource | undefined;
    if (hazardSrc) {
      hazardSrc.setData(createHazardGeoJSON());
    }

    // Toggle layer visibility based on showHazardZones & selectedSourceId
    const showZones = showHazardZones && selectedSourceId !== null;
    if (map.getLayer('hazard-buffers-fill')) {
      map.setLayoutProperty('hazard-buffers-fill', 'visibility', showZones ? 'visible' : 'none');
    }
    if (map.getLayer('hazard-buffers-line')) {
      map.setLayoutProperty('hazard-buffers-line', 'visibility', showZones ? 'visible' : 'none');
    }

    // Fly to selected source if not already animated by direct map feature click
    if (selectedSourceId !== null && Array.isArray(points)) {
      if (isFlyingRef.current) {
        // Direct click already scheduled and handles the flight
        return;
      }
      const pt = points.find((p) => (p.id ?? p.thermal_source_id) === selectedSourceId);
      if (pt) {
        const lat = pt.lat ?? pt.latitude;
        const lon = pt.lon ?? pt.longitude;
        if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
          // If targetLocation is already targeting this coordinate, avoid redundant camera flight
          if (targetLocation && Math.abs(targetLocation.lat - lat) < 0.0001 && Math.abs(targetLocation.lon - lon) < 0.0001) {
            return;
          }
          const currentZoom = map.getZoom();
          const targetZoom = Math.min(Math.max(currentZoom + 3.0, 15.2), 16.0);
          map.flyTo({
            center: [lon, lat],
            zoom: targetZoom,
            pitch: 0,
            duration: 1100,
            essential: true
          });
        }
      }
    }
  }, [selectedSourceId, points, mapLoaded, showHazardZones, is3DTilt, createHazardGeoJSON, targetLocation]);

  // Update Heatmap visibility & cluster dimming
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (map.getLayer('thermal-heat')) {
      map.setLayoutProperty('thermal-heat', 'visibility', showHeatmap ? 'visible' : 'none');
    }
    if (map.getLayer('thermal-circles')) {
      map.setPaintProperty('thermal-circles', 'circle-opacity', getThermalCircleOpacity(showHeatmap));
    }
    if (map.getLayer('thermal-critical-halo')) {
      map.setPaintProperty('thermal-critical-halo', 'circle-opacity', showHeatmap ? 0.35 : 0.95);
    }
    if (map.getLayer('thermal-clusters')) {
      map.setPaintProperty('thermal-clusters', 'circle-opacity', showHeatmap ? 0.2 : 0.92);
      map.setPaintProperty('thermal-clusters', 'circle-stroke-opacity', showHeatmap ? 0.25 : 1.0);
    }
    if (map.getLayer('thermal-clusters-halo')) {
      map.setLayoutProperty('thermal-clusters-halo', 'visibility', showHeatmap ? 'none' : 'visible');
    }
    if (map.getLayer('thermal-cluster-count')) {
      map.setLayoutProperty('thermal-cluster-count', 'visibility', showHeatmap ? 'none' : 'visible');
    }
  }, [showHeatmap, mapLoaded]);

  // Update Cluster Highlight & Auto Framing when clusterSourceIds change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const hasCluster = Array.isArray(clusterSourceIds) && clusterSourceIds.length > 0;
    const filterExpr: any = hasCluster
      ? ['all', ['!', ['has', 'point_count']], ['in', ['get', 'id'], ['literal', clusterSourceIds]]]
      : ['==', ['get', 'id'], -999999];

    if (map.getLayer('cluster-members-glow')) {
      map.setFilter('cluster-members-glow', filterExpr);
    }
    if (map.getLayer('cluster-members-pulse')) {
      map.setFilter('cluster-members-pulse', filterExpr);
    }

    if (hasCluster && Array.isArray(points) && points.length > 0 && selectedSourceId === null) {
      const clusterPoints = points.filter((p) => {
        const sid = p.id ?? p.thermal_source_id;
        return sid !== undefined && clusterSourceIds.includes(sid);
      });
      if (clusterPoints.length > 0) {
        if (clusterPoints.length === 1) {
          const pt = clusterPoints[0];
          const pLon = pt.lon ?? pt.longitude;
          const pLat = pt.lat ?? pt.latitude;
          if (pLon !== undefined && pLat !== undefined) {
            map.flyTo({
              center: [pLon, pLat],
              zoom: 14.5,
              pitch: 0,
              duration: 1200
            });
          }
        } else {
          let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
          let validCount = 0;
          clusterPoints.forEach((p) => {
            const lon = p.lon ?? p.longitude;
            const lat = p.lat ?? p.latitude;
            if (lon !== undefined && lat !== undefined) {
              if (lon < minLon) minLon = lon;
              if (lon > maxLon) maxLon = lon;
              if (lat < minLat) minLat = lat;
              if (lat > maxLat) maxLat = lat;
              validCount++;
            }
          });
          if (validCount > 0) {
            map.fitBounds(
              [[minLon, minLat], [maxLon, maxLat]],
              { padding: 100, maxZoom: 14.0, duration: 1300 }
            );
          }
        }
      }
    }
  }, [clusterSourceIds, points, mapLoaded, selectedSourceId]);

  // Switch Basemap Layer visibility smoothly without reloading style or losing thermal dots
  const handleBasemapChange = (mode: BasemapMode) => {
    if (mode === basemap || !mapRef.current) return;
    setBasemap(mode);

    const map = mapRef.current;
    if (map.getLayer('basemap-satellite')) {
      map.setLayoutProperty('basemap-satellite', 'visibility', mode === 'satellite' ? 'visible' : 'none');
    }
    if (map.getLayer('basemap-labels')) {
      map.setLayoutProperty('basemap-labels', 'visibility', mode === 'satellite' ? 'visible' : 'none');
    }
    if (map.getLayer('basemap-standard')) {
      map.setLayoutProperty('basemap-standard', 'visibility', mode === 'standard' ? 'visible' : 'none');
    }
  };

  // Toggle 3D Globe Projection
  const toggleGlobeProjection = () => {
    const map = mapRef.current;
    if (!map) return;

    const nextGlobe = !isGlobe;
    setIsGlobe(nextGlobe);

    try {
      if ((map as any).setProjection) {
        (map as any).setProjection({ type: nextGlobe ? 'globe' : 'mercator' });
      }
    } catch (e) {
      console.warn('Toggle globe failed:', e);
    }
  };

  // Toggle 3D Camera Tilt (0 vs 55 pitch)
  const toggle3DTilt = () => {
    const map = mapRef.current;
    if (!map) return;

    const nextTilt = !is3DTilt;
    setIs3DTilt(nextTilt);
    map.easeTo({
      pitch: nextTilt ? 55 : 0,
      duration: 1000
    });
  };

  // Reset View to Sovereign India Overview
  const resetView = () => {
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: [82.0, 22.5],
        zoom: 4.6,
        pitch: 0,
        bearing: 0,
        duration: 1200
      });
    }
    if (targetMarkerRef.current) {
      targetMarkerRef.current.remove();
      targetMarkerRef.current = null;
    }
    if (onResetLocation) {
      onResetLocation();
    }
  };

  // Pan / Fly to target searched location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (targetLocation && targetLocation.lat !== undefined && targetLocation.lon !== undefined) {
      map.flyTo({
        center: [targetLocation.lon, targetLocation.lat],
        zoom: targetLocation.zoom || 10,
        pitch: is3DTilt ? 45 : 0,
        duration: 1400
      });

      if (targetMarkerRef.current) {
        targetMarkerRef.current.remove();
        targetMarkerRef.current = null;
      }

      // Tactical Target Indicator element
      const el = document.createElement('div');
      el.className = 'tactical-radar-marker';
      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #38BDF8; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></span>
          <span style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(14, 165, 233, 0.25); border: 1.5px dashed #0284C7;"></span>
          <span style="width: 14px; height: 14px; border-radius: 50%; background: #0284C7; border: 2px solid #FFFFFF; box-shadow: 0 0 12px #38BDF8;"></span>
        </div>
      `;

      const marker = new Marker({ element: el })
        .setLngLat([targetLocation.lon, targetLocation.lat])
        .setPopup(
          new Popup({ offset: [0, -15] }).setHTML(`
            <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: 6px; background: #0F172A; color: #F8FAFC; border-radius: 6px; font-size: 11px;">
              <div style="font-weight: 700; color: #38BDF8; font-size: 12px; margin-bottom: 2px;">${targetLocation.label || 'Search Coordinate'}</div>
              <div style="color: #94A3B8; font-size: 10px;">${targetLocation.lat.toFixed(4)}°N, ${targetLocation.lon.toFixed(4)}°E</div>
              ${targetLocation.count !== undefined ? `<div style="color: #34D399; font-weight: 600; margin-top: 4px;">${targetLocation.count.toLocaleString()} Hotspots active in zone</div>` : ''}
            </div>
          `)
        )
        .addTo(map);

      targetMarkerRef.current = marker;
      marker.togglePopup();

      const popupAutoCloseTimer = setTimeout(() => {
        try {
          const p = marker.getPopup();
          if (p && p.isOpen()) {
            p.remove();
          }
        } catch (e) {
          // ignore
        }
      }, 5000);

      return () => clearTimeout(popupAutoCloseTimer);
    } else {
      if (targetMarkerRef.current) {
        targetMarkerRef.current.remove();
        targetMarkerRef.current = null;
      }
    }
  }, [targetLocation, mapLoaded, is3DTilt]);



  return (
    <div className="relative w-full h-full min-h-[520px] flex-1 bg-slate-950 overflow-hidden select-none rounded-xl border border-slate-800">
      {/* MapLibre GL WebGL Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-slate-900/90 p-4 rounded-xl flex items-center gap-3 border border-blue-500/40 shadow-2xl">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono tracking-wider font-semibold text-blue-300">
              SYNCHRONIZING ORBITAL TELEMETRY...
            </span>
          </div>
        </div>
      )}

      {/* Custom CSS to reposition NavigationControl & ScaleControl cleanly */}
      <style>{`
        .maplibregl-ctrl-top-right {
          top: 116px !important;
          right: 24px !important;
        }
        .maplibregl-ctrl-bottom-right {
          margin-right: 16px !important;
          margin-bottom: 42px !important;
        }
        .maplibregl-ctrl-scale {
          background: rgba(18, 16, 14, 0.88) !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-top: none !important;
          color: #F8FAFC !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          backdrop-filter: blur(8px) !important;
          border-radius: 4px !important;
          padding: 1px 6px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
        }
        .maplibregl-ctrl-group {
          background: rgba(18, 16, 14, 0.92) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 12px !important;
          backdrop-filter: blur(12px) !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
        .maplibregl-ctrl-group button {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .maplibregl-ctrl-group button:last-child {
          border-bottom: none !important;
        }
        .maplibregl-ctrl-icon {
          filter: invert(1) brightness(1.8) !important;
        }
      `}</style>

      {/* Primary Map Command Controls (Top Right Under Search Bar) */}
      <div className="absolute top-[132px] right-4 sm:right-6 z-10 flex flex-wrap items-center justify-end gap-2 pointer-events-auto">
        {/* Basemap Selection Bar (Satellite with Labels & Gov Map) */}
        <div className="bg-[#12100E]/90 backdrop-blur-md p-1 rounded-xl shadow-2xl border border-white/15 flex items-center gap-1">
          <button
            onClick={() => handleBasemapChange('satellite')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
              basemap === 'satellite'
                ? 'bg-[#D8582B] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="ESRI High-Resolution World Imagery with Place Names"
          >
            <Layers className="w-3.5 h-3.5" />
            {t.satellite_map}
          </button>
          <button
            onClick={() => handleBasemapChange('standard')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
              basemap === 'standard'
                ? 'bg-[#D8582B] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="OpenStreetMap Standard Sovereign Cartography"
          >
            <MapIcon className="w-3.5 h-3.5" />
            {t.gov_map}
          </button>
        </div>

        {/* 3D Projection Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleGlobeProjection}
            className={`px-3 py-1.5 rounded-xl shadow-xl border text-xs font-mono font-medium backdrop-blur-md transition-all flex items-center gap-1.5 ${
              isGlobe
                ? 'bg-amber-950/90 border-[#D8582B] text-amber-200 shadow-[#D8582B]/20'
                : 'bg-[#12100E]/90 border-white/15 text-white/70 hover:text-white hover:border-white/30'
            }`}
            title="Toggle between 3D Spherical Globe and 2D Mercator projection"
          >
            <Globe className={`w-3.5 h-3.5 ${isGlobe ? 'text-[#D8582B] animate-spin-slow' : 'text-white/60'}`} />
            <span>{isGlobe ? t.globe_3d : t.planar_2d}</span>
          </button>

          <button
            onClick={toggle3DTilt}
            className={`px-3 py-1.5 rounded-xl shadow-xl border text-xs font-mono font-medium backdrop-blur-md transition-all flex items-center gap-1.5 ${
              is3DTilt
                ? 'bg-amber-950/90 border-[#D8582B] text-amber-200 shadow-[#D8582B]/20'
                : 'bg-[#12100E]/90 border-white/15 text-white/70 hover:text-white hover:border-white/30'
            }`}
            title="Tilt camera 55 degrees for 3D terrain perspective"
          >
            <Eye className={`w-3.5 h-3.5 ${is3DTilt ? 'text-[#D8582B]' : 'text-white/60'}`} />
            <span>{is3DTilt ? t.tilt_55 : t.nadir_0}</span>
          </button>

          <button
            onClick={resetView}
            className="bg-[#12100E]/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-white/15 flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white hover:border-white/30 transition-colors"
            title="Reset camera to India view"
          >
            <Compass className="w-3.5 h-3.5 text-[#D8582B]" />
            <span>{t.reset_view}</span>
          </button>
        </div>
      </div>

      {/* Tactical Telemetry HUD Readout (Bottom Center/Right) */}
      <div
        id="coordinates-telemetry-hud"
        className="absolute bottom-3 right-4 z-10 hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#12100E]/90 border border-white/15 backdrop-blur-md font-mono text-[10px] text-slate-300 shadow-xl"
      >
        {mouseCoords && (
          <>
            <div>
              <span className="text-white/40">LAT:</span>{' '}
              <span className="text-emerald-400 font-bold">{mouseCoords.lat}°N</span>
            </div>
            <div>
              <span className="text-white/40">LON:</span>{' '}
              <span className="text-emerald-400 font-bold">{mouseCoords.lon}°E</span>
            </div>
            <div>
              <span className="text-white/40">ZOOM:</span>{' '}
              <span className="text-blue-400 font-bold">{mouseCoords.zoom}x</span>
            </div>
          </>
        )}
        <div className="border-l border-white/15 pl-2 text-cyan-300 font-semibold">
          GEODESIC BUFFER: {selectedSourceId ? 'ACTIVE' : 'IDLE'}
        </div>
      </div>

      {/* Hazard Buffers Legend (Visible when source is selected) */}
      {selectedSourceId && (
        <div className="absolute bottom-20 right-4 z-10 hidden lg:block bg-[#12100E]/95 border border-white/15 backdrop-blur-md p-2.5 rounded-xl shadow-2xl text-[11px] font-mono space-y-1.5 max-w-[240px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold border-b border-white/10 pb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Tactical Hazard Buffers</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 border border-red-400"></span>
            <span>500m Blast Exclusion</span>
          </div>
          <div className="flex items-center gap-2 text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500/80 border border-orange-400"></span>
            <span>2.0km Toxic Dispersion</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 border border-yellow-400"></span>
            <span>5.0km Evacuation Staging</span>
          </div>
        </div>
      )}
    </div>
  );
};
