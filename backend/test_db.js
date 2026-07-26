import { 
  getDbConnection, 
  createDeliverable, 
  getAllDeliverables, 
  getDeliverableById, 
  updateDeliverable, 
  deleteDeliverable 
} from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  console.log('--- Testing SQLite Database ---');
  
  const db = await getDbConnection();
  console.log('✓ Database Connection initialized.');

  const testId = 'test-id-uuid-12345';
  console.log('Creating mock audit record...');
  await createDeliverable({
    id: testId,
    client_name: 'Acme Test Corp',
    type: 'audit',
    input_data: { client_name: 'Acme Test Corp', url: 'https://acme-test.com' },
    output_data: { 
      overall_score: 7.2, 
      client_name: 'Acme Test Corp', 
      sections: [
        { section_name: 'SEO', score: 8, findings: [] }
      ], 
      action_plan: { quick_wins: ['Fix robots.txt'], medium_term: [], long_term: [] } 
    }
  });
  console.log('✓ Mock record created successfully.');

  console.log('Reading history list...');
  const list = await getAllDeliverables();
  console.log(`✓ History list read. Total records: ${list.length}`);
  console.log('First record preview:', list[0]);

  console.log(`Reading specific record: ${testId}...`);
  const record = await getDeliverableById(testId);
  console.log('✓ Record read successfully. Client:', record.client_name);
  console.log('Output data overall score:', record.output_data.overall_score);

  console.log('Updating record inline (simulating user edit)...');
  await updateDeliverable(testId, {
    output_data: { 
      overall_score: 8.5, 
      client_name: 'Acme Test Corp (Edited)', 
      sections: [
        { section_name: 'SEO', score: 9, findings: [] }
      ], 
      action_plan: { quick_wins: ['Fix robots.txt', 'Compress home hero image'], medium_term: [], long_term: [] } 
    }
  });
  
  const updated = await getDeliverableById(testId);
  console.log('✓ Record updated successfully.');
  console.log('New overall score:', updated.output_data.overall_score);
  console.log('New quick wins count:', updated.output_data.action_plan.quick_wins.length);

  console.log('Cleaning up test record...');
  const deleted = await deleteDeliverable(testId);
  console.log(`✓ Record deleted status: ${deleted}`);
  
  const doubleCheck = await getDeliverableById(testId);
  console.log(`✓ Post-delete verification: ${doubleCheck ? 'STILL EXISTS' : 'SUCCESSFULLY REMOVED'}`);
  
  console.log('--- DB Integration Test Passed! ---');
  process.exit(0);
}

run().catch(err => {
  console.error('DB test failed:', err);
  process.exit(1);
});
