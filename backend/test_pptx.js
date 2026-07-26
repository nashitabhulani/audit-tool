import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildPPTX } from './pptx_generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log('--- Testing PPTX Generation ---');
  
  // 1. Mock Audit Data
  const mockAuditData = {
    client_name: 'Acme Corporate Services',
    url: 'https://acme-corporate-services.com',
    generated_at: new Date().toISOString(),
    overall_score: 7.8,
    sections: [
      {
        section_name: 'Performance',
        score: 6.5,
        findings: [
          { issue: 'Large Hero Image', severity: 'high', impact: 'Slows down LCP', recommendation: 'Compress image', effort_estimate: 'low' },
          { issue: 'Render Blocking CSS', severity: 'medium', impact: 'Delay paint time', recommendation: 'Defer CSS', effort_estimate: 'medium' }
        ]
      },
      {
        section_name: 'SEO',
        score: 9.0,
        findings: [
          { issue: 'Missing Alt Tags', severity: 'low', impact: 'Hurts image search SEO', recommendation: 'Add alt tags to images', effort_estimate: 'low' }
        ]
      }
    ],
    action_plan: {
      quick_wins: ['Compress hero image', 'Add alt tags'],
      medium_term: ['Defer CSS'],
      long_term: ['Rebuild checkout flow']
    }
  };

  console.log('Generating Audit PPTX Buffer...');
  const auditPPTX = buildPPTX('audit', mockAuditData);
  const auditBuffer = await auditPPTX.write('nodebuffer');
  
  const auditPath = path.join(__dirname, 'test_audit.pptx');
  fs.writeFileSync(auditPath, auditBuffer);
  console.log(`✓ Audit PPTX saved to: ${auditPath}`);

  // 2. Mock Pre-Scoping Data
  const mockPreScopingData = {
    client_name: 'Stark Industries',
    generated_at: new Date().toISOString(),
    competitor_analysis: [
      { 
        competitor_name: 'Hammer Tech', 
        url: 'https://hammertech.com', 
        observation: 'Dated design and generic templates', 
        key_findings: ['Slow loading times', 'Unsecured form submissions'], 
        key_takeaway: 'Focus on secure, ultra-modern UI design' 
      }
    ],
    actionable_requirements: [
      { category: 'UI/UX', finding: 'Notes say clean modern dark look is needed', requirement: 'Implement Tailwind dark mode theme' }
    ],
    information_architecture: {
      primary_pages: ['Home', 'Arc Reactor Tech', 'Defense Scopes', 'Contact'],
      template_based_pages: [{ template_type: 'Project Detail', usage: 'For defense projects' }],
      dynamic_pages: ['News Room']
    },
    feature_requirements: [
      {
        page_type: 'Home',
        features: [
          { feature: 'Hero Particle Effect', description: 'Interactive particles backdrop', mandatory: true }
        ]
      }
    ],
    forms_and_journeys: {
      forms: [{ form_name: 'Arc Tech Inquiry', trigger_page: 'Arc Reactor Tech', fields: ['Name', 'Affiliation', 'Request Details'], post_submission_action: 'Send secure email response' }],
      user_journeys: [{ user_type: 'Government Agent', entry_point: 'Home', action: 'Go to Defense Scopes, search projects', outcome: 'Submit inquiry form successfully' }]
    },
    technical_requirements: {
      platform_cms: 'Next.js + Sanity CMS',
      theme_structure: 'Tailwind CSS v4 custom layout',
      hosting: 'Vercel Enterprise',
      performance: 'Incremental Static Regeneration and Edge Caching',
      security: 'End-to-end TLS'
    },
    content_ownership: [
      { section: 'Arc Reactor Specs', content_required: 'Detailed dimensions and output specs', source: 'Existing', responsibility: 'Client' }
    ]
  };

  console.log('Generating Pre-Scoping PPTX Buffer...');
  const preScopingPPTX = buildPPTX('pre-scoping', mockPreScopingData);
  const preScopingBuffer = await preScopingPPTX.write('nodebuffer');
  
  const preScopingPath = path.join(__dirname, 'test_pre_scoping.pptx');
  fs.writeFileSync(preScopingPath, preScopingBuffer);
  console.log(`✓ Pre-Scoping PPTX saved to: ${preScopingPath}`);

  console.log('--- PPTX Generation Test Passed! ---');
  process.exit(0);
}

run().catch(err => {
  console.error('PPTX test failed:', err);
  process.exit(1);
});
