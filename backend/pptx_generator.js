import pptxgen from 'pptxgenjs';

// Visual Style Configuration
const COLORS = {
  bg: '0F172A',         // Slate 900
  text: 'F8FAFC',       // Slate 50
  mutedText: '94A3B8',  // Slate 400
  primary: '8B5CF6',    // Violet 500
  accent: '06B6D4',     // Cyan 500
  cardBg: '1E293B',     // Slate 800
  border: '334155',     // Slate 700
  white: 'FFFFFF',
  
  // Severity colors
  high: 'EF4444',       // Red 500
  medium: 'F59E0B',     // Amber 500
  low: '10B981'         // Emerald 500
};

const FONTS = {
  title: 'Trebuchet MS', // Highly compatible modern font
  body: 'Calibri'
};

// Helper: Add background and brand watermark
function applyBaseSlideLayout(slide, title, clientName, shapes) {
  slide.background = { fill: COLORS.bg };
  
  // Slide Title
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: 6.5,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: COLORS.accent,
    fontFace: FONTS.title
  });
  
  // Client Tag (Top Right)
  slide.addText(clientName.toUpperCase(), {
    x: 7.0,
    y: 0.3,
    w: 2.5,
    h: 0.5,
    fontSize: 10,
    bold: true,
    color: COLORS.primary,
    align: 'right',
    fontFace: FONTS.title
  });

  // Top Accent Line
  slide.addShape(shapes.RECTANGLE, {
    x: 0.5,
    y: 0.8,
    w: 9.0,
    h: 0.02,
    fill: { color: COLORS.primary }
  });
}

// Helper: Get severity color code
function getSeverityColor(sev) {
  const s = String(sev).toLowerCase();
  if (s === 'high') return COLORS.high;
  if (s === 'medium') return COLORS.medium;
  return COLORS.low;
}

