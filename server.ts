import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Mentor API endpoint
app.post('/api/mentor', async (req, res) => {
  try {
    const { question, topicContext } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        hasApiKey: false,
        message: 'No API key configured on server. Using built-in local knowledge base.',
      });
    }

    const systemPrompt = `You are ElectronX Mentor, a premier scientific electronics assistant and virtual laboratory instructor for B.Tech Electronics and Semiconductor Device Physics (Course: Basic Electronic Devices PCCEC301).

When answering students, structure your response clearly using these 5 exact sections with Markdown headers:
### 1. Simple Explanation
(A clean, crystal-clear conceptual summary without unnecessary jargon)

### 2. Engineering Explanation
(Rigorous device physics: carrier drift/diffusion, band bending, depletion dynamics, recombination, or E-fields)

### 3. Key Formulas & Equations
(Accurate mathematical expressions with all variable symbols defined and SI units)

### 4. Visual & Physical Intuition
(A vivid description of what is physically happening to electrons, holes, ions, or depletion barriers)

### 5. Real-World Applications & Lab Insight
(Practical usage in modern ICs, power electronics, sensors, and practical measurement caveats)

Keep the tone professional, authoritative yet encouraging, clear, and academically rigorous.`;

    const contents = topicContext
      ? `Topic Context: ${topicContext}\n\nStudent Question: ${question}`
      : `Student Question: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    return res.json({
      hasApiKey: true,
      answer: response.text || 'Unable to generate response.',
    });
  } catch (err: any) {
    console.error('Gemini Mentor API error:', err);
    return res.status(500).json({
      hasApiKey: false,
      error: 'AI service temporarily unavailable. Using local knowledge fallback.',
      details: err?.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    lab: 'ElectronX Laboratory Core',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Vite middleware for dev / static for production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ElectronX Lab Server active on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
