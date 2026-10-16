import pptxgen from 'pptxgenjs';

// =============================================================================
// Reference deck theme — editable DigiChefs-inspired styling
// =============================================================================

const COLORS = {
  white: 'FFFFFF',
  lightBg: 'F3F3F3',
  darkNavy: '222222',
  darkCard: '333333',
  darkText: '222222',
  mutedText: '595959',
  lightText: 'FFFFFF',
  lightMuted: 'D9D9D9',
  orange: 'F35A00',
  deepOrange: 'C94200',
  gold: 'F1C132',
  red: 'DC2626',
  amber: 'F1C132',
  emerald: '10B981',
  border: 'D9D9D9',
  darkBorder: '595959',
};

const FONTS = {
  heading: 'Arial',
  body: 'Arial',
};

// =============================================================================
// HELPERS
// =============================================================================

/** Strip markdown bold/italic markers from text */
function stripMarkdown(text) {
  if (!text) return '';
  return String(text)
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // ***bold italic***
    .replace(/\*\*(.*?)\*\*/g, '$1')        // **bold**
    .replace(/\*(.*?)\*/g, '$1')            // *italic*
    .replace(/__(.*?)__/g, '$1')            // __underline__
    .replace(/_(.*?)_/g, '$1');             // _italic_
}

/** Get severity color */
function getSeverityColor(sev) {
  const s = String(sev).toLowerCase();
  if (s === 'high' || s === 'critical') return COLORS.red;
  if (s === 'medium') return COLORS.amber;
  return COLORS.emerald;
}

/** Get severity label color for light backgrounds */
function getSeverityTextColor(sev) {
  return String(sev).toLowerCase() === 'medium' ? COLORS.darkText : COLORS.lightText;
}

/** Apply the standard light-background content slide layout */
function applyLightSlideLayout(slide, title, clientName, shapes) {
  slide.background = { fill: COLORS.white };
  const normalizedClientName = clientName.replace(/\s+/g, ' ').trim().toUpperCase();
  const clientLabel = normalizedClientName.length > 30
    ? `${normalizedClientName.slice(0, 27)}...`
    : normalizedClientName;

  // Orange and gold rules echo the reference deck's section styling.
  slide.addShape(shapes.RECTANGLE, {
    x: 0.0, y: 0.0, w: 10.0, h: 0.07,
    fill: { color: COLORS.orange }
  });
  slide.addShape(shapes.RECTANGLE, {
    x: 0.0, y: 0.07, w: 10.0, h: 0.025,
    fill: { color: COLORS.gold }
  });

  // Slide title
  slide.addText(title, {
    x: 0.5, y: 0.2, w: 7.0, h: 0.5,
    fontSize: 22, bold: true,
    color: COLORS.darkText,
    fontFace: FONTS.heading,
    valign: 'middle',
  });

  // Client tag (top right)
  slide.addText(clientLabel, {
    x: 7.5, y: 0.2, w: 2.0, h: 0.5,
    fontSize: Math.max(6, Math.min(9, 185 / clientLabel.length)), bold: true,
    color: COLORS.orange,
    align: 'right',
    fontFace: FONTS.heading,
    valign: 'middle',
    margin: 0,
    wrap: false,
  });

  // Subtle divider line under header
  slide.addShape(shapes.RECTANGLE, {
    x: 0.5, y: 0.72, w: 9.0, h: 0.015,
    fill: { color: COLORS.border }
  });
}

