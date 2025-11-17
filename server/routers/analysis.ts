import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { analyzeSpeech } from "../_core/speechAnalysis";
import { recordScore } from "../db";

export const analysisRouter = router({
  // Analyze speech and record score
  analyzeSpeechAndRecord: protectedProcedure
    .input(
      z.object({
        audioUrl: z.string(),
        sentenceId: z.number(),
        targetSentence: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Analyze the speech
        const analysis = await analyzeSpeech(input.audioUrl, input.targetSentence);

        // Record the score
        const score = await recordScore(
          ctx.user.id,
          input.sentenceId,
          analysis.score,
          analysis.feedback,
          input.audioUrl
        );

        return {
          success: true,
          score: analysis.score,
          feedback: analysis.feedback,
          transcription: analysis.transcription,
          pronunciation: analysis.pronunciation,
          fluency: analysis.fluency,
          accuracy: analysis.accuracy,
          recordedScoreId: score.id,
        };
      } catch (error) {
        console.error("Error analyzing speech:", error);
        throw error;
      }
    }),
});
