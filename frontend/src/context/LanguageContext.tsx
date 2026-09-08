import React, { createContext, useContext, useState } from 'react';

export type Language = 'EN' | 'HI';

export interface Translations {
  // Navbar
  thermal_matrix: string;
  analytics: string;
  alerts: string;
  triage: string;
  // Hero / Landing
  sources_monitored: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_title_3: string;
  hero_subtitle: string;
  explore_radar: string;
  view_critical_alerts: string;
  // Map Telemetry Sidebar
  live_sensors: string;
  territory_telemetry: string;
  telemetry_sub: string;
  total_hotspots: string;
  india_master_set: string;
  critical_alerts: string;
  urgent_response: string;
  high_risk: string;
  high_and_critical: string;
  anomalies: string;
  sudden_surges: string;
  industrial: string;
  factory_proximity: string;
  coverage: string;
  sentinel_verified: string;
  gpu_heatmap: string;
  reset_all_filters: string;
  search_placeholder: string;
  // Map Controls
  satellite_map: string;
  gov_map: string;
  globe_3d: string;
  planar_2d: string;
  tilt_55: string;
  nadir_0: string;
  reset_view: string;
  direct_location_targets: string;
  // Risk dock & filters
  critical_points: string;
  moderate_risk: string;
  low_risk: string;
  all_points: string;
  filter_options: string;
  classification_filter: string;
  risk_band_filter: string;
  anomaly_filter: string;
  satellite_filter: string;
  quality_filter: string;
  matching_results: string;
  clear_filters: string;
  pts: string;
  display_layers: string;
  density_heatmap: string;
  // Classification Legend
  color_legend: string;
  color_industrial: string;
  color_wildfire: string;
  color_agricultural: string;
  color_mining: string;
  color_unlabeled: string;
  color_needs_review: string;
  // Critical alerts queue
  critical_alerts_queue: string;
  locate_on_map: string;
  fit_all_alerts: string;
  close_directory: string;
}