export function buildPPTX(type, data) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10.0 x 5.625 inches
  const shapes = pptx.shapes || pptx.ShapeType; // Safe fallback

  const clientName = data.client_name || 'Client';
  const generatedAt = data.generated_at ? new Date(data.generated_at).toLocaleDateString() : new Date().toLocaleDateString();

  if (type === 'audit') {
    // -------------------------------------------------------------
    // MODULE A: WEBSITE AUDIT DECK
    // -------------------------------------------------------------

    // 1. TITLE SLIDE
    const titleSlide = pptx.addSlide();
    titleSlide.background = { fill: COLORS.bg };

    // Decorative graphic lines
    titleSlide.addShape(shapes.RECTANGLE, { x: 0.0, y: 0.0, w: 0.15, h: 5.625, fill: { color: COLORS.primary } });
    titleSlide.addShape(shapes.RECTANGLE, { x: 0.15, y: 0.0, w: 0.08, h: 5.625, fill: { color: COLORS.accent } });

    titleSlide.addText('GOOGLE ANTIGRAVITY // AUDIT SUITE', {
      x: 0.8, y: 1.5, w: 8.0, h: 0.4,
      fontSize: 13, bold: true, color: COLORS.accent,
      fontFace: FONTS.title
    });

    titleSlide.addText('Website Audit\nReport', {
      x: 0.8, y: 1.9, w: 8.0, h: 1.6,
      fontSize: 48, bold: true, color: COLORS.text,
      fontFace: FONTS.title
    });

    // Info Card
    titleSlide.addShape(shapes.RECTANGLE, {
      x: 0.8, y: 3.8, w: 6.0, h: 1.2,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1 }
    });

    titleSlide.addText(`CLIENT: ${clientName}\nURL: ${data.url || 'Not specified'}\nDATE: ${generatedAt}`, {
      x: 1.0, y: 3.9, w: 5.6, h: 1.0,
      fontSize: 11, color: COLORS.mutedText,
      fontFace: FONTS.body,
      lineSpacing: 22
    });

    // 2. SUMMARY SLIDE (Overall Score & Quick Wins)
    const summarySlide = pptx.addSlide();
    applyBaseSlideLayout(summarySlide, 'Executive Audit Summary', clientName, shapes);

    // Left Column: Overall Score Card
    summarySlide.addShape(shapes.RECTANGLE, {
      x: 0.5, y: 1.2, w: 3.5, h: 3.8,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1 }
    });

    summarySlide.addText('OVERALL PERFORMANCE SCORE', {
      x: 0.8, y: 1.5, w: 2.9, h: 0.4,
      fontSize: 11, bold: true, color: COLORS.mutedText,
      align: 'center', fontFace: FONTS.title
    });

    const scoreColor = data.overall_score >= 8 ? COLORS.low : (data.overall_score >= 5 ? COLORS.medium : COLORS.high);
    summarySlide.addText(String(data.overall_score || 'N/A'), {
      x: 0.8, y: 1.9, w: 2.9, h: 1.5,
      fontSize: 84, bold: true, color: scoreColor,
      align: 'center', fontFace: FONTS.title
    });

    summarySlide.addText('OUT OF 10', {
      x: 0.8, y: 3.4, w: 2.9, h: 0.3,
      fontSize: 12, bold: true, color: COLORS.mutedText,
      align: 'center', fontFace: FONTS.body
    });

    summarySlide.addText('A professional strategic audit evaluating UX, technical metrics, accessibility, and conversion elements.', {
      x: 0.8, y: 3.8, w: 2.9, h: 1.0,
      fontSize: 10, color: COLORS.mutedText,
      align: 'center', fontFace: FONTS.body
    });

    // Right Column: Strategic Quick Wins
    summarySlide.addText('STRATEGIC QUICK WINS', {
      x: 4.4, y: 1.2, w: 5.1, h: 0.4,
      fontSize: 14, bold: true, color: COLORS.accent,
      fontFace: FONTS.title
    });

    const quickWins = data.action_plan?.quick_wins || [];
    let quickWinsText = '';
    if (quickWins.length > 0) {
      quickWinsText = quickWins.map(w => `• ${w}`).join('\n\n');
    } else {
      quickWinsText = 'No quick wins specified.';
    }

    summarySlide.addText(quickWinsText, {
      x: 4.4, y: 1.7, w: 5.1, h: 3.3,
      fontSize: 11, color: COLORS.text,
      fontFace: FONTS.body,
      lineSpacing: 18
    });

    // 3. SECTIONS SLIDES
    const sections = data.sections || [];
    sections.forEach((sec) => {
      const secSlide = pptx.addSlide();
      applyBaseSlideLayout(secSlide, `${sec.section_name} Analysis`, clientName, shapes);

      // Section Score Card (Left)
      secSlide.addShape(shapes.RECTANGLE, {
        x: 0.5, y: 1.2, w: 2.5, h: 3.8,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.border, width: 1 }
      });

      secSlide.addText('SECTION SCORE', {
        x: 0.6, y: 1.5, w: 2.3, h: 0.3,
        fontSize: 11, bold: true, color: COLORS.mutedText,
        align: 'center', fontFace: FONTS.title
      });

      const sScore = sec.score || 0;
      const sColor = sScore >= 8 ? COLORS.low : (sScore >= 5 ? COLORS.medium : COLORS.high);
      
      secSlide.addText(String(sScore), {
        x: 0.6, y: 1.8, w: 2.3, h: 1.2,
        fontSize: 64, bold: true, color: sColor,
        align: 'center', fontFace: FONTS.title
      });

      secSlide.addText('/ 10', {
        x: 0.6, y: 3.0, w: 2.3, h: 0.3,
        fontSize: 12, bold: true, color: COLORS.mutedText,
        align: 'center', fontFace: FONTS.body
      });

      secSlide.addText(`Strategic evaluation covering ${sec.section_name.toLowerCase()} metrics and industry standard patterns.`, {
        x: 0.7, y: 3.4, w: 2.1, h: 1.4,
        fontSize: 9, color: COLORS.mutedText,
        align: 'center', fontFace: FONTS.body
      });

      // Findings List (Right)
      secSlide.addText('KEY FINDINGS & RECOMMENDATIONS', {
        x: 3.3, y: 1.2, w: 6.2, h: 0.4,
        fontSize: 14, bold: true, color: COLORS.accent,
        fontFace: FONTS.title
      });

      const findings = sec.findings || [];
      if (findings.length === 0) {
        secSlide.addText('No findings recorded for this section.', {
          x: 3.3, y: 1.8, w: 6.2, h: 1.0,
          fontSize: 11, color: COLORS.mutedText, fontFace: FONTS.body
        });
      } else {
        // Draw up to 3 findings to avoid overflowing
        findings.slice(0, 3).forEach((f, idx) => {
          const yPos = 1.7 + (idx * 1.1);
          
          // Severity indicator bar
          const sColorCode = getSeverityColor(f.severity);
          secSlide.addShape(shapes.RECTANGLE, {
            x: 3.3, y: yPos, w: 0.08, h: 0.9,
            fill: { color: sColorCode }
          });

          // Text content
          const findingTitle = `${f.issue.toUpperCase()} [Severity: ${f.severity.toUpperCase()} | Effort: ${f.effort_estimate.toUpperCase()}]`;
          secSlide.addText(findingTitle, {
            x: 3.5, y: yPos, w: 6.0, h: 0.25,
            fontSize: 10, bold: true, color: COLORS.text,
            fontFace: FONTS.title
          });

          const bodyContent = `Impact: ${f.impact}\nRecommendation: ${f.recommendation}`;
          secSlide.addText(bodyContent, {
            x: 3.5, y: yPos + 0.25, w: 6.0, h: 0.65,
            fontSize: 9, color: COLORS.mutedText,
            fontFace: FONTS.body,
            lineSpacing: 14
          });
        });
      }
    });

    // 4. ACTION PLAN DEEP DIVE SLIDE
    const actionPlanSlide = pptx.addSlide();
    applyBaseSlideLayout(actionPlanSlide, 'Strategic Action Roadmap', clientName, shapes);

    const ap = data.action_plan || {};
    const roadmap = [
      { title: 'QUICK WINS (Short-Term)', items: ap.quick_wins || [], x: 0.5, color: COLORS.accent },
      { title: 'MEDIUM-TERM ROUTINE', items: ap.medium_term || [], x: 3.6, color: COLORS.primary },
      { title: 'LONG-TERM EVOLUTION', items: ap.long_term || [], x: 6.7, color: COLORS.mutedText }
    ];

    roadmap.forEach((col) => {
      // Column Header Box
      actionPlanSlide.addShape(shapes.RECTANGLE, {
        x: col.x, y: 1.2, w: 2.8, h: 0.4,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.border, width: 1 }
      });

      actionPlanSlide.addText(col.title, {
        x: col.x + 0.1, y: 1.25, w: 2.6, h: 0.3,
        fontSize: 10, bold: true, color: col.color,
        align: 'center', fontFace: FONTS.title
      });

      // Items text box
      const content = col.items.map(it => `• ${it}`).join('\n\n');
      actionPlanSlide.addText(content || 'No tasks defined.', {
        x: col.x, y: 1.8, w: 2.8, h: 3.2,
        fontSize: 9, color: COLORS.text,
        fontFace: FONTS.body,
        lineSpacing: 15
      });
    });

    // 5. CONCLUSION / THANK YOU SLIDE
    const endSlide = pptx.addSlide();
    endSlide.background = { fill: COLORS.bg };

    endSlide.addShape(shapes.RECTANGLE, { x: 0.0, y: 0.0, w: 10.0, h: 0.1, fill: { color: COLORS.primary } });

    endSlide.addText('End of Report', {
      x: 1.0, y: 2.0, w: 8.0, h: 0.5,
      fontSize: 16, bold: true, color: COLORS.accent,
      align: 'center', fontFace: FONTS.title
    });

    endSlide.addText('Thank You.', {
      x: 1.0, y: 2.5, w: 8.0, h: 1.0,
      fontSize: 48, bold: true, color: COLORS.text,
      align: 'center', fontFace: FONTS.title
    });

    endSlide.addText('Google Antigravity // Building Client Success', {
      x: 1.0, y: 3.8, w: 8.0, h: 0.4,
      fontSize: 12, color: COLORS.mutedText,
      align: 'center', fontFace: FONTS.body
    });

  } else if (type === 'pre-scoping') {
    // -------------------------------------------------------------
    // MODULE B: DISCOVERY & PRE-SCOPING DECK
    // -------------------------------------------------------------

    // 1. TITLE SLIDE
    const titleSlide = pptx.addSlide();
    titleSlide.background = { fill: COLORS.bg };

    titleSlide.addShape(shapes.RECTANGLE, { x: 0.0, y: 0.0, w: 0.15, h: 5.625, fill: { color: COLORS.primary } });
    titleSlide.addShape(shapes.RECTANGLE, { x: 0.15, y: 0.0, w: 0.08, h: 5.625, fill: { color: COLORS.accent } });

    titleSlide.addText('GOOGLE ANTIGRAVITY // DIGITAL DISCOVERY', {
      x: 0.8, y: 1.5, w: 8.0, h: 0.4,
      fontSize: 13, bold: true, color: COLORS.accent,
      fontFace: FONTS.title
    });

    titleSlide.addText('Discovery &\nPre-Scoping', {
      x: 0.8, y: 1.9, w: 8.0, h: 1.6,
      fontSize: 48, bold: true, color: COLORS.text,
      fontFace: FONTS.title
    });

    titleSlide.addShape(shapes.RECTANGLE, {
      x: 0.8, y: 3.8, w: 6.0, h: 1.2,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1 }
    });

    titleSlide.addText(`CLIENT: ${clientName}\nDATE: ${generatedAt}\nPREPARED BY: Digital Strategy Team`, {
      x: 1.0, y: 3.9, w: 5.6, h: 1.0,
      fontSize: 11, color: COLORS.mutedText,
      fontFace: FONTS.body,
      lineSpacing: 22
    });

    // 2. COMPETITOR ANALYSIS
    const compSlide = pptx.addSlide();
    applyBaseSlideLayout(compSlide, 'Competitor Benchmarking', clientName, shapes);

    const competitors = data.competitor_analysis || [];
    if (competitors.length === 0) {
      compSlide.addText('No competitor analysis provided.', {
        x: 0.5, y: 1.5, w: 9.0, h: 1.0,
        fontSize: 12, color: COLORS.mutedText, fontFace: FONTS.body
      });
    } else {
      // Create horizontal block grid (up to 3 competitors)
      const maxComp = Math.min(competitors.length, 3);
      const colW = (9.0 - (0.3 * (maxComp - 1))) / maxComp;

      competitors.slice(0, 3).forEach((comp, idx) => {
        const xPos = 0.5 + (idx * (colW + 0.3));

        compSlide.addShape(shapes.RECTANGLE, {
          x: xPos, y: 1.2, w: colW, h: 3.8,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.border, width: 1 }
        });

        compSlide.addText(comp.competitor_name.toUpperCase(), {
          x: xPos + 0.15, y: 1.4, w: colW - 0.3, h: 0.3,
          fontSize: 12, bold: true, color: COLORS.accent,
          fontFace: FONTS.title
        });

        compSlide.addText(comp.url || '', {
          x: xPos + 0.15, y: 1.7, w: colW - 0.3, h: 0.2,
          fontSize: 9, color: COLORS.primary,
          fontFace: FONTS.body
        });

        const findingsBulleted = (comp.key_findings || []).map(f => `• ${f}`).join('\n');
        const textBlock = `Observation:\n${comp.observation}\n\nKey Findings:\n${findingsBulleted}\n\nTakeaway:\n${comp.key_takeaway}`;
        compSlide.addText(textBlock, {
          x: xPos + 0.15, y: 2.0, w: colW - 0.3, h: 2.8,
          fontSize: 8.5, color: COLORS.text,
          fontFace: FONTS.body,
          lineSpacing: 13
        });
      });
    }

    // 3. ACTIONABLE REQUIREMENTS
    const reqSlide = pptx.addSlide();
    applyBaseSlideLayout(reqSlide, 'Actionable Requirements Map', clientName, shapes);

    const actReqs = data.actionable_requirements || [];
    if (actReqs.length === 0) {
      reqSlide.addText('No actionable requirements recorded.', {
        x: 0.5, y: 1.5, w: 9.0, h: 1.0,
        fontSize: 12, color: COLORS.mutedText, fontFace: FONTS.body
      });
    } else {
      // Build native PPTX table
      const tableData = [
        [
          { text: 'CATEGORY', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } },
          { text: 'FINDING', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } },
          { text: 'REQUIREMENT SPECIFICATION', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } }
        ]
      ];

      actReqs.slice(0, 6).forEach((req) => {
        tableData.push([
          { text: req.category || 'General', options: { color: COLORS.accent, fontFace: FONTS.title, fontSize: 9 } },
          { text: req.finding || '', options: { color: COLORS.text, fontFace: FONTS.body, fontSize: 8.5 } },
          { text: req.requirement || '', options: { color: COLORS.mutedText, fontFace: FONTS.body, fontSize: 8.5 } }
        ]);
      });

      reqSlide.addTable(tableData, {
        x: 0.5, y: 1.2, w: 9.0, h: 3.8,
        colW: [2.0, 3.5, 3.5],
        border: { type: 'solid', color: COLORS.border, pt: 1 },
        fill: { color: COLORS.cardBg }
      });
    }

    // 4. INFORMATION ARCHITECTURE
    const iaSlide = pptx.addSlide();
    applyBaseSlideLayout(iaSlide, 'Information Architecture & Sitemap', clientName, shapes);

    const ia = data.information_architecture || {};
    
    // Core Sitemap Box
    iaSlide.addShape(shapes.RECTANGLE, {
      x: 0.5, y: 1.2, w: 4.2, h: 3.8,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1 }
    });

    iaSlide.addText('PRIMARY NAVIGATION SITEMAP', {
      x: 0.7, y: 1.4, w: 3.8, h: 0.3,
      fontSize: 12, bold: true, color: COLORS.accent,
      fontFace: FONTS.title
    });

    const primaryPagesText = (ia.primary_pages || []).map(p => `• ${p}`).join('\n\n');
    iaSlide.addText(primaryPagesText || 'None defined.', {
      x: 0.7, y: 1.8, w: 3.8, h: 3.0,
      fontSize: 10, color: COLORS.text,
      fontFace: FONTS.body,
      lineSpacing: 14
    });

    // Secondary Structure Columns (Right Stacked)
    // Templates Box
    iaSlide.addShape(shapes.RECTANGLE, {
      x: 5.0, y: 1.2, w: 4.5, h: 1.8,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1 }
    });

    iaSlide.addText('TEMPLATE-BASED PAGE STRUCTURES', {
      x: 5.2, y: 1.3, w: 4.1, h: 0.3,
      fontSize: 11, bold: true, color: COLORS.primary,
      fontFace: FONTS.title
    });

    const tempText = (ia.template_based_pages || []).map(t => `${t.template_type} (${t.usage})`).join(' | ');
    iaSlide.addText(tempText || 'None defined.', {
      x: 5.2, y: 1.6, w: 4.1, h: 1.2,
      fontSize: 9, color: COLORS.text,
      fontFace: FONTS.body,
      lineSpacing: 14
    });

    // Dynamic Pages Box
    iaSlide.addShape(shapes.RECTANGLE, {
      x: 5.0, y: 3.2, w: 4.5, h: 1.8,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1 }
    });

    iaSlide.addText('DYNAMIC ARCHIVES & PAGES', {
      x: 5.2, y: 3.3, w: 4.1, h: 0.3,
      fontSize: 11, bold: true, color: COLORS.accent,
      fontFace: FONTS.title
    });

    const dynamicPagesText = (ia.dynamic_pages || []).map(p => `• ${p}`).join('\n');
    iaSlide.addText(dynamicPagesText || 'None defined.', {
      x: 5.2, y: 3.6, w: 4.1, h: 1.2,
      fontSize: 9, color: COLORS.mutedText,
      fontFace: FONTS.body,
      lineSpacing: 12
    });

    // 5. FEATURE REQUIREMENTS
    const featSlide = pptx.addSlide();
    applyBaseSlideLayout(featSlide, 'Scoped Feature Specifications', clientName, shapes);

    const featReqs = data.feature_requirements || [];
    if (featReqs.length === 0) {
      featSlide.addText('No specific feature requirements.', {
        x: 0.5, y: 1.5, w: 9.0, h: 1.0,
        fontSize: 12, color: COLORS.mutedText, fontFace: FONTS.body
      });
    } else {
      const tableData = [
        [
          { text: 'PAGE TYPE', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } },
          { text: 'FEATURE SPEC', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } },
          { text: 'BEHAVIOR DESCRIPTION', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } },
          { text: 'MANDATORY (MVP)', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } }
        ]
      ];

      // Flatten nested features
      const flatFeats = [];
      featReqs.forEach((fr) => {
        const pageType = fr.page_type || 'General';
        (fr.features || []).forEach((feat) => {
          flatFeats.push({ pageType, ...feat });
        });
      });

      flatFeats.slice(0, 6).forEach((item) => {
        tableData.push([
          { text: item.pageType, options: { color: COLORS.accent, fontFace: FONTS.title, fontSize: 8.5 } },
          { text: item.feature, options: { color: COLORS.text, fontFace: FONTS.body, fontSize: 8.5, bold: true } },
          { text: item.description, options: { color: COLORS.mutedText, fontFace: FONTS.body, fontSize: 8 } },
          { text: item.mandatory ? 'YES' : 'NO (V2)', options: { color: item.mandatory ? COLORS.low : COLORS.medium, fontFace: FONTS.title, fontSize: 8.5, bold: true } }
        ]);
      });

      featSlide.addTable(tableData, {
        x: 0.5, y: 1.2, w: 9.0, h: 3.8,
        colW: [1.8, 2.2, 3.8, 1.2],
        border: { type: 'solid', color: COLORS.border, pt: 1 },
        fill: { color: COLORS.cardBg }
      });
    }

    // 6. FORMS AND USER JOURNEYS
    const formSlide = pptx.addSlide();
    applyBaseSlideLayout(formSlide, 'Forms & User Navigation Journeys', clientName, shapes);

    const fj = data.forms_and_journeys || {};
    
    // Left Box: Forms Scoped
    formSlide.addShape(shapes.RECTANGLE, {
      x: 0.5, y: 1.2, w: 4.2, h: 3.8,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1 }
    });

    formSlide.addText('SCOPED LEAD & CONVERSION FORMS', {
      x: 0.7, y: 1.4, w: 3.8, h: 0.3,
      fontSize: 12, bold: true, color: COLORS.accent,
      fontFace: FONTS.title
    });

    const formsList = fj.forms || [];
    if (formsList.length === 0) {
      formSlide.addText('No forms defined.', { x: 0.7, y: 1.8, w: 3.8, h: 1.0, fontSize: 10, color: COLORS.mutedText, fontFace: FONTS.body });
    } else {
      let formText = '';
      formsList.slice(0, 3).forEach((frm) => {
        formText += `**${frm.form_name}** (Page: ${frm.trigger_page})\n`;
        formText += `Fields: ${(frm.fields || []).join(', ')}\n`;
        formText += `After submit: ${frm.post_submission_action}\n\n`;
      });
      formSlide.addText(formText, {
        x: 0.7, y: 1.8, w: 3.8, h: 3.0,
        fontSize: 8.5, color: COLORS.text,
        fontFace: FONTS.body,
        lineSpacing: 13
      });
    }

    // Right Box: User Journeys
    formSlide.addShape(shapes.RECTANGLE, {
      x: 5.0, y: 1.2, w: 4.5, h: 3.8,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1 }
    });

    formSlide.addText('CRITICAL CLIENT CONVERSION JOURNEYS', {
      x: 5.2, y: 1.4, w: 4.1, h: 0.3,
      fontSize: 12, bold: true, color: COLORS.primary,
      fontFace: FONTS.title
    });

    const journeys = fj.user_journeys || [];
    if (journeys.length === 0) {
      formSlide.addText('No user journeys defined.', { x: 5.2, y: 1.8, w: 4.1, h: 1.0, fontSize: 10, color: COLORS.mutedText, fontFace: FONTS.body });
    } else {
      let journeyText = '';
      journeys.slice(0, 3).forEach((j) => {
        journeyText += `Persona: ${j.user_type} (Entry: ${j.entry_point})\n`;
        journeyText += `Path: ${j.action}\n`;
        journeyText += `Goal: ${j.outcome}\n\n`;
      });
      formSlide.addText(journeyText, {
        x: 5.2, y: 1.8, w: 4.1, h: 3.0,
        fontSize: 8.5, color: COLORS.text,
        fontFace: FONTS.body,
        lineSpacing: 13
      });
    }

    // 7. TECHNICAL REQUIREMENTS
    const techSlide = pptx.addSlide();
    applyBaseSlideLayout(techSlide, 'Technical Architecture & Specifications', clientName, shapes);

    const tech = data.technical_requirements || {};
    const techSpecs = [
      { label: 'PLATFORM / CMS', val: tech.platform_cms || 'Not decided', y: 1.2 },
      { label: 'THEME / CUSTOM DEVELOPMENT', val: tech.theme_structure || 'Not decided', y: 1.9 },
      { label: 'HOSTING & INFRASTRUCTURE', val: tech.hosting || 'Not decided', y: 2.6 },
      { label: 'PERFORMANCE OPTIMIZATION', val: tech.performance || 'Not decided', y: 3.3 },
      { label: 'SECURITY & HARDENING', val: tech.security || 'Not decided', y: 4.0 }
    ];

    techSpecs.forEach((spec) => {
      // Small card for each spec
      techSlide.addShape(shapes.RECTANGLE, {
        x: 0.5, y: spec.y, w: 9.0, h: 0.6,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.border, width: 1 }
      });

      techSlide.addText(spec.label, {
        x: 0.7, y: spec.y + 0.15, w: 2.2, h: 0.3,
        fontSize: 10, bold: true, color: COLORS.accent,
        fontFace: FONTS.title
      });

      techSlide.addText(spec.val, {
        x: 3.0, y: spec.y + 0.1, w: 6.3, h: 0.4,
        fontSize: 9, color: COLORS.text,
        fontFace: FONTS.body
      });
    });

    // 8. CONTENT OWNERSHIP
    const ownSlide = pptx.addSlide();
    applyBaseSlideLayout(ownSlide, 'Content Resource & Ownership Matrix', clientName, shapes);

    const ownership = data.content_ownership || [];
    if (ownership.length === 0) {
      ownSlide.addText('No content ownership records.', {
        x: 0.5, y: 1.5, w: 9.0, h: 1.0,
        fontSize: 12, color: COLORS.mutedText, fontFace: FONTS.body
      });
    } else {
      const tableData = [
        [
          { text: 'CONTENT NODE / SECTION', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } },
          { text: 'CONTENT SPECIFICATION', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } },
          { text: 'SOURCE STATUS', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } },
          { text: 'PRIMARY RESPONSIBILITY', options: { fill: COLORS.primary, color: COLORS.white, bold: true, fontFace: FONTS.title, fontSize: 10 } }
        ]
      ];

      ownership.slice(0, 6).forEach((own) => {
        tableData.push([
          { text: own.section || 'General', options: { color: COLORS.accent, fontFace: FONTS.title, fontSize: 8.5 } },
          { text: own.content_required || '', options: { color: COLORS.text, fontFace: FONTS.body, fontSize: 8 } },
          { text: own.source || 'New', options: { color: COLORS.text, fontFace: FONTS.body, fontSize: 8.5 } },
          { text: own.responsibility || 'Client', options: { color: COLORS.primary, fontFace: FONTS.title, fontSize: 8.5, bold: true } }
        ]);
      });

      ownSlide.addTable(tableData, {
        x: 0.5, y: 1.2, w: 9.0, h: 3.8,
        colW: [2.0, 3.5, 1.8, 1.7],
        border: { type: 'solid', color: COLORS.border, pt: 1 },
        fill: { color: COLORS.cardBg }
      });
    }

    // 9. CONCLUSION
    const endSlide = pptx.addSlide();
    endSlide.background = { fill: COLORS.bg };

    endSlide.addShape(shapes.RECTANGLE, { x: 0.0, y: 0.0, w: 10.0, h: 0.1, fill: { color: COLORS.primary } });

    endSlide.addText('End of Pre-Scoping Deck', {
      x: 1.0, y: 2.0, w: 8.0, h: 0.5,
      fontSize: 16, bold: true, color: COLORS.accent,
      align: 'center', fontFace: FONTS.title
    });

    endSlide.addText('Ready for Review.', {
      x: 1.0, y: 2.5, w: 8.0, h: 1.0,
      fontSize: 48, bold: true, color: COLORS.text,
      align: 'center', fontFace: FONTS.title
    });

    endSlide.addText('Google Antigravity // Building Client Success', {
      x: 1.0, y: 3.8, w: 8.0, h: 0.4,
      fontSize: 12, color: COLORS.mutedText,
      align: 'center', fontFace: FONTS.body
    });
  }

  return pptx;
}
