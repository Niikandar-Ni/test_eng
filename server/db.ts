import { eq, and, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, studentProfiles, sentences, studentScores, playSessions, StudentProfile, Sentence, StudentScore, PlaySession } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Student Profile Functions
export async function getStudentProfile(userId: number): Promise<StudentProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStudentProfile(userId: number, gradeLevel: string): Promise<StudentProfile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(studentProfiles).values({
    userId,
    gradeLevel: gradeLevel as any,
    isApproved: false,
  });

  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function getPendingStudents() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.isApproved, false));
  
  return result;
}

export async function approveStudent(studentId: number, teacherId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(studentProfiles)
    .set({
      isApproved: true,
      approvedBy: teacherId,
      approvedAt: new Date(),
    })
    .where(eq(studentProfiles.id, studentId));
}

export async function rejectStudent(studentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(studentProfiles).where(eq(studentProfiles.id, studentId));
}

// Sentence Functions
export async function getSentencesByGradeLevel(gradeLevel: string): Promise<Sentence[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(sentences)
    .where(eq(sentences.gradeLevel, gradeLevel as any));
  
  return result;
}

export async function addSentence(gradeLevel: string, englishText: string, thaiMeaning: string): Promise<Sentence> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sentences).values({
    gradeLevel: gradeLevel as any,
    englishText,
    thaiMeaning,
  });

  const result = await db
    .select()
    .from(sentences)
    .where(eq(sentences.englishText, englishText))
    .limit(1);
  
  return result[0];
}

// Student Score Functions
export async function recordScore(studentId: number, sentenceId: number, score: number, feedback: string, audioUrl?: string): Promise<StudentScore> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(studentScores).values({
    studentId,
    sentenceId,
    score,
    feedback,
    audioUrl,
  });

  const result = await db
    .select()
    .from(studentScores)
    .where(eq(studentScores.studentId, studentId))
    .limit(1);
  
  return result[0];
}

export async function getStudentScores(studentId: number): Promise<StudentScore[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(studentScores)
    .where(eq(studentScores.studentId, studentId));
  
  return result;
}

export async function getHighScoredSentences(studentId: number, scoreThreshold: number = 80): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ sentenceId: studentScores.sentenceId })
    .from(studentScores)
    .where(and(
      eq(studentScores.studentId, studentId),
      gt(studentScores.score, scoreThreshold)
    ));
  
  return result.map(r => r.sentenceId);
}

// Play Session Functions
export async function getTodaySessionCount(studentId: number, sessionDate: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(playSessions)
    .where(and(
      eq(playSessions.studentId, studentId),
      eq(playSessions.sessionDate, sessionDate)
    ));
  
  return result.length;
}

export async function createPlaySession(studentId: number, sessionDate: string, sentenceIds: number[]): Promise<PlaySession> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sessionCount = await getTodaySessionCount(studentId, sessionDate);
  const sessionNumber = sessionCount + 1;

  await db.insert(playSessions).values({
    studentId,
    sessionDate,
    sessionNumber,
    sentenceIds: JSON.stringify(sentenceIds),
  });

  const result = await db
    .select()
    .from(playSessions)
    .where(and(
      eq(playSessions.studentId, studentId),
      eq(playSessions.sessionDate, sessionDate),
      eq(playSessions.sessionNumber, sessionNumber)
    ))
    .limit(1);
  
  return result[0];
}

export async function completePlaySession(sessionId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(playSessions)
    .set({ completedAt: new Date() })
    .where(eq(playSessions.id, sessionId));
}