/** Apply dark slide layout (for title and end slides) */
function applyDarkSlideLayout(slide, shapes) {
  slide.background = { fill: COLORS.darkNavy };

  // Editable brand-color bars on the right edge.
  slide.addShape(shapes.RECTANGLE, {
    x: 9.35, y: 0.0, w: 0.65, h: 5.625,
    fill: { color: COLORS.orange },
  });
  slide.addShape(shapes.RECTANGLE, {
    x: 9.1, y: 0.0, w: 0.25, h: 5.625,
    fill: { color: COLORS.gold },
  });
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function buildPPTX(type, data) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10.0 x 5.625 inches
  pptx.theme = {
    headFontFace: FONTS.heading,
    bodyFontFace: FONTS.body,
  };
  const shapes = pptx.shapes || pptx.ShapeType;

  const clientName = data.client_name || 'Client';
  const generatedAt = data.generated_at
    ? new Date(data.generated_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  if (type === 'audit') {
    buildAuditDeck(pptx, shapes, data, clientName, generatedAt);
  } else if (type === 'pre-scoping') {
    buildPreScopingDeck(pptx, shapes, data, clientName, generatedAt);
  }

  return pptx;
}

// =============================================================================
// MODULE A: WEBSITE AUDIT DECK
// =============================================================================

function buildAuditDeck(pptx, shapes, data, clientName, generatedAt) {

  // ─── 1. TITLE SLIDE ───────────────────────────────────────────────────────
  const titleSlide = pptx.addSlide();
  applyDarkSlideLayout(titleSlide, shapes);

  // Left decorative strips
  titleSlide.addShape(shapes.RECTANGLE, {
    x: 0.0, y: 0.0, w: 0.12, h: 5.625,
    fill: { color: COLORS.orange }
  });
  titleSlide.addShape(shapes.RECTANGLE, {
    x: 0.12, y: 0.0, w: 0.06, h: 5.625,
    fill: { color: COLORS.gold }
  });

  // Tagline
  titleSlide.addText('INTEGRITY MATTERS // AUDIT SUITE', {
    x: 0.7, y: 1.2, w: 7.0, h: 0.4,
    fontSize: 12, bold: true,
    color: COLORS.orange,
    fontFace: FONTS.heading,
    letterSpacing: 3,
  });

  // Main title
  titleSlide.addText('Website Audit\nReport', {
    x: 0.7, y: 1.7, w: 7.0, h: 1.8,
    fontSize: 48, bold: true,
    color: COLORS.lightText,
    fontFace: FONTS.heading,
    lineSpacingMultiple: 1.1,
  });

  // Info card
  titleSlide.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y: 3.8, w: 5.5, h: 1.2,
    fill: { color: COLORS.darkCard },
    rectRadius: 0.1,
  });

  titleSlide.addText(
    [
      { text: 'CLIENT:  ', options: { fontSize: 10, color: COLORS.orange, bold: true, fontFace: FONTS.heading } },
      { text: clientName + '\n', options: { fontSize: 10, color: COLORS.lightText, fontFace: FONTS.body } },
      { text: 'URL:  ', options: { fontSize: 10, color: COLORS.orange, bold: true, fontFace: FONTS.heading } },
      { text: (data.url || 'Not specified') + '\n', options: { fontSize: 10, color: COLORS.lightMuted, fontFace: FONTS.body } },
      { text: 'DATE:  ', options: { fontSize: 10, color: COLORS.orange, bold: true, fontFace: FONTS.heading } },
      { text: generatedAt, options: { fontSize: 10, color: COLORS.lightMuted, fontFace: FONTS.body } },
    ],
    {
      x: 0.95, y: 3.9, w: 5.0, h: 1.0,
      lineSpacingMultiple: 1.5,
      valign: 'middle',
    }
  );

  // ─── 2. EXECUTIVE SUMMARY SLIDE ──────────────────────────────────────────
  const summarySlide = pptx.addSlide();
  applyLightSlideLayout(summarySlide, 'Executive Audit Summary', clientName, shapes);

  // Left: Overall Score Card
  summarySlide.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.0, w: 3.2, h: 3.8,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.1,
  });

  summarySlide.addText('OVERALL SCORE', {
    x: 0.7, y: 1.2, w: 2.8, h: 0.35,
    fontSize: 11, bold: true,
    color: COLORS.mutedText,
    align: 'center',
    fontFace: FONTS.heading,
  });

  const overallScore = data.overall_score || 0;
  const scoreColor = overallScore >= 8 ? COLORS.emerald : (overallScore >= 5 ? COLORS.amber : COLORS.red);

  summarySlide.addText(String(overallScore), {
    x: 0.7, y: 1.6, w: 2.8, h: 1.4,
    fontSize: 80, bold: true,
    color: scoreColor,
    align: 'center',
    fontFace: FONTS.heading,
    valign: 'middle',
  });

  summarySlide.addText('OUT OF 10', {
    x: 0.7, y: 3.1, w: 2.8, h: 0.3,
    fontSize: 11, bold: true,
    color: COLORS.mutedText,
    align: 'center',
    fontFace: FONTS.body,
  });

  summarySlide.addText('A strategic evaluation covering UX, technical metrics, accessibility, and conversion elements.', {
    x: 0.8, y: 3.5, w: 2.6, h: 1.0,
    fontSize: 9, color: COLORS.mutedText,
    align: 'center',
    fontFace: FONTS.body,
    lineSpacingMultiple: 1.3,
  });

  // Right: Quick Wins
  summarySlide.addText('STRATEGIC QUICK WINS', {
    x: 4.1, y: 1.0, w: 5.4, h: 0.4,
    fontSize: 14, bold: true,
    color: COLORS.orange,
    fontFace: FONTS.heading,
  });

  const quickWins = data.action_plan?.quick_wins || [];
  if (quickWins.length > 0) {
    const qwTextRuns = [];
    quickWins.forEach((w, i) => {
      qwTextRuns.push({
        text: '●  ', options: { fontSize: 10, color: COLORS.orange, fontFace: FONTS.body }
      });
      qwTextRuns.push({
        text: stripMarkdown(w) + (i < quickWins.length - 1 ? '\n\n' : ''),
        options: { fontSize: 10, color: COLORS.darkText, fontFace: FONTS.body }
      });
    });

    summarySlide.addText(qwTextRuns, {
      x: 4.1, y: 1.5, w: 5.4, h: 3.3,
      valign: 'top',
      lineSpacingMultiple: 1.2,
      shrinkText: true,
    });
  } else {
    summarySlide.addText('No quick wins specified.', {
      x: 4.1, y: 1.5, w: 5.4, h: 1.0,
      fontSize: 11, color: COLORS.mutedText, fontFace: FONTS.body
    });
  }

  // ─── 3. SECTION SLIDES ──────────────────────────────────────────────────
  const sections = data.sections || [];
  sections.forEach((sec) => {
    const findings = sec.findings || [];
    const MAX_FINDINGS_PER_SLIDE = 2;
    const totalSlides = Math.max(1, Math.ceil(findings.length / MAX_FINDINGS_PER_SLIDE));

    for (let slideIdx = 0; slideIdx < totalSlides; slideIdx++) {
      const secSlide = pptx.addSlide();
      const slideLabel = totalSlides > 1 ? ` (${slideIdx + 1}/${totalSlides})` : '';
      applyLightSlideLayout(secSlide, `${sec.section_name} Analysis${slideLabel}`, clientName, shapes);

      // Left: Section Score Card
      secSlide.addShape(shapes.ROUNDED_RECTANGLE, {
        x: 0.5, y: 1.0, w: 2.5, h: 3.8,
        fill: { color: COLORS.lightBg },
        line: { color: COLORS.border, width: 1 },
        rectRadius: 0.1,
      });

      secSlide.addText('SECTION SCORE', {
        x: 0.6, y: 1.2, w: 2.3, h: 0.3,
        fontSize: 10, bold: true,
        color: COLORS.mutedText,
        align: 'center',
        fontFace: FONTS.heading,
      });

      const sScore = sec.score || 0;
      const sColor = sScore >= 8 ? COLORS.emerald : (sScore >= 5 ? COLORS.amber : COLORS.red);

      secSlide.addText(String(sScore), {
        x: 0.6, y: 1.5, w: 2.3, h: 1.2,
        fontSize: 60, bold: true,
        color: sColor,
        align: 'center',
        fontFace: FONTS.heading,
        valign: 'middle',
      });

      secSlide.addText('/ 10', {
        x: 0.6, y: 2.7, w: 2.3, h: 0.3,
        fontSize: 12, bold: true,
        color: COLORS.mutedText,
        align: 'center',
        fontFace: FONTS.body,
      });

      secSlide.addText(`Strategic evaluation covering\n${sec.section_name.toLowerCase()} metrics\nand industry standard patterns.`, {
        x: 0.7, y: 3.2, w: 2.1, h: 1.3,
        fontSize: 9, color: COLORS.mutedText,
        align: 'center',
        fontFace: FONTS.body,
        lineSpacingMultiple: 1.3,
      });

      // Right: Findings
      secSlide.addText('KEY FINDINGS & RECOMMENDATIONS', {
        x: 3.3, y: 1.0, w: 6.2, h: 0.35,
        fontSize: 13, bold: true,
        color: COLORS.orange,
        fontFace: FONTS.heading,
      });

      const sliceStart = slideIdx * MAX_FINDINGS_PER_SLIDE;
      const sliceEnd = sliceStart + MAX_FINDINGS_PER_SLIDE;
      const visibleFindings = findings.slice(sliceStart, sliceEnd);

      if (visibleFindings.length === 0) {
        secSlide.addText('No findings recorded for this section.', {
          x: 3.3, y: 1.5, w: 6.2, h: 1.0,
          fontSize: 11, color: COLORS.mutedText, fontFace: FONTS.body,
        });
      } else {
        const findingHeight = 3.5 / visibleFindings.length;

        visibleFindings.forEach((f, idx) => {
          const yPos = 1.5 + (idx * findingHeight);

          // Severity indicator bar (left edge)
          const sevColor = getSeverityColor(f.severity);
          secSlide.addShape(shapes.RECTANGLE, {
            x: 3.3, y: yPos, w: 0.06, h: findingHeight - 0.1,
            fill: { color: sevColor },
          });

          // Finding title (clean, no brackets)
          const cleanIssue = stripMarkdown(f.issue || '');
          secSlide.addText(cleanIssue, {
            x: 3.55, y: yPos, w: 4.25, h: 0.48,
            fontSize: 9.5, bold: true,
            color: COLORS.darkText,
            fontFace: FONTS.heading,
            valign: 'top',
            margin: 0,
          });

          // Severity & Effort badges
          const sevText = String(f.severity || 'N/A').toUpperCase();
          const effText = String(f.effort_estimate || 'N/A').toUpperCase();

          secSlide.addShape(shapes.ROUNDED_RECTANGLE, {
            x: 8.0, y: yPos + 0.02, w: 0.85, h: 0.24,
            fill: { color: sevColor },
            rectRadius: 0.05,
          });
          secSlide.addText(sevText, {
            x: 8.0, y: yPos + 0.02, w: 0.85, h: 0.24,
            fontSize: 6.5, bold: true,
            color: getSeverityTextColor(f.severity),
            align: 'center',
            fontFace: FONTS.heading,
            valign: 'middle',
            margin: 0,
          });

          secSlide.addShape(shapes.ROUNDED_RECTANGLE, {
            x: 8.95, y: yPos + 0.02, w: 0.85, h: 0.24,
            fill: { color: COLORS.mutedText },
            rectRadius: 0.05,
          });
          secSlide.addText(effText, {
            x: 8.95, y: yPos + 0.02, w: 0.85, h: 0.24,
            fontSize: 6.5, bold: true,
            color: COLORS.lightText,
            align: 'center',
            fontFace: FONTS.heading,
            valign: 'middle',
            margin: 0,
          });

          // Impact + Recommendation body
          const impactText = stripMarkdown(f.impact || '');
          const recText = stripMarkdown(f.recommendation || '');
          const bodyRuns = [
            { text: 'Impact: ', options: { fontSize: 8.5, bold: true, color: COLORS.mutedText, fontFace: FONTS.heading } },
            { text: impactText + '\n', options: { fontSize: 8.5, color: COLORS.mutedText, fontFace: FONTS.body } },
            { text: 'Recommendation: ', options: { fontSize: 8.5, bold: true, color: COLORS.orange, fontFace: FONTS.heading } },
            { text: recText, options: { fontSize: 8.5, color: COLORS.darkText, fontFace: FONTS.body } },
          ];

          secSlide.addText(bodyRuns, {
            x: 3.55, y: yPos + 0.55, w: 6.25, h: findingHeight - 0.62,
            valign: 'top',
            lineSpacingMultiple: 1.05,
            margin: 0,
          });
        });
      }
    }
  });

  // ─── 4. ACTION PLAN ROADMAP SLIDE ──────────────────────────────────────
  const actionPlanSlide = pptx.addSlide();
  applyLightSlideLayout(actionPlanSlide, 'Strategic Action Roadmap', clientName, shapes);

  const ap = data.action_plan || {};
  const roadmap = [
    { title: 'QUICK WINS', subtitle: 'Short-Term', items: ap.quick_wins || [], x: 0.5, accentColor: COLORS.orange },
    { title: 'MEDIUM-TERM', subtitle: 'Routine', items: ap.medium_term || [], x: 3.6, accentColor: COLORS.gold },
    { title: 'LONG-TERM', subtitle: 'Evolution', items: ap.long_term || [], x: 6.7, accentColor: COLORS.red },
  ];

  roadmap.forEach((col) => {
    // Column header
    actionPlanSlide.addShape(shapes.ROUNDED_RECTANGLE, {
      x: col.x, y: 1.0, w: 2.8, h: 0.5,
      fill: { color: col.accentColor },
      rectRadius: 0.08,
    });

    actionPlanSlide.addText(`${col.title}\n${col.subtitle}`, {
      x: col.x, y: 1.0, w: 2.8, h: 0.5,
      fontSize: 10, bold: true,
      color: col.accentColor === COLORS.gold ? COLORS.darkText : COLORS.lightText,
      align: 'center',
      fontFace: FONTS.heading,
      valign: 'middle',
      lineSpacingMultiple: 1.0,
    });

    // Items card
    actionPlanSlide.addShape(shapes.ROUNDED_RECTANGLE, {
      x: col.x, y: 1.6, w: 2.8, h: 3.4,
      fill: { color: COLORS.lightBg },
      line: { color: COLORS.border, width: 1 },
      rectRadius: 0.08,
    });

    if (col.items.length > 0) {
      const itemRuns = [];
      col.items.forEach((it, i) => {
        itemRuns.push({ text: '●  ', options: { fontSize: 9, color: col.accentColor === COLORS.gold ? COLORS.darkText : col.accentColor, fontFace: FONTS.body } });
        itemRuns.push({
          text: stripMarkdown(it) + (i < col.items.length - 1 ? '\n\n' : ''),
          options: { fontSize: 9, color: COLORS.darkText, fontFace: FONTS.body }
        });
      });

      actionPlanSlide.addText(itemRuns, {
        x: col.x + 0.15, y: 1.75, w: 2.5, h: 3.1,
        valign: 'top',
        lineSpacingMultiple: 1.15,
        shrinkText: true,
      });
    } else {
      actionPlanSlide.addText('No tasks defined.', {
        x: col.x + 0.15, y: 1.75, w: 2.5, h: 1.0,
        fontSize: 9, color: COLORS.mutedText, fontFace: FONTS.body,
      });
    }
  });

  // ─── 5. CONCLUSION / THANK YOU SLIDE ──────────────────────────────────
  const endSlide = pptx.addSlide();
  applyDarkSlideLayout(endSlide, shapes);

  endSlide.addText('End of Report', {
    x: 0.8, y: 1.6, w: 7.0, h: 0.5,
    fontSize: 14, bold: true,
    color: COLORS.orange,
    fontFace: FONTS.heading,
  });

  endSlide.addText('Thank You.', {
    x: 0.8, y: 2.1, w: 7.0, h: 1.2,
    fontSize: 52, bold: true,
    color: COLORS.lightText,
    fontFace: FONTS.heading,
  });

  endSlide.addText('Integrity Matters  //  Building Client Success', {
    x: 0.8, y: 3.6, w: 7.0, h: 0.4,
    fontSize: 11, color: COLORS.lightMuted,
    fontFace: FONTS.body,
  });

  // Client info at bottom
  endSlide.addText(`${clientName}  •  ${generatedAt}`, {
    x: 0.8, y: 4.2, w: 7.0, h: 0.3,
    fontSize: 9, color: COLORS.lightMuted,
    fontFace: FONTS.body,
  });
}


