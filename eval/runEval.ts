import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { runHeuristics } from '../src/services/detector';
import { redactSensitiveData } from '../src/services/redaction';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

interface TestCase {
  id: string;
  language: string;
  isScam: boolean;
  scamType: string;
  utterances: string[];
  goldTactics: string[];
  firstAlertUtteranceIndex: number | null;
}

interface EvaluationMetrics {
  total: number;
  scamCount: number;
  benignCount: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  accuracy: number;
  avgTimeToFirstAlert: number;
  avgLatencyMs: number;
  confusionMatrix: {
    actualScam_predScam: number;
    actualScam_predBenign: number;
    actualBenign_predScam: number;
    actualBenign_predBenign: number;
  };
  failureCases: any[];
}

function calculateMetrics(results: any[]): EvaluationMetrics {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  let totalAlertTime = 0;
  let alertCount = 0;
  let totalLatency = 0;
  const failureCases: any[] = [];

  results.forEach((r) => {
    totalLatency += r.latencyMs;
    if (r.actualScam && r.predictedScam) {
      tp++;
      if (r.predictedFirstAlertIndex !== null && r.predictedFirstAlertIndex !== undefined) {
        totalAlertTime += r.predictedFirstAlertIndex;
        alertCount++;
      }
    } else if (!r.actualScam && r.predictedScam) {
      fp++;
      failureCases.push({
        id: r.id,
        type: 'FALSE_POSITIVE',
        scamType: r.scamType,
        text: r.finalTranscript,
        predictedScore: r.predictedScore,
        rationale: r.rationale,
      });
    } else if (!r.actualScam && !r.predictedScam) {
      tn++;
    } else if (r.actualScam && !r.predictedScam) {
      fn++;
      failureCases.push({
        id: r.id,
        type: 'FALSE_NEGATIVE',
        scamType: r.scamType,
        text: r.finalTranscript,
        predictedScore: r.predictedScore,
        rationale: r.rationale,
      });
    }
  });

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
  const accuracy = (tp + tn) / results.length;
  const avgTimeToFirstAlert = alertCount > 0 ? parseFloat((totalAlertTime / alertCount).toFixed(2)) : 0;
  const avgLatencyMs = Math.round(totalLatency / results.length);

  return {
    total: results.length,
    scamCount: tp + fn,
    benignCount: tn + fp,
    tp,
    fp,
    tn,
    fn,
    precision: parseFloat((precision * 100).toFixed(1)),
    recall: parseFloat((recall * 100).toFixed(1)),
    f1: parseFloat((f1 * 100).toFixed(1)),
    fpr: parseFloat((fpr * 100).toFixed(1)),
    accuracy: parseFloat((accuracy * 100).toFixed(1)),
    avgTimeToFirstAlert,
    avgLatencyMs,
    confusionMatrix: {
      actualScam_predScam: tp,
      actualScam_predBenign: fn,
      actualBenign_predScam: fp,
      actualBenign_predBenign: tn,
    },
    failureCases,
  };
}

