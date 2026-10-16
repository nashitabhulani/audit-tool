import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environmental variables from the parent of the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

import { 
  getAllDeliverables, 
  getDeliverableById, 
  createDeliverable, 
  updateDeliverable, 
  deleteDeliverable 
} from './db.js';
import { generateDeliverableJSON } from './llm.js';
import { buildPPTX } from './pptx_generator.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes

// 1. Get history list
app.get('/api/deliverables', async (req, res) => {
  try {
    const list = await getAllDeliverables();
    res.json(list);
  } catch (error) {
    console.error('Error listing deliverables:', error);
    res.status(500).json({ error: 'Failed to retrieve deliverables history list.' });
  }
});

// 2. Get single deliverable details
app.get('/api/deliverables/:id', async (req, res) => {
  try {
    const item = await getDeliverableById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Deliverable not found.' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching deliverable:', error);
    res.status(500).json({ error: 'Failed to retrieve deliverable details.' });
  }
});

// 3. Generate new deliverable
app.post('/api/deliverables', async (req, res) => {
  const { type, inputs } = req.body;
  
  if (!type || !['audit', 'pre-scoping'].includes(type)) {
    return res.status(400).json({ error: 'Invalid or missing deliverable type.' });
  }
  if (!inputs || !inputs.client_name) {
    return res.status(400).json({ error: 'Client name is required.' });
  }

  try {
    console.log(`Starting generation for: ${inputs.client_name} (${type})`);
    
    // Call LLM generator (enforces schema + retry)
    const generatedJSON = await generateDeliverableJSON(type, inputs);
    
    // Create new deliverable record
    const id = uuidv4();
    const clientName = inputs.client_name;
    
    const record = await createDeliverable({
      id,
      client_name: clientName,
      type,
      input_data: inputs,
      output_data: generatedJSON
    });

    console.log(`Successfully generated and saved deliverable ID: ${id}`);
    res.status(201).json(record);
  } catch (error) {
    console.error('Generation failed:', error);
    res.status(500).json({ 
      error: 'Failed to generate deliverable.', 
      details: error.message 
    });
  }
});

// 4. Update / Save inline edits
app.put('/api/deliverables/:id', async (req, res) => {
  const { output_data } = req.body;
  if (!output_data) {
    return res.status(400).json({ error: 'Missing output_data parameter.' });
  }

  try {
    const updated = await updateDeliverable(req.params.id, { output_data });
    if (!updated) {
      return res.status(404).json({ error: 'Deliverable not found to update.' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating deliverable:', error);
    res.status(500).json({ error: 'Failed to update deliverable.' });
  }
});

// 5. Delete deliverable
app.delete('/api/deliverables/:id', async (req, res) => {
  try {
    const success = await deleteDeliverable(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Deliverable not found to delete.' });
    }
    res.json({ success: true, message: 'Deliverable deleted successfully.' });
  } catch (error) {
    console.error('Error deleting deliverable:', error);
    res.status(500).json({ error: 'Failed to delete deliverable.' });
  }
});

// Export the report data sent by the browser, without relying on serverless persistence.
app.post('/api/deliverables/export', async (req, res) => {
  try {
    const { type, client_name, output_data } = req.body;
    if (!type || !output_data) {
      return res.status(400).json({ error: 'Missing type or output_data for export.' });
    }

    console.log(`Building PPTX for: ${client_name || 'Unknown'} (${type})`);

    const pptx = buildPPTX(type, output_data);
    const buffer = await pptx.write('nodebuffer');
    const safeClientName = (client_name || 'report').replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeClientName}_${type}_deck.pptx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('PPTX export failed:', error);
    res.status(500).json({ error: 'Failed to generate PPTX.', details: error.message });
  }
});

// 6. Export to PPTX
app.get('/api/deliverables/:id/export', async (req, res) => {
  try {
    const deliverable = await getDeliverableById(req.params.id);
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found for export.' });
    }

    console.log(`Building PPTX for: ${deliverable.client_name} (${deliverable.type})`);
    
    // Build the PowerPoint layout
    const pptx = buildPPTX(deliverable.type, deliverable.output_data);
    
    // Write presentation out to buffer
    const buffer = await pptx.write('nodebuffer');
    
    // Stream download back to client
    const safeClientName = deliverable.client_name.replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeClientName}_${deliverable.type}_deck.pptx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('PPTX export failed:', error);
    res.status(500).json({ error: 'Failed to generate PPTX download file.', details: error.message });
  }
});

// Root endpoint for health checks (Render, etc.)
app.get('/', (req, res) => {
  res.send('Google Antigravity Backend is running and ready for API requests.');
});

// Fallback for missing API routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Startup Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Google Antigravity Client Deliverable Toolkit Backend`);
  console.log(`Server listening on port http://localhost:${PORT}`);
  console.log(`====================================================`);
});