export const translations: Record<Language, Translations> = {
  EN: {
    // Navbar
    thermal_matrix: 'THERMAL MATRIX',
    analytics: 'ANALYTICS',
    alerts: 'ALERTS',
    triage: 'TRIAGE',
    // Hero / Landing
    sources_monitored: '15,436 Thermal Sources Monitored • VIIRS & Sentinel-2',
    hero_title_1: 'Every Flare',
    hero_title_2: 'Counted,',
    hero_title_3: 'Is a Catastrophe Averted.',
    hero_subtitle: "India's first sovereign spaceborne thermal surveillance engine. Continuous 24/7 AI-driven disambiguation between routine petrochemical flaring, agricultural burning, and industrial runaways.",
    explore_radar: 'EXPLORE TERRITORY RADAR',
    view_critical_alerts: 'VIEW CRITICAL ALERTS (59)',
    // Map Telemetry Sidebar
    live_sensors: 'LIVE ORBITAL SENSORS',
    territory_telemetry: 'Territory Telemetry',
    telemetry_sub: '15,436 VIIRS Hotspots & Sentinel-2 SWIR Corridors',
    total_hotspots: 'TOTAL HOTSPOTS',
    india_master_set: 'India Master Set',
    critical_alerts: 'CRITICAL ALERTS',
    urgent_response: 'Urgent Response',
    high_risk: 'High Risk',
    high_and_critical: 'High & Critical',
    anomalies: 'ANOMALIES',
    sudden_surges: 'Sudden Surges',
    industrial: 'INDUSTRIAL',
    factory_proximity: 'Factory Proximity',
    coverage: 'COVERAGE',
    sentinel_verified: 'Sentinel-2 Verified',
    gpu_heatmap: 'GPU Heatmap Layer',
    reset_all_filters: 'Reset All Filters',
    search_placeholder: 'Search facility, city, state, or ID #...',
    // Map Controls
    satellite_map: 'Satellite',
    gov_map: 'Gov Map',
    globe_3d: '3D Globe',
    planar_2d: '2D Planar',
    tilt_55: '55° 3D Tilt',
    nadir_0: 'Nadir 0°',
    reset_view: 'Reset View',
    direct_location_targets: 'Direct Location Targets',
    // Risk dock & filters
    critical_points: 'Critical Points',
    moderate_risk: 'Moderate Risk',
    low_risk: 'Low Risk',
    all_points: 'All Hotspots',
    filter_options: 'Filter Options',
    classification_filter: 'Classification',
    risk_band_filter: 'Risk Band',
    anomaly_filter: 'Anomaly Status',
    satellite_filter: 'Satellite Layer',
    quality_filter: 'Evidence Quality',
    matching_results: 'Matching Hotspots',
    clear_filters: 'Clear Filters',
    pts: 'pts',
    display_layers: 'DISPLAY LAYERS',
    density_heatmap: 'Density Heatmap',
    color_legend: 'Classification Legend',
    color_industrial: 'Industrial Fire — Orange',
    color_wildfire: 'Wildfire — Red',
    color_agricultural: 'Agricultural Burning — Yellow',
    color_mining: 'Mining / Industrial — Violet',
    color_unlabeled: 'Unlabeled / Baseline — Green',
    color_needs_review: 'Needs Review — White',
    critical_alerts_queue: 'Critical Alerts Incident Queue (59)',
    locate_on_map: 'Fly & Locate',
    fit_all_alerts: 'Fit All 59 on Map',
    close_directory: 'Close Directory'
  },
  HI: {
    // Navbar
    thermal_matrix: 'थर्मल मैट्रिक्स',
    analytics: 'एनालिटिक्स',
    alerts: 'अलर्ट्स',
    triage: 'ट्राइएज',
    // Hero / Landing
    sources_monitored: '15,436 थर्मल स्रोतों की निगरानी • VIIRS और सेंटिनल-2',
    hero_title_1: 'हर लपट की',
    hero_title_2: 'निगरानी,',
    hero_title_3: 'हर आपदा से मुक्ति।',
    hero_subtitle: 'भारत का पहला संप्रभु अंतरिक्ष-आधारित थर्मल निगरानी तंत्र। रिफाइनरी फ्लेयरिंग, पराली दहन और औद्योगिक अनियंत्रित आग का 24/7 वास्तविक समय में AI वर्गीकरण।',
    explore_radar: 'क्षेत्रीय रडार देखें',
    view_critical_alerts: 'गंभीर अलर्ट देखें (59)',
    // Map Telemetry Sidebar
    live_sensors: 'सक्रिय कक्षीय सेंसर',
    territory_telemetry: 'क्षेत्रीय टेलीमेट्री',
    telemetry_sub: '15,436 VIIRS हॉटस्पॉट और सेंटिनल-2 SWIR कॉरिडोर',
    total_hotspots: 'कुल हॉटस्पॉट',
    india_master_set: 'भारत मास्टर डेटासेट',
    critical_alerts: 'गंभीर अलर्ट',
    urgent_response: 'त्वरित प्रतिक्रिया',
    high_risk: 'उच्च जोखिम',
    high_and_critical: 'उच्च एवं गंभीर',
    anomalies: 'विसंगतियाँ',
    sudden_surges: 'अचानक थर्मल सर्ज',
    industrial: 'औद्योगिक क्षेत्र',
    factory_proximity: 'संयंत्र निकटता',
    coverage: 'कवरेज',
    sentinel_verified: 'सेंटिनल-2 सत्यापित',
    gpu_heatmap: 'GPU हीटमैप परत',
    reset_all_filters: 'सभी फ़िल्टर रीसेट करें',
    search_placeholder: 'संयंत्र, शहर, राज्य या आईडी # खोजें...',
    // Map Controls
    satellite_map: 'उपग्रह (सैटेलाइट)',
    gov_map: 'सरकारी मानचित्र',
    globe_3d: '3D ग्लोब',
    planar_2d: '2D समतल',
    tilt_55: '55° 3D झुकाव',
    nadir_0: '0° सीधा दृश्य',
    reset_view: 'दृश्य रीसेट',
    direct_location_targets: 'प्रत्यक्ष स्थान लक्ष्य',
    // Risk dock & filters
    critical_points: 'गंभीर बिंदु',
    moderate_risk: 'मध्यम जोखिम',
    low_risk: 'कम जोखिम',
    all_points: 'सभी हॉटस्पॉट',
    filter_options: 'फ़िल्टर विकल्प',
    classification_filter: 'वर्गीकरण',
    risk_band_filter: 'जोखिम स्तर',
    anomaly_filter: 'विसंगति स्थिति',
    satellite_filter: 'उपग्रह परत',
    quality_filter: 'साक्ष्य गुणवत्ता',
    matching_results: 'अनुकूल हॉटस्पॉट',
    clear_filters: 'फ़िल्टर हटाएं',
    pts: 'बिंदु',
    display_layers: 'दृश्य परतें',
    density_heatmap: 'घनत्व हीटमैप',
    color_legend: 'वर्गीकरण संकेत',
    color_industrial: 'औद्योगिक आग — नारंगी (Orange)',
    color_wildfire: 'जंगल की आग — लाल (Red)',
    color_agricultural: 'कृषि अवशेष दहन — पीला (Yellow)',
    color_mining: 'खनन / औद्योगिक — बैंगनी (Violet)',
    color_unlabeled: 'अवर्गीकृत / आधारभूत — हरा (Green)',
    color_needs_review: 'समीक्षा आवश्यक — सफ़ेद (White)',
    critical_alerts_queue: 'गंभीर अलर्ट आपातकालीन कतार (59)',
    locate_on_map: 'नक्शे पर उड़ें व देखें',
    fit_all_alerts: 'सभी 59 को नक्शे पर देखें',
    close_directory: 'कतार बंद करें'
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'EN',
  setLang: () => {},
  t: translations.EN
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('thermotrace_lang');
    return (saved === 'HI' || saved === 'EN') ? saved : 'EN';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('thermotrace_lang', newLang);
  };

  const t = translations[lang] || translations.EN;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
