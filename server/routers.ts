import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getStudentProfile,
  createStudentProfile,
  getPendingStudents,
  approveStudent,
  rejectStudent,
  getSentencesByGradeLevel,
  addSentence,
  recordScore,
  getStudentScores,
  getHighScoredSentences,
  getTodaySessionCount,
  createPlaySession,
  completePlaySession,
  setUserAsTeacher,
  setUserAsStudent,
} from "./db";
import { users } from "../drizzle/schema";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { analysisRouter } from "./routers/analysis";

// Helper function to check if user is a teacher or admin
async function isTeacher(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user.length > 0 && (user[0].role === "teacher" || user[0].role === "admin");
}

// Teacher-only procedure (includes admin users)
const teacherProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!await isTeacher(ctx.user.id)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only teachers can access this" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Student Management
  student: router({
    // Get or create student profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      // If user is admin or teacher, return null (they don't have student profile)
      if (ctx.user.role === "admin" || ctx.user.role === "teacher") {
        return null;
      }
      const profile = await getStudentProfile(ctx.user.id);
      return profile || null; // Return null instead of undefined
    }),

    // Create student profile (during registration)
    createProfile: protectedProcedure
      .input(z.object({
        gradeLevel: z.enum(["m1", "m2", "m3", "m4", "m5", "m6"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const existingProfile = await getStudentProfile(ctx.user.id);
        if (existingProfile) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Student profile already exists" });
        }
        const profile = await createStudentProfile(ctx.user.id, input.gradeLevel);
        return profile;
      }),

    // Get student's score history
    getScoreHistory: protectedProcedure.query(async ({ ctx }) => {
      // Only students can get their score history
      if (ctx.user.role !== "user") {
        return [];
      }
      const scores = await getStudentScores(ctx.user.id);
      return scores;
    }),

    // Check if can play today
    canPlayToday: protectedProcedure.query(async ({ ctx }) => {
      // Only students can play
      if (ctx.user.role !== "user") {
        return {
          canPlay: false,
          sessionsUsed: 0,
          sessionsRemaining: 0,
        };
      }
      const today = new Date().toISOString().split('T')[0];
      const sessionCount = await getTodaySessionCount(ctx.user.id, today);
      return {
        canPlay: sessionCount < 2,
        sessionsUsed: sessionCount,
        sessionsRemaining: Math.max(0, 2 - sessionCount),
      };
    }),
  }),

  // Teacher Management
  teacher: router({
    // Get pending students for approval
    getPendingStudents: teacherProcedure.query(async ({ ctx }) => {
      const pendingStudents = await getPendingStudents();
      // Get user details for each pending student
      const db = await getDb();
      if (!db) return [];

      const studentsWithDetails = await Promise.all(
        pendingStudents.map(async (profile) => {
          const user = await db.select().from(users).where(eq(users.id, profile.userId)).limit(1);
          return {
            ...profile,
            userName: user[0]?.name || "Unknown",
            userEmail: user[0]?.email || "Unknown",
          };
        })
      );
      return studentsWithDetails;
    }),

    // Approve a student
    approveStudent: teacherProcedure
      .input(z.object({
        studentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await approveStudent(input.studentId, ctx.user.id);
        return { success: true };
      }),

    // Reject a student
    rejectStudent: teacherProcedure
      .input(z.object({
        studentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await rejectStudent(input.studentId);
        return { success: true };
      }),

    // Get all students' reports
    getAllStudentsReport: teacherProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      // Get all approved students
      const allStudents = await db.select().from(users).where(eq(users.role, "user"));
      
      const reportsData = await Promise.all(
        allStudents.map(async (user) => {
          const profile = await getStudentProfile(user.id);
          const scores = await getStudentScores(user.id);
          const averageScore = scores.length > 0 
            ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
            : 0;
          
          return {
            userId: user.id,
            userName: user.name || "Unknown",
            userEmail: user.email || "Unknown",
            gradeLevel: profile?.gradeLevel || "Unknown",
            isApproved: profile?.isApproved || false,
            totalAttempts: scores.length,
            averageScore,
            lastAttempt: scores.length > 0 ? scores[scores.length - 1].attemptedAt : null,
          };
        })
      );

      return reportsData.filter(r => r.isApproved);
    }),

    // Set user as teacher
    setAsTeacher: teacherProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await setUserAsTeacher(input.userId);
        return { success: true };
      }),

    // Set user as student
    setAsStudent: teacherProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await setUserAsStudent(input.userId);
        return { success: true };
      }),
  }),

  // Sentence Management
  sentence: router({
    // Get sentences for a specific grade level
    getByGradeLevel: protectedProcedure
      .input(z.object({
        gradeLevel: z.enum(["m1", "m2", "m3", "m4", "m5", "m6"]),
      }))
      .query(async ({ input }) => {
        const sentences = await getSentencesByGradeLevel(input.gradeLevel);
        return sentences;
      }),

    // Add a new sentence (teacher only)
    add: teacherProcedure
      .input(z.object({
        gradeLevel: z.enum(["m1", "m2", "m3", "m4", "m5", "m6"]),
        englishText: z.string().min(1),
        thaiMeaning: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const sentence = await addSentence(input.gradeLevel, input.englishText, input.thaiMeaning);
        return sentence;
      }),
  }),

  // Score Management
  score: router({
    // Record a score for a sentence
    record: protectedProcedure
      .input(z.object({
        sentenceId: z.number(),
        score: z.number().min(0).max(100),
        feedback: z.string(),
        audioUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const score = await recordScore(
          ctx.user.id,
          input.sentenceId,
          input.score,
          input.feedback,
          input.audioUrl
        );
        return score;
      }),

    // Get high-scored sentences (to exclude from random selection)
    getHighScoredSentenceIds: protectedProcedure.query(async ({ ctx }) => {
      const sentenceIds = await getHighScoredSentences(ctx.user.id);
      return sentenceIds;
    }),
  }),

  // Play Session Management
  playSession: router({
    // Create a new play session
    create: protectedProcedure
      .input(z.object({
        sentenceIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check daily limit
        const today = new Date().toISOString().split('T')[0];
        const sessionCount = await getTodaySessionCount(ctx.user.id, today);
        
        if (sessionCount >= 2) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "You have reached the daily limit of 2 sessions" 
          });
        }

        const session = await createPlaySession(ctx.user.id, today, input.sentenceIds);
        return session;
      }),

    // Complete a play session
    complete: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await completePlaySession(input.sessionId);
        return { success: true };
      }),
  }),

  // Analysis (Speech analysis and scoring)
  analysis: analysisRouter,
});

export type AppRouter = typeof appRouter;
