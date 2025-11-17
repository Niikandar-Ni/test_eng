import { invokeLLM } from "./llm";
import { transcribeAudio } from "./voiceTranscription";

export interface SpeechAnalysisResult {
  score: number; // 0-100
  feedback: string; // Thai feedback
  transcription: string;
  pronunciation: string;
  fluency: string;
  accuracy: string;
}

/**
 * Analyze speech pronunciation and provide feedback
 * @param audioUrl URL to the audio file
 * @param targetSentence The English sentence that should be read
 * @returns Analysis result with score and Thai feedback
 */
export async function analyzeSpeech(
  audioUrl: string,
  targetSentence: string
): Promise<SpeechAnalysisResult> {
  try {
    // Step 1: Transcribe the audio
    const transcriptionResult = await transcribeAudio({
      audioUrl,
      language: "en",
      prompt: `The speaker is reading this sentence: "${targetSentence}"`,
    });

    // Handle both success and error responses
    let transcription = "";
    if ("text" in transcriptionResult) {
      transcription = transcriptionResult.text || "";
    } else {
      throw new Error("Failed to transcribe audio");
    }

    // Step 2: Use LLM to analyze the speech
    const analysisPrompt = `You are an English language teacher analyzing a student's pronunciation and reading.

Target sentence: "${targetSentence}"
Student's transcription: "${transcription}"

Please analyze the student's reading in the following aspects:
1. Pronunciation accuracy (how well they pronounced the words)
2. Fluency (how smoothly they read)
3. Overall accuracy (how close their reading matches the target)

Based on your analysis, provide:
1. A score from 0-100
2. Specific feedback in Thai language about their pronunciation and reading
3. Suggestions for improvement

Format your response as JSON with these fields:
{
  "score": <number 0-100>,
  "pronunciation": "<assessment of pronunciation>",
  "fluency": "<assessment of fluency>",
  "accuracy": "<assessment of accuracy>",
  "feedbackThai": "<detailed feedback in Thai>"
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert English language teacher specializing in pronunciation assessment. You provide constructive feedback in Thai language.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
    });

    // Parse the response
    let analysisData: any = {
      score: 70,
      pronunciation: "Good",
      fluency: "Good",
      accuracy: "Good",
      feedbackThai: "การอ่านของคุณดีมาก ให้ความสนใจกับการออกเสียงมากขึ้น",
    };

    try {
      const responseText =
        typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : "";

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn("Failed to parse LLM response, using default values", parseError);
    }

    return {
      score: Math.min(100, Math.max(0, analysisData.score || 70)),
      feedback: analysisData.feedbackThai || "การอ่านของคุณดีมาก",
      transcription,
      pronunciation: analysisData.pronunciation || "Good",
      fluency: analysisData.fluency || "Good",
      accuracy: analysisData.accuracy || "Good",
    };
  } catch (error) {
    console.error("Error analyzing speech:", error);
    throw error;
  }
}

/**
 * Generate a score based on multiple factors
 */
export function calculateScore(
  pronunciationScore: number,
  fluencyScore: number,
  accuracyScore: number
): number {
  // Weight: Pronunciation 40%, Fluency 30%, Accuracy 30%
  const weighted = pronunciationScore * 0.4 + fluencyScore * 0.3 + accuracyScore * 0.3;
  return Math.round(weighted);
}
