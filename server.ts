import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// AI Handover endpoint
app.post('/api/ai-handover', async (req, res) => {
  try {
    const {
      patientName,
      assessments = [],
      treatmentSessions = [],
      progressMeasurements = [],
      rehabilitationPlans = [],
      reasonForTransfer = 'Physiotherapist change requested by patient',
    } = req.body;

    let summaryResult = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a clinical physiotherapy handover documentation assistant.
Analyze the following patient rehabilitation history and produce a structured handover summary for the incoming receiving physiotherapist.

MANDATORY SAFETY RULES:
1. NEVER invent clinical findings or data not present in records.
2. NEVER diagnose the patient or suggest autonomous medical conclusions.
3. NEVER prescribe or change treatment; state that incoming clinician assessment is required.
4. Clearly state missing or unclear information.
5. Reference source record dates and types.

Return ONLY a valid JSON object with these exact keys:
{
  "reasonForRehab": "string",
  "clinicalHistory": "string",
  "keyFindings": "string",
  "interventionsPerformed": "string",
  "currentProgressAndGoals": "string",
  "precautionsAndContraindications": "string",
  "missingOrUnclearInfo": "string",
  "fullSummaryText": "string"
}

Patient: ${patientName || 'Anonymous'}
Transfer Reason: ${reasonForTransfer}
Assessments: ${JSON.stringify(assessments.slice(0, 5))}
Sessions: ${JSON.stringify(treatmentSessions.slice(0, 10))}
Metrics: ${JSON.stringify(progressMeasurements.slice(0, 10))}
Plans: ${JSON.stringify(rehabilitationPlans.slice(0, 3))}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        summaryResult = JSON.parse(text);
      } catch (genAiError) {
        console.warn('Gemini API call failed, falling back to deterministic summary:', genAiError);
      }
    }

    if (!summaryResult) {
      const latestAssessment = assessments[assessments.length - 1] || {};
      const lastSession = treatmentSessions[treatmentSessions.length - 1] || {};
      const latestMetric = progressMeasurements[progressMeasurements.length - 1] || {};

      summaryResult = {
        reasonForRehab: latestAssessment.chiefComplaint || 'Rehabilitation for functional and musculoskeletal improvement.',
        clinicalHistory: `${latestAssessment.historyOfIllness || 'Patient undergoing guided physiotherapy.'} Relevant history: ${latestAssessment.medicalHistory || 'None documented'}.`,
        keyFindings: `Initial pain score: ${latestAssessment.painIntensity ?? 'N/A'}/10 at ${latestAssessment.painLocation || 'affected site'}. Clinical impression: ${latestAssessment.clinicalImpression || 'Active management'}.`,
        interventionsPerformed: treatmentSessions.length
          ? `Total documented sessions: ${treatmentSessions.length}. Interventions: ${lastSession.interventions?.join(', ') || 'Therapeutic exercises, joint mobilization, neuromuscular re-education'}.`
          : 'No prior individual treatment sessions documented.',
        currentProgressAndGoals: `Goals: ${latestAssessment.shortTermGoals || 'Pain relief and mobility restoration'}. Recent pain score: ${latestMetric.painScore ?? 'N/A'}/10.`,
        precautionsAndContraindications: latestAssessment.precautions || 'Maintain standard activity pacing and monitor pain thresholds during progressive loading.',
        missingOrUnclearInfo: !assessments.length ? 'Baseline formal assessment missing.' : 'Follow-up objective range-of-motion reassessment pending.',
        fullSummaryText: `Rehabilitation Continuity Summary for ${patientName}:\nTransfer reason: ${reasonForTransfer}.\nDocumented records: ${assessments.length} assessment(s), ${treatmentSessions.length} session(s).\nReceiving physiotherapist must conduct an independent physical assessment before updating treatment.`,
      };
    }

    res.json({
      success: true,
      data: summaryResult,
      sourceRecordCount: {
        assessments: assessments.length,
        sessions: treatmentSessions.length,
        metrics: progressMeasurements.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Serve frontend dist files in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`PhysioGo Server listening on port ${port}`);
});
