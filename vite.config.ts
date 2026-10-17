import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function apiHandoverPlugin(): Plugin {
  return {
    name: 'api-handover-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/ai-handover' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const {
                patientName,
                assessments = [],
                treatmentSessions = [],
                progressMeasurements = [],
                rehabilitationPlans = [],
                reasonForTransfer = 'Physiotherapist change requested by patient',
              } = data;

              let summaryResult = null;
              const apiKey = process.env.GEMINI_API_KEY;

              if (apiKey) {
                try {
                  const { GoogleGenAI } = await import('@google/genai');
                  const ai = new GoogleGenAI({ apiKey });

                  const clinicalContext = `
Patient: ${patientName || 'Anonymous Patient'}
Transfer Reason: ${reasonForTransfer}

Initial & Follow-up Assessments (${assessments.length}):
${JSON.stringify(assessments.slice(0, 5), null, 2)}

Recent Treatment Sessions (${treatmentSessions.length}):
${JSON.stringify(treatmentSessions.slice(0, 10), null, 2)}

Progress Metrics Recorded (${progressMeasurements.length}):
${JSON.stringify(progressMeasurements.slice(0, 10), null, 2)}

Rehabilitation Plans Prescribed (${rehabilitationPlans.length}):
${JSON.stringify(rehabilitationPlans.slice(0, 3), null, 2)}
`;

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

Clinical Data:
${clinicalContext}`;

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
                  console.warn('Gemini API call fell back to deterministic summary:', genAiError);
                }
              }

              // Fallback / deterministic synthesis if API key not set or failed
              if (!summaryResult) {
                const latestAssessment = assessments[assessments.length - 1] || {};
                const lastSession = treatmentSessions[treatmentSessions.length - 1] || {};
                const latestMetric = progressMeasurements[progressMeasurements.length - 1] || {};

                summaryResult = {
                  reasonForRehab: latestAssessment.chiefComplaint || 'Rehabilitation for musculoskeletal/functional impairment.',
                  clinicalHistory: `${latestAssessment.historyOfIllness || 'Patient referred for ongoing physiotherapy care.'} Medical history: ${latestAssessment.medicalHistory || 'None documented'}.`,
                  keyFindings: `Initial pain scale: ${latestAssessment.painIntensity ?? 'N/A'}/10 at ${latestAssessment.painLocation || 'affected area'}. Posture observation: ${latestAssessment.postureObservation || 'Documented'}. Clinical impression: ${latestAssessment.clinicalImpression || 'Under review'}.`,
                  interventionsPerformed: treatmentSessions.length
                    ? `Total documented sessions: ${treatmentSessions.length}. Key interventions: ${lastSession.interventions?.join(', ') || 'Therapeutic exercise, manual therapy, gait retraining'}.`
                    : 'No prior individual treatment sessions documented in digital passport.',
                  currentProgressAndGoals: `Short term goals: ${latestAssessment.shortTermGoals || 'Pain reduction, ROM recovery'}. Long term: ${latestAssessment.longTermGoals || 'Restoration of functional activities'}. Recent pain score: ${latestMetric.painScore ?? 'Recorded in sessions'}/10.`,
                  precautionsAndContraindications: latestAssessment.precautions || 'Maintain standard activity pacing and monitor pain thresholds during progressive loading.',
                  missingOrUnclearInfo: !assessments.length
                    ? 'Initial formal baseline assessment missing.'
                    : !progressMeasurements.length
                    ? 'Latest objective ROM / dynamometer metrics pending re-evaluation.'
                    : 'Confirm tolerance to recent higher load exercise progression.',
                  fullSummaryText: `Rehabilitation Continuity Summary for ${patientName}:\nPatient transitioning care due to: ${reasonForTransfer}.\nInitial chief complaint: ${latestAssessment.chiefComplaint || 'Pain and functional limitation'}.\nInterventions received: ${treatmentSessions.length} documented sessions.\nCurrent status requires formal receiving reassessment and confirmation of documented precautions.`,
                };
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  data: summaryResult,
                  sourceRecordCount: {
                    assessments: assessments.length,
                    sessions: treatmentSessions.length,
                    metrics: progressMeasurements.length,
                  },
                })
              );
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: (err as Error).message }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiHandoverPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
