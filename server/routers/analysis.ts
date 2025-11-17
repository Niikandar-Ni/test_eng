import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { analyzeSpeech } from "../_core/speechAnalysis";
import { recordScore } from "../db";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export const analysisRouter = router({
  // Upload audio file
  uploadAudio: protectedProcedure
    .input(
      z.object({
        audioData: z.string(), // base64 encoded audio
        contentType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 to buffer
        const audioBuffer = Buffer.from(input.audioData, "base64");

        // Generate unique filename
        const fileExtension = input.contentType.split("/")[1] || "webm";
        const fileName = `audio/${ctx.user.id}/${nanoid()}.${fileExtension}`;

        // Upload to storage
        const { url } = await storagePut(fileName, audioBuffer, input.contentType);

        return {
          success: true,
          audioUrl: url,
        };
      } catch (error) {
        console.error("Error uploading audio:", error);
        throw error;
      }
    }),

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