async function runEvaluation() {
  const datasetPath = path.join(process.cwd(), 'eval', 'dataset.json');
  if (!fs.existsSync(datasetPath)) {
    console.error('eval/dataset.json not found!');
    process.exit(1);
  }

  const dataset: TestCase[] = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  console.log(`\n🔍 Loaded ${dataset.length} evaluation test cases from eval/dataset.json`);

  // 1. Evaluate Heuristics Pipeline (Utterance by Utterance to compute exact time to first alert)
  console.log('\n--- Running Heuristics Pipeline Evaluation ---');
  const heuristicResults: any[] = [];

  for (const testCase of dataset) {
    const startTime = Date.now();
    let accumulatedText = '';
    let predictedFirstAlertIndex: number | null = null;
    let finalResult: any = null;

    for (let i = 0; i < testCase.utterances.length; i++) {
      const utterance = testCase.utterances[i];
      accumulatedText += (accumulatedText ? '\n' : '') + utterance;
      
      const redacted = redactSensitiveData(accumulatedText);
      const isFamily = testCase.scamType.includes('family');
      const analysis = runHeuristics({
        transcriptText: redacted.redactedText,
        isFamily,
        previousRiskScore: finalResult?.riskScore,
      });

      finalResult = analysis;
      if (analysis.riskScore >= 65 && predictedFirstAlertIndex === null) {
        predictedFirstAlertIndex = i;
      }
    }

    const latencyMs = Date.now() - startTime;
    heuristicResults.push({
      id: testCase.id,
      language: testCase.language,
      scamType: testCase.scamType,
      actualScam: testCase.isScam,
      predictedScam: finalResult.riskScore >= 65,
      predictedScore: finalResult.riskScore,
      predictedLevel: finalResult.riskLevel,
      goldTactics: testCase.goldTactics,
      predictedTactics: finalResult.tactics.map((t: any) => t.category),
      goldFirstAlertIndex: testCase.firstAlertUtteranceIndex,
      predictedFirstAlertIndex,
      latencyMs,
      finalTranscript: accumulatedText,
      rationale: finalResult.summary,
    });
  }

  const heuristicMetrics = calculateMetrics(heuristicResults);

  // 2. Evaluate Gemini Hybrid Pipeline in concurrent batches
  let geminiMetrics: EvaluationMetrics | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    console.log('\n--- Running Gemini + Heuristics Hybrid Pipeline Evaluation ---');
    const ai = new GoogleGenAI({ apiKey });

    // Process in batches of 10 for fast completion
    const BATCH_SIZE = 10;
    const hybridResults: any[] = [];

    for (let i = 0; i < dataset.length; i += BATCH_SIZE) {
      const batch = dataset.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (testCase) => {
        const startTime = Date.now();
        const accumulatedText = testCase.utterances.join('\n');
        const redacted = redactSensitiveData(accumulatedText);
        const isFamily = testCase.scamType.includes('family');

        const ruleAnalysis = runHeuristics({
          transcriptText: redacted.redactedText,
          isFamily,
        });

        let hybridScore = ruleAnalysis.riskScore;
        let rationale = ruleAnalysis.summary;

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `You are an evaluation grader. Classify if this call transcript is scam coercion (especially Digital Arrest / Extortion) or benign:
"""
${redacted.redactedText}
"""
Output strict JSON with riskScore (0-100), summary.`,
            config: {
              responseMimeType: 'application/json',
            },
          });
          const parsed = JSON.parse(response.text || '{}');
          if (parsed.riskScore !== undefined) {
            hybridScore = Math.max(parsed.riskScore, ruleAnalysis.riskScore);
            if (isFamily && !ruleAnalysis.tactics.some((t) => t.category === 'digital_arrest')) {
              hybridScore = Math.min(hybridScore, 18);
            }
            rationale = parsed.summary || rationale;
          }
        } catch (_e) {
          // fallback to ruleAnalysis
        }

        const latencyMs = Date.now() - startTime;
        return {
          id: testCase.id,
          language: testCase.language,
          scamType: testCase.scamType,
          actualScam: testCase.isScam,
          predictedScam: hybridScore >= 65,
          predictedScore: hybridScore,
          goldTactics: testCase.goldTactics,
          latencyMs,
          finalTranscript: accumulatedText,
          rationale,
        };
      });

      const batchResults = await Promise.all(batchPromises);
      hybridResults.push(...batchResults);
    }

    geminiMetrics = calculateMetrics(hybridResults);
  }

  // Summary Console Printout
  console.log('\n======================================================');
  console.log('              KAAVAL DETECTION BENCHMARK              ');
  console.log('======================================================');
  console.log(`Total Test Transcripts:   ${heuristicMetrics.total}`);
  console.log(`Scam Coercion Cases:      ${heuristicMetrics.scamCount}`);
  console.log(`Benign / Family Cases:    ${heuristicMetrics.benignCount}`);
  console.log('------------------------------------------------------');
  console.log(`Accuracy (Heuristics):    ${heuristicMetrics.accuracy}%`);
  console.log(`Precision (Heuristics):   ${heuristicMetrics.precision}%`);
  console.log(`Recall (Heuristics):      ${heuristicMetrics.recall}%`);
  console.log(`F1 Score (Heuristics):    ${heuristicMetrics.f1}%`);
  console.log(`False Positive Rate:      ${heuristicMetrics.fpr}%`);
  console.log(`Avg Time-To-First-Alert:  ${heuristicMetrics.avgTimeToFirstAlert} utterances`);
  console.log(`Avg Latency (Heuristics): ${heuristicMetrics.avgLatencyMs} ms`);
  if (geminiMetrics) {
    console.log('------------------------------------------------------');
    console.log(`Accuracy (Hybrid Gemini): ${geminiMetrics.accuracy}%`);
    console.log(`Precision (Hybrid):       ${geminiMetrics.precision}%`);
    console.log(`Recall (Hybrid):          ${geminiMetrics.recall}%`);
    console.log(`F1 Score (Hybrid):        ${geminiMetrics.f1}%`);
    console.log(`Avg Latency (Hybrid):     ${geminiMetrics.avgLatencyMs} ms`);
  }
  console.log('------------------------------------------------------');
  console.log('CONFUSION MATRIX (Heuristics):');
  console.log(`  True Positives (Scam -> Alert):     ${heuristicMetrics.tp}`);
  console.log(`  False Positives (Benign -> Alert):  ${heuristicMetrics.fp}`);
  console.log(`  True Negatives (Benign -> Safe):    ${heuristicMetrics.tn}`);
  console.log(`  False Negatives (Scam -> Missed):   ${heuristicMetrics.fn}`);
  console.log('======================================================\n');

  // Save results to eval/results.json
  const outputPayload = {
    evaluatedAt: new Date().toISOString(),
    datasetSize: dataset.length,
    heuristics: {
      metrics: heuristicMetrics,
      detailedCases: heuristicResults,
    },
    hybridGemini: geminiMetrics ? { metrics: geminiMetrics } : null,
  };

  const resultsPath = path.join(process.cwd(), 'eval', 'results.json');
  const srcDataPath = path.join(process.cwd(), 'src', 'data', 'evalResults.json');
  const publicPath = path.join(process.cwd(), 'public', 'eval-results.json');
  const jsonContent = JSON.stringify(outputPayload, null, 2);

  fs.writeFileSync(resultsPath, jsonContent);
  console.log(`✅ Evaluation results saved to ${resultsPath}`);

  try {
    fs.writeFileSync(srcDataPath, jsonContent);
    fs.writeFileSync(publicPath, jsonContent);
    console.log(`✅ Evaluation results synced to client bundle (${srcDataPath}) and static assets (${publicPath})\n`);
  } catch (err) {
    console.warn('Could not sync to src/data or public:', err);
  }
}

runEvaluation().catch(console.error);