// =============================================================================
// MODULE B: DISCOVERY & PRE-SCOPING DECK
// =============================================================================

function buildPreScopingDeck(pptx, shapes, data, clientName, generatedAt) {

  // ─── 1. TITLE SLIDE ─────────────────────────────────────────────────
  const titleSlide = pptx.addSlide();
  applyDarkSlideLayout(titleSlide, shapes);

  titleSlide.addShape(shapes.RECTANGLE, {
    x: 0.0, y: 0.0, w: 0.12, h: 5.625,
    fill: { color: COLORS.orange }
  });
  titleSlide.addShape(shapes.RECTANGLE, {
    x: 0.12, y: 0.0, w: 0.06, h: 5.625,
    fill: { color: COLORS.gold }
  });

  titleSlide.addText('INTEGRITY MATTERS // DIGITAL DISCOVERY', {
    x: 0.7, y: 1.2, w: 7.0, h: 0.4,
    fontSize: 12, bold: true,
    color: COLORS.orange,
    fontFace: FONTS.heading,
  });

  titleSlide.addText('Discovery &\nPre-Scoping', {
    x: 0.7, y: 1.7, w: 7.0, h: 1.8,
    fontSize: 48, bold: true,
    color: COLORS.lightText,
    fontFace: FONTS.heading,
    lineSpacingMultiple: 1.1,
  });

  titleSlide.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y: 3.8, w: 5.5, h: 1.2,
    fill: { color: COLORS.darkCard },
    rectRadius: 0.1,
  });

  titleSlide.addText(
    [
      { text: 'CLIENT:  ', options: { fontSize: 10, color: COLORS.orange, bold: true, fontFace: FONTS.heading } },
      { text: clientName + '\n', options: { fontSize: 10, color: COLORS.lightText, fontFace: FONTS.body } },
      { text: 'DATE:  ', options: { fontSize: 10, color: COLORS.orange, bold: true, fontFace: FONTS.heading } },
      { text: generatedAt + '\n', options: { fontSize: 10, color: COLORS.lightMuted, fontFace: FONTS.body } },
      { text: 'PREPARED BY:  ', options: { fontSize: 10, color: COLORS.orange, bold: true, fontFace: FONTS.heading } },
      { text: 'Digital Strategy Team', options: { fontSize: 10, color: COLORS.lightMuted, fontFace: FONTS.body } },
    ],
    {
      x: 0.95, y: 3.9, w: 5.0, h: 1.0,
      lineSpacingMultiple: 1.5,
      valign: 'middle',
    }
  );

  // ─── 2. COMPETITOR ANALYSIS ──────────────────────────────────────────
  const compSlide = pptx.addSlide();
  applyLightSlideLayout(compSlide, 'Competitor Benchmarking', clientName, shapes);

  const competitors = data.competitor_analysis || [];
  if (competitors.length === 0) {
    compSlide.addText('No competitor analysis provided.', {
      x: 0.5, y: 1.5, w: 9.0, h: 1.0,
      fontSize: 12, color: COLORS.mutedText, fontFace: FONTS.body,
    });
  } else {
    const maxComp = Math.min(competitors.length, 3);
    const colW = (9.0 - (0.3 * (maxComp - 1))) / maxComp;

    competitors.slice(0, 3).forEach((comp, idx) => {
      const xPos = 0.5 + (idx * (colW + 0.3));

      // Card background
      compSlide.addShape(shapes.ROUNDED_RECTANGLE, {
        x: xPos, y: 1.0, w: colW, h: 4.0,
        fill: { color: COLORS.lightBg },
        line: { color: COLORS.border, width: 1 },
        rectRadius: 0.1,
      });

      // Orange header stripe
      compSlide.addShape(shapes.RECTANGLE, {
        x: xPos, y: 1.0, w: colW, h: 0.06,
        fill: { color: COLORS.orange },
      });

      // Competitor name
      compSlide.addText(stripMarkdown(comp.competitor_name || '').toUpperCase(), {
        x: xPos + 0.15, y: 1.2, w: colW - 0.3, h: 0.3,
        fontSize: 12, bold: true,
        color: COLORS.orange,
        fontFace: FONTS.heading,
      });

      // URL
      compSlide.addText(comp.url || '', {
        x: xPos + 0.15, y: 1.5, w: colW - 0.3, h: 0.2,
        fontSize: 8, color: COLORS.mutedText,
        fontFace: FONTS.body,
      });

      // Content
      const findingsBulleted = (comp.key_findings || []).map(f => `●  ${stripMarkdown(f)}`).join('\n');
      const textBlock = [
        { text: 'Observation:\n', options: { fontSize: 8.5, bold: true, color: COLORS.darkText, fontFace: FONTS.heading } },
        { text: stripMarkdown(comp.observation || '') + '\n\n', options: { fontSize: 8, color: COLORS.mutedText, fontFace: FONTS.body } },
        { text: 'Key Findings:\n', options: { fontSize: 8.5, bold: true, color: COLORS.darkText, fontFace: FONTS.heading } },
        { text: findingsBulleted + '\n\n', options: { fontSize: 8, color: COLORS.mutedText, fontFace: FONTS.body } },
        { text: 'Takeaway:\n', options: { fontSize: 8.5, bold: true, color: COLORS.orange, fontFace: FONTS.heading } },
        { text: stripMarkdown(comp.key_takeaway || ''), options: { fontSize: 8, color: COLORS.darkText, fontFace: FONTS.body } },
      ];

      compSlide.addText(textBlock, {
        x: xPos + 0.15, y: 1.8, w: colW - 0.3, h: 3.0,
        valign: 'top',
        lineSpacingMultiple: 1.15,
        shrinkText: true,
      });
    });
  }

  // ─── 3. ACTIONABLE REQUIREMENTS ──────────────────────────────────────
  const reqSlide = pptx.addSlide();
  applyLightSlideLayout(reqSlide, 'Actionable Requirements Map', clientName, shapes);

  const actReqs = data.actionable_requirements || [];
  if (actReqs.length === 0) {
    reqSlide.addText('No actionable requirements recorded.', {
      x: 0.5, y: 1.5, w: 9.0, h: 1.0,
      fontSize: 12, color: COLORS.mutedText, fontFace: FONTS.body,
    });
  } else {
    const tableData = [
      [
        { text: 'CATEGORY', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
        { text: 'FINDING', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
        { text: 'REQUIREMENT SPECIFICATION', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
      ]
    ];

    actReqs.slice(0, 7).forEach((req, idx) => {
      const rowFill = idx % 2 === 0 ? COLORS.white : COLORS.lightBg;
      tableData.push([
        { text: stripMarkdown(req.category || 'General'), options: { color: COLORS.orange, fontFace: FONTS.heading, fontSize: 9, fill: rowFill, valign: 'middle' } },
        { text: stripMarkdown(req.finding || ''), options: { color: COLORS.darkText, fontFace: FONTS.body, fontSize: 8.5, fill: rowFill, valign: 'middle' } },
        { text: stripMarkdown(req.requirement || ''), options: { color: COLORS.mutedText, fontFace: FONTS.body, fontSize: 8.5, fill: rowFill, valign: 'middle' } },
      ]);
    });

    reqSlide.addTable(tableData, {
      x: 0.5, y: 1.0, w: 9.0,
      colW: [2.0, 3.5, 3.5],
      border: { type: 'solid', color: COLORS.border, pt: 0.5 },
    });
  }

  // ─── 4. INFORMATION ARCHITECTURE ─────────────────────────────────────
  const iaSlide = pptx.addSlide();
  applyLightSlideLayout(iaSlide, 'Information Architecture & Sitemap', clientName, shapes);

  const ia = data.information_architecture || {};

  // Left: Primary Navigation
  iaSlide.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.0, w: 4.2, h: 4.0,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.1,
  });

  iaSlide.addShape(shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 4.2, h: 0.06,
    fill: { color: COLORS.orange },
  });

  iaSlide.addText('PRIMARY NAVIGATION SITEMAP', {
    x: 0.7, y: 1.2, w: 3.8, h: 0.3,
    fontSize: 12, bold: true,
    color: COLORS.orange,
    fontFace: FONTS.heading,
  });

  const primaryPages = (ia.primary_pages || []).map(p => `●  ${stripMarkdown(p)}`).join('\n\n');
  iaSlide.addText(primaryPages || 'None defined.', {
    x: 0.7, y: 1.6, w: 3.8, h: 3.2,
    fontSize: 10, color: COLORS.darkText,
    fontFace: FONTS.body,
    lineSpacingMultiple: 1.2,
    valign: 'top',
    shrinkText: true,
  });

  // Right top: Templates
  iaSlide.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 5.0, y: 1.0, w: 4.5, h: 1.8,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.1,
  });

  iaSlide.addText('TEMPLATE-BASED PAGE STRUCTURES', {
    x: 5.2, y: 1.1, w: 4.1, h: 0.3,
    fontSize: 11, bold: true,
    color: COLORS.deepOrange,
    fontFace: FONTS.heading,
  });

  const tempText = (ia.template_based_pages || []).map(t => `${stripMarkdown(t.template_type)} (${stripMarkdown(t.usage)})`).join(' | ');
  iaSlide.addText(tempText || 'None defined.', {
    x: 5.2, y: 1.5, w: 4.1, h: 1.1,
    fontSize: 9, color: COLORS.darkText,
    fontFace: FONTS.body,
    lineSpacingMultiple: 1.2,
    valign: 'top',
    shrinkText: true,
  });

  // Right bottom: Dynamic Pages
  iaSlide.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 5.0, y: 3.0, w: 4.5, h: 2.0,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.1,
  });

  iaSlide.addText('DYNAMIC ARCHIVES & PAGES', {
    x: 5.2, y: 3.1, w: 4.1, h: 0.3,
    fontSize: 11, bold: true,
    color: COLORS.orange,
    fontFace: FONTS.heading,
  });

  const dynamicPagesText = (ia.dynamic_pages || []).map(p => `●  ${stripMarkdown(p)}`).join('\n');
  iaSlide.addText(dynamicPagesText || 'None defined.', {
    x: 5.2, y: 3.5, w: 4.1, h: 1.3,
    fontSize: 9, color: COLORS.mutedText,
    fontFace: FONTS.body,
    lineSpacingMultiple: 1.15,
    valign: 'top',
    shrinkText: true,
  });

  // ─── 5. FEATURE REQUIREMENTS ─────────────────────────────────────────
  const featSlide = pptx.addSlide();
  applyLightSlideLayout(featSlide, 'Scoped Feature Specifications', clientName, shapes);

  const featReqs = data.feature_requirements || [];
  if (featReqs.length === 0) {
    featSlide.addText('No specific feature requirements.', {
      x: 0.5, y: 1.5, w: 9.0, h: 1.0,
      fontSize: 12, color: COLORS.mutedText, fontFace: FONTS.body,
    });
  } else {
    const tableData = [
      [
        { text: 'PAGE TYPE', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
        { text: 'FEATURE SPEC', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
        { text: 'BEHAVIOR DESCRIPTION', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
        { text: 'MVP', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
      ]
    ];

    const flatFeats = [];
    featReqs.forEach((fr) => {
      const pageType = fr.page_type || 'General';
      (fr.features || []).forEach((feat) => {
        flatFeats.push({ pageType, ...feat });
      });
    });

    flatFeats.slice(0, 7).forEach((item, idx) => {
      const rowFill = idx % 2 === 0 ? COLORS.white : COLORS.lightBg;
      tableData.push([
        { text: stripMarkdown(item.pageType), options: { color: COLORS.orange, fontFace: FONTS.heading, fontSize: 8.5, fill: rowFill, valign: 'middle' } },
        { text: stripMarkdown(item.feature), options: { color: COLORS.darkText, fontFace: FONTS.body, fontSize: 8.5, bold: true, fill: rowFill, valign: 'middle' } },
        { text: stripMarkdown(item.description), options: { color: COLORS.mutedText, fontFace: FONTS.body, fontSize: 8, fill: rowFill, valign: 'middle' } },
        { text: item.mandatory ? 'YES' : 'NO (V2)', options: { color: item.mandatory ? COLORS.emerald : COLORS.amber, fontFace: FONTS.heading, fontSize: 8.5, bold: true, fill: rowFill, align: 'center', valign: 'middle' } },
      ]);
    });

    featSlide.addTable(tableData, {
      x: 0.5, y: 1.0, w: 9.0,
      colW: [1.8, 2.2, 3.8, 1.2],
      border: { type: 'solid', color: COLORS.border, pt: 0.5 },
    });
  }

  // ─── 6. FORMS AND USER JOURNEYS ──────────────────────────────────────
  const formSlide = pptx.addSlide();
  applyLightSlideLayout(formSlide, 'Forms & User Navigation Journeys', clientName, shapes);

  const fj = data.forms_and_journeys || {};

  // Left: Forms
  formSlide.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.0, w: 4.2, h: 4.0,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.1,
  });

  formSlide.addShape(shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 4.2, h: 0.06,
    fill: { color: COLORS.orange },
  });

  formSlide.addText('LEAD & CONVERSION FORMS', {
    x: 0.7, y: 1.2, w: 3.8, h: 0.3,
    fontSize: 12, bold: true,
    color: COLORS.orange,
    fontFace: FONTS.heading,
  });

  const formsList = fj.forms || [];
  if (formsList.length === 0) {
    formSlide.addText('No forms defined.', {
      x: 0.7, y: 1.6, w: 3.8, h: 1.0,
      fontSize: 10, color: COLORS.mutedText, fontFace: FONTS.body,
    });
  } else {
    const formRuns = [];
    formsList.slice(0, 3).forEach((frm, i) => {
      formRuns.push({ text: stripMarkdown(frm.form_name || ''), options: { fontSize: 9, bold: true, color: COLORS.darkText, fontFace: FONTS.heading } });
      formRuns.push({ text: `  (Page: ${stripMarkdown(frm.trigger_page || '')})\n`, options: { fontSize: 8, color: COLORS.mutedText, fontFace: FONTS.body } });
      formRuns.push({ text: `Fields: ${(frm.fields || []).map(f => stripMarkdown(f)).join(', ')}\n`, options: { fontSize: 8, color: COLORS.mutedText, fontFace: FONTS.body } });
      formRuns.push({ text: `After submit: ${stripMarkdown(frm.post_submission_action || '')}\n`, options: { fontSize: 8, color: COLORS.mutedText, fontFace: FONTS.body } });
      if (i < Math.min(formsList.length, 3) - 1) {
        formRuns.push({ text: '\n', options: { fontSize: 6 } });
      }
    });

    formSlide.addText(formRuns, {
      x: 0.7, y: 1.6, w: 3.8, h: 3.2,
      valign: 'top',
      lineSpacingMultiple: 1.2,
      shrinkText: true,
    });
  }

  // Right: User Journeys
  formSlide.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 5.0, y: 1.0, w: 4.5, h: 4.0,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.1,
  });

  formSlide.addShape(shapes.RECTANGLE, {
    x: 5.0, y: 1.0, w: 4.5, h: 0.06,
    fill: { color: COLORS.gold },
  });

  formSlide.addText('CLIENT CONVERSION JOURNEYS', {
    x: 5.2, y: 1.2, w: 4.1, h: 0.3,
    fontSize: 12, bold: true,
    color: COLORS.deepOrange,
    fontFace: FONTS.heading,
  });

  const journeys = fj.user_journeys || [];
  if (journeys.length === 0) {
    formSlide.addText('No user journeys defined.', {
      x: 5.2, y: 1.6, w: 4.1, h: 1.0,
      fontSize: 10, color: COLORS.mutedText, fontFace: FONTS.body,
    });
  } else {
    const journeyRuns = [];
    journeys.slice(0, 3).forEach((j, i) => {
      journeyRuns.push({ text: `Persona: `, options: { fontSize: 8.5, bold: true, color: COLORS.darkText, fontFace: FONTS.heading } });
      journeyRuns.push({ text: `${stripMarkdown(j.user_type || '')} (Entry: ${stripMarkdown(j.entry_point || '')})\n`, options: { fontSize: 8, color: COLORS.mutedText, fontFace: FONTS.body } });
      journeyRuns.push({ text: `Path: `, options: { fontSize: 8.5, bold: true, color: COLORS.darkText, fontFace: FONTS.heading } });
      journeyRuns.push({ text: `${stripMarkdown(j.action || '')}\n`, options: { fontSize: 8, color: COLORS.mutedText, fontFace: FONTS.body } });
      journeyRuns.push({ text: `Goal: `, options: { fontSize: 8.5, bold: true, color: COLORS.orange, fontFace: FONTS.heading } });
      journeyRuns.push({ text: stripMarkdown(j.outcome || '') + '\n', options: { fontSize: 8, color: COLORS.darkText, fontFace: FONTS.body } });
      if (i < Math.min(journeys.length, 3) - 1) {
        journeyRuns.push({ text: '\n', options: { fontSize: 6 } });
      }
    });

    formSlide.addText(journeyRuns, {
      x: 5.2, y: 1.6, w: 4.1, h: 3.2,
      valign: 'top',
      lineSpacingMultiple: 1.2,
      shrinkText: true,
    });
  }

  // ─── 7. TECHNICAL REQUIREMENTS ───────────────────────────────────────
  const techSlide = pptx.addSlide();
  applyLightSlideLayout(techSlide, 'Technical Architecture & Specifications', clientName, shapes);

  const tech = data.technical_requirements || {};
  const techSpecs = [
    { label: 'PLATFORM / CMS', val: tech.platform_cms || 'Not decided', icon: '🖥' },
    { label: 'THEME / CUSTOM DEV', val: tech.theme_structure || 'Not decided', icon: '🎨' },
    { label: 'HOSTING & INFRA', val: tech.hosting || 'Not decided', icon: '☁' },
    { label: 'PERFORMANCE', val: tech.performance || 'Not decided', icon: '⚡' },
    { label: 'SECURITY', val: tech.security || 'Not decided', icon: '🔒' },
  ];

  techSpecs.forEach((spec, idx) => {
    const yPos = 1.0 + (idx * 0.82);

    // Row card
    techSlide.addShape(shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: yPos, w: 9.0, h: 0.7,
      fill: { color: idx % 2 === 0 ? COLORS.lightBg : COLORS.white },
      line: { color: COLORS.border, width: 0.5 },
      rectRadius: 0.06,
    });

    // Orange left accent
    techSlide.addShape(shapes.RECTANGLE, {
      x: 0.5, y: yPos, w: 0.06, h: 0.7,
      fill: { color: COLORS.orange },
    });

    // Label
    techSlide.addText(spec.label, {
      x: 0.75, y: yPos + 0.1, w: 2.2, h: 0.5,
      fontSize: 10, bold: true,
      color: COLORS.orange,
      fontFace: FONTS.heading,
      valign: 'middle',
    });

    // Value
    techSlide.addText(stripMarkdown(spec.val), {
      x: 3.1, y: yPos + 0.1, w: 6.2, h: 0.5,
      fontSize: 9, color: COLORS.darkText,
      fontFace: FONTS.body,
      valign: 'middle',
      shrinkText: true,
    });
  });

  // ─── 8. CONTENT OWNERSHIP ────────────────────────────────────────────
  const ownSlide = pptx.addSlide();
  applyLightSlideLayout(ownSlide, 'Content Resource & Ownership Matrix', clientName, shapes);

  const ownership = data.content_ownership || [];
  if (ownership.length === 0) {
    ownSlide.addText('No content ownership records.', {
      x: 0.5, y: 1.5, w: 9.0, h: 1.0,
      fontSize: 12, color: COLORS.mutedText, fontFace: FONTS.body,
    });
  } else {
    const tableData = [
      [
        { text: 'SECTION', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
        { text: 'CONTENT SPEC', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
        { text: 'SOURCE', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
        { text: 'RESPONSIBILITY', options: { fill: COLORS.orange, color: COLORS.lightText, bold: true, fontFace: FONTS.heading, fontSize: 10, valign: 'middle' } },
      ]
    ];

    ownership.slice(0, 7).forEach((own, idx) => {
      const rowFill = idx % 2 === 0 ? COLORS.white : COLORS.lightBg;
      tableData.push([
        { text: stripMarkdown(own.section || 'General'), options: { color: COLORS.orange, fontFace: FONTS.heading, fontSize: 8.5, fill: rowFill, valign: 'middle' } },
        { text: stripMarkdown(own.content_required || ''), options: { color: COLORS.darkText, fontFace: FONTS.body, fontSize: 8, fill: rowFill, valign: 'middle' } },
        { text: stripMarkdown(own.source || 'New'), options: { color: COLORS.darkText, fontFace: FONTS.body, fontSize: 8.5, fill: rowFill, valign: 'middle' } },
        { text: stripMarkdown(own.responsibility || 'Client'), options: { color: COLORS.deepOrange, fontFace: FONTS.heading, fontSize: 8.5, bold: true, fill: rowFill, valign: 'middle' } },
      ]);
    });

    ownSlide.addTable(tableData, {
      x: 0.5, y: 1.0, w: 9.0,
      colW: [2.0, 3.5, 1.8, 1.7],
      border: { type: 'solid', color: COLORS.border, pt: 0.5 },
    });
  }

  // ─── 9. CONCLUSION ───────────────────────────────────────────────────
  const endSlide = pptx.addSlide();
  applyDarkSlideLayout(endSlide, shapes);

  endSlide.addText('End of Pre-Scoping Deck', {
    x: 0.8, y: 1.6, w: 7.0, h: 0.5,
    fontSize: 14, bold: true,
    color: COLORS.orange,
    fontFace: FONTS.heading,
  });

  endSlide.addText('Ready for\nReview.', {
    x: 0.8, y: 2.1, w: 7.0, h: 1.4,
    fontSize: 48, bold: true,
    color: COLORS.lightText,
    fontFace: FONTS.heading,
    lineSpacingMultiple: 1.1,
  });

  endSlide.addText('Integrity Matters  //  Building Client Success', {
    x: 0.8, y: 3.8, w: 7.0, h: 0.4,
    fontSize: 11, color: COLORS.lightMuted,
    fontFace: FONTS.body,
  });

  endSlide.addText(`${clientName}  •  ${generatedAt}`, {
    x: 0.8, y: 4.3, w: 7.0, h: 0.3,
    fontSize: 9, color: COLORS.lightMuted,
    fontFace: FONTS.body,
  });
}
