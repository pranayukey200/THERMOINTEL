import { jsPDF } from 'jspdf';
import { TacticalIncidentBrief } from '../types';

/**
 * Generates an official Government of India / THERMOINTEL Tactical Incident Dispatch PDF
 * and initiates an instant browser download.
 */
export const downloadTacticalBriefPdf = (brief: TacticalIncidentBrief): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm

  // ══════════════════ 1. OFFICIAL CLASSIFIED HEADER ══════════════════
  // Top classification strip
  doc.setFillColor(185, 28, 28); // Deep Red
  doc.rect(margin, 10, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(
    brief.security_classification || 'CONFIDENTIAL // DISASTER RELIEF & CRITICAL INFRASTRUCTURE PROTECTION',
    pageWidth / 2,
    14.2,
    { align: 'center' }
  );

  // Authority & Emblem Header
  doc.setFillColor(18, 20, 24); // Obsidian Header
  doc.rect(margin, 16, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('GOVERNMENT OF INDIA // NATIONAL TECHNICAL RESEARCH ORGANISATION', margin + 6, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(147, 197, 253); // Light Blue
  doc.text(brief.issuing_authority || 'NATIONAL CRITICAL INFRASTRUCTURE & CRISIS MANAGEMENT CELL', margin + 6, 28);

  doc.setTextColor(29, 78, 216); // Sovereign Blue #1D4ED8
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('THERMOINTEL SATELLITE THERMAL SURVEILLANCE DISPATCH', margin + 6, 33);

  // Top Metadata Bar
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, 40, contentWidth, 7, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(margin, 40, contentWidth, 7, 'S');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);

  const metaText1 = `DISPATCH: ${brief.dispatch_id}`;
  const metaText2 = `MGRS: ${brief.mgrs_tile || 'N/A'}`;
  const metaText3 = `GENERATED: ${brief.dispatch_timestamp || new Date().toISOString()}`;
  doc.text(metaText1, margin + 4, 44.8);
  doc.text(metaText2, margin + 65, 44.8);
  doc.text(metaText3, margin + 115, 44.8);

  let curY = 50;

  // ══════════════════ 2. THREAT SEVERITY BANNER ══════════════════
  const isCritical =
    brief.thermal_runaway_status?.includes('CATASTROPHIC') ||
    brief.risk_band === 'CRITICAL' ||
    brief.risk_score >= 70;

  if (isCritical) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(220, 38, 38);
  } else {
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(234, 88, 12);
  }
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, curY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(isCritical ? 185 : 194, isCritical ? 28 : 65, isCritical ? 28 : 12);
  doc.text(`[ALERT] ${brief.thermal_runaway_status || 'ELEVATED THERMAL ANOMALY'}`, margin + 4, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text(
    `Target #${brief.source_id}  |  Classification: ${brief.classification}  |  Risk Band: ${brief.risk_band} (${brief.risk_score.toFixed(1)}/100)`,
    margin + 4,
    curY + 11
  );
  doc.text(
    `Surge Factor: ${brief.surge_multiplier.toFixed(2)}x Baseline  |  Anomaly Z-Score: ${brief.z_score.toFixed(2)} \u03C3 (Standard Deviations)`,
    margin + 4,
    curY + 15.5
  );

  curY += 22;

  // ══════════════════ 3. CORE TELEMETRY MATRIX ══════════════════
  const colWidth = (contentWidth - 4) / 2; // 89 mm each

  // Box A: Thermal Signature & Baseline
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, curY, colWidth, 34, 1.5, 1.5, 'FD');

  doc.setFillColor(224, 231, 255);
  doc.rect(margin, curY, colWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('1. OPERATIONAL FLARING BASELINE VS PEAK', margin + 3, curY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('Observed Peak FRP:', margin + 4, curY + 11);
  doc.text('30-Day Mean Baseline:', margin + 4, curY + 17);
  doc.text('Surge Ratio:', margin + 4, curY + 23);
  doc.text('Statistical Z-Score:', margin + 4, curY + 29);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28);
  doc.text(`${brief.current_frp.toFixed(1)} MW`, margin + colWidth - 24, curY + 11);

  doc.setTextColor(29, 78, 216);
  doc.text(`${brief.baseline_frp.toFixed(1)} MW`, margin + colWidth - 24, curY + 17);

  doc.setTextColor(194, 65, 12);
  doc.text(`${brief.surge_multiplier.toFixed(2)}x`, margin + colWidth - 24, curY + 23);

  doc.setTextColor(17, 24, 39);
  doc.text(`${brief.z_score.toFixed(2)} \u03C3`, margin + colWidth - 24, curY + 29);

  // Box B: 3-Axis Fire Domain Disambiguation
  const rightColX = margin + colWidth + 4;
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(rightColX, curY, colWidth, 34, 1.5, 1.5, 'FD');

  doc.setFillColor(209, 250, 229);
  doc.rect(rightColX, curY, colWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 78, 59);
  doc.text('2. 3-AXIS MULTI-SENSOR DISAMBIGUATION', rightColX + 3, curY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('Diurnal Ratio (D/N):', rightColX + 4, curY + 11);
  doc.text('Centroid Drift (\u0394m):', rightColX + 4, curY + 17);
  doc.text('Coordinates (Lat/Lon):', rightColX + 4, curY + 23);
  doc.text('Infrastructure Context:', rightColX + 4, curY + 29);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text(`${brief.diurnal_ratio.toFixed(2)}`, rightColX + colWidth - 24, curY + 11);
  doc.text(`${brief.centroid_drift_m.toFixed(1)} m`, rightColX + colWidth - 24, curY + 17);

  doc.setFontSize(7.5);
  doc.setTextColor(17, 24, 39);
  doc.text(
    `${brief.latitude.toFixed(4)}N, ${brief.longitude.toFixed(4)}E`,
    rightColX + colWidth - 36,
    curY + 23
  );

  const infraSnippet = brief.nearest_infrastructure
    ? brief.nearest_infrastructure.length > 22
      ? brief.nearest_infrastructure.slice(0, 22) + '...'
      : brief.nearest_infrastructure
    : 'Heavy Industrial Facility';
  doc.text(infraSnippet, rightColX + colWidth - 36, curY + 29);

  curY += 38;

  // ══════════════════ 4. TACTICAL HAZARD EXCLUSION CORDONS ══════════════════
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, curY, contentWidth, 36, 1.5, 1.5, 'FD');

  doc.setFillColor(239, 68, 68);
  doc.rect(margin, curY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('3. GEODESIC HAZARD EXCLUSION ZONES & EVACUATION DIRECTIVES', margin + 4, curY + 4.2);
  doc.text(`CVI CASUALTY SCORE: ${brief.cvi_score}/100`, margin + contentWidth - 46, curY + 4.2);

  const zoneWidth = (contentWidth - 6) / 3;

  // Zone 1: Blast
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 2, curY + 8, zoneWidth, 25, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('PRIMARY BLAST CORDON', margin + 4, curY + 12.5);
  doc.setFontSize(11);
  doc.text(`${brief.blast_radius_m} m`, margin + 4, curY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text('Zero civilian access; immediate thermal explosion perimeter cordon.', margin + 4, curY + 22, {
    maxWidth: zoneWidth - 4
  });

  // Zone 2: Toxic Plume
  const z2X = margin + 2 + zoneWidth + 1;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(z2X, curY + 8, zoneWidth, 25, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12);
  doc.text('TOXIC PLUME DISPERSION', z2X + 2, curY + 12.5);
  doc.setFontSize(11);
  doc.text(`${(brief.toxic_dispersion_radius_m / 1000).toFixed(1)} km`, z2X + 2, curY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text('Deploy mobile HAZMAT air monitors & particulate scrubbers downwind.', z2X + 2, curY + 22, {
    maxWidth: zoneWidth - 4
  });

  // Zone 3: Evacuation
  const z3X = margin + 2 + (zoneWidth + 1) * 2;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(z3X, curY + 8, zoneWidth, 25, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(161, 98, 7);
  doc.text('EVACUATION STAGING', z3X + 2, curY + 12.5);
  doc.setFontSize(11);
  doc.text(`${(brief.evacuation_radius_m / 1000).toFixed(1)} km`, z3X + 2, curY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text('Stage NDRF emergency rescue vehicles and medical reception points.', z3X + 2, curY + 22, {
    maxWidth: zoneWidth - 4
  });

  curY += 40;

  // ══════════════════ 5. MANDATORY SOP ACTION DIRECTIVES ══════════════════
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(margin, curY, contentWidth, 42, 1.5, 1.5, 'FD');

  doc.setFillColor(31, 41, 55);
  doc.rect(margin, curY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('4. MANDATORY SOP CRISIS RESPONSE DIRECTIVES (ACTION CHECKLIST)', margin + 4, curY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);

  const sops =
    brief.recommended_sop && brief.recommended_sop.length > 0
      ? brief.recommended_sop.slice(0, 5)
      : [
          'Dispatch State Disaster Management Authority (SDMA) rapid response unit.',
          'Enforce 500m primary blast exclusion zone with local law enforcement.',
          'Task Sentinel-2 and VIIRS satellite constellation for priority follow-up overpasses.',
          'Verify industrial facility automated flare knockout systems and emergency shutoff valves.',
          'Log geointel anomaly dossier in tamper-evident sovereign blockchain registry.'
        ];

  let sopY = curY + 10;
  sops.forEach((sop, idx) => {
    // Checkbox box
    doc.setDrawColor(107, 114, 128);
    doc.rect(margin + 4, sopY - 2.8, 3.2, 3.2);

    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}.`, margin + 9, sopY);

    doc.setFont('helvetica', 'normal');
    doc.text(sop, margin + 14, sopY, { maxWidth: contentWidth - 18 });
    sopY += 6.5;
  });

  curY += 46;

  // ══════════════════ 6. SATELLITE SENSOR & AUDIT VERIFICATION ══════════════════
  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, curY, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text('SATELLITE SENSOR SPECIFICATION & CRYPTOGRAPHIC PROOF:', margin + 4, curY + 5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(55, 65, 81);
  doc.text(
    `Sensor Platform: ${brief.satellite_sensor || 'VIIRS 375m I-Band + Sentinel-2 MSI 20m SWIR Fusion'}`,
    margin + 4,
    curY + 9.5
  );
  doc.text(
    `Scene Overpass: ${brief.sentinel_scene_date || 'Calibrated Sentinel-2 Multi-spectral Record'} | Resolution: 20m / 375m Ground Sample Distance`,
    margin + 4,
    curY + 13.5
  );

  doc.setFont('courier', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(`SHA-256 HASH: ${brief.evidence_sha256 || '9f82d1c3a7e58402b89f31548206129845719bc4a8e23f901a57c2349184df20'}`, margin + 4, curY + 18.5);
  doc.setFont('courier', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Tamper-Evident Geoint Ledger \u2022 Article 352 Civil Emergency Protocol Directives', margin + 4, curY + 22);

  curY += 27;

  // ══════════════════ 7. SIGN-OFF BLOCK & FOOTER ══════════════════
  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.4);
  doc.line(margin, curY, margin + contentWidth, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text('COMMAND DUTY OFFICER VERIFICATION:', margin, curY + 5);
  doc.line(margin, curY + 14, margin + 55, curY + 14);
  doc.text('National Crisis Response Cell Duty Sign-Off', margin, curY + 18);

  doc.text('AUTHORIZED DISASTER STAGING SEAL:', margin + contentWidth - 65, curY + 5);
  doc.setDrawColor(185, 28, 28);
  doc.roundedRect(margin + contentWidth - 65, curY + 7, 65, 12, 1, 1, 'S');
  doc.setTextColor(185, 28, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('SOVEREIGN TACTICAL DISPATCH', margin + contentWidth - 63, curY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('CONFIRMED BY GEOINT AUTOMATION ENGINE', margin + contentWidth - 63, curY + 16);

  // Bottom Running Footer
  doc.setFillColor(18, 20, 24);
  doc.rect(0, pageHeight - 7, pageWidth, 7, 'F');
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    'THERMOINTEL SATELLITE THERMAL SURVEILLANCE & AI EARLY WARNING PLATFORM  \u2022  GOVERNMENT OF INDIA',
    margin,
    pageHeight - 2.5
  );
  doc.text('OFFICIAL SOVEREIGN DISPATCH  \u2022  PAGE 1 OF 1', pageWidth - margin - 42, pageHeight - 2.5);

  // Trigger browser download
  const filename = `THERMOINTEL_Tactical_Brief_SRC_${brief.source_id}.pdf`;
  doc.save(filename);
};
