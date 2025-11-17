import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Volume2, Mic, Square, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ScoreResult {
  score: number;
  feedback: string;
  transcription: string;
  pronunciation: string;
  fluency: string;
  accuracy: string;
}

export default function Lesson() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [sessionSentences, setSessionSentences] = useState<any[]>([]);
  const [isLoadingSentences, setIsLoadingSentences] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const { data: profile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
  });

  const { data: highScoredIds } = trpc.score.getHighScoredSentenceIds.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
  });

  const { data: availableSentences } = trpc.sentence.getByGradeLevel.useQuery(
    { gradeLevel: profile?.gradeLevel || "m1" },
    { enabled: isAuthenticated && !loading && !!profile?.gradeLevel }
  );

  const createSessionMutation = trpc.playSession.create.useMutation({
    onSuccess: () => {
      toast.success("เซสชันเรียนเริ่มสำเร็จ");
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
      navigate("/dashboard");
    },
  });

  const analyzeMutation = trpc.analysis.analyzeSpeechAndRecord.useMutation({
    onSuccess: (data) => {
      setScoreResult(data);
      setShowScoreDialog(true);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการวิเคราะห์เสียง");
      setIsAnalyzing(false);
    },
  });

  // Initialize session with 3 random sentences
  useEffect(() => {
    if (!availableSentences || !highScoredIds || sessionInitialized) return;

    // Filter out sentences with high scores
    const filteredSentences = availableSentences.filter(
      (s) => !highScoredIds.includes(s.id)
    );

    if (filteredSentences.length === 0) {
      toast.error("ไม่มีประโยคใหม่ให้เรียน");
      navigate("/dashboard");
      return;
    }

    // Randomly select 3 sentences (or less if not enough)
    const numToSelect = Math.min(3, filteredSentences.length);
    const selected: any[] = [];
    const indices = new Set<number>();

    while (selected.length < numToSelect) {
      const randomIndex = Math.floor(Math.random() * filteredSentences.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        selected.push(filteredSentences[randomIndex]);
      }
    }

    setSessionSentences(selected);
    setIsLoadingSentences(false);
    setSessionInitialized(true);

    // Create session
    createSessionMutation.mutate({
      sentenceIds: selected.map((s) => s.id),
    });
  }, [availableSentences, highScoredIds, sessionInitialized, navigate, createSessionMutation]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("ไม่สามารถเข้าถึงไมโครโฟน");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    // TODO: Implement text-to-speech for the sentence
    toast.info("ฟังก์ชันเล่นเสียงจะเพิ่มเติมในเวอร์ชันต่อไป");
  };

  // Create object URL for audio playback
  const audioUrl = useMemo(() => {
    if (!recordedAudio) return undefined;
    return URL.createObjectURL(recordedAudio);
  }, [recordedAudio]);

  // Cleanup object URL on unmount or when audio changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleNext = () => {
    if (currentSentenceIndex < sessionSentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setRecordedAudio(null);
    }
  };

  const handlePrevious = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1);
      setRecordedAudio(null);
    }
  };

  const handleSubmit = async () => {
    if (!recordedAudio) {
      toast.error("กรุณาบันทึกเสียงก่อน");
      return;
    }

    setIsAnalyzing(true);

    // Upload audio to storage and get URL
    try {
      // For now, we'll use a temporary URL
      // In production, you should upload to S3 first
      const audioUrl = URL.createObjectURL(recordedAudio);

      // Analyze speech
      await analyzeMutation.mutateAsync({
        audioUrl,
        sentenceId: sessionSentences[currentSentenceIndex].id,
        targetSentence: sessionSentences[currentSentenceIndex].englishText,
      });
    } catch (error) {
      console.error("Error submitting:", error);
      setIsAnalyzing(false);
    }
  };

  const handleContinue = () => {
    setShowScoreDialog(false);
    if (currentSentenceIndex === sessionSentences.length - 1) {
      // Completed all sentences
      navigate("/dashboard");
    } else {
      handleNext();
    }
  };

  if (loading || isLoadingSentences) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังเตรียมบทเรียน...</p>
        </div>
      </div>
    );
  }

  if (sessionSentences.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">ไม่มีประโยคใหม่ให้เรียน</p>
            <Button onClick={() => navigate("/dashboard")} className="bg-indigo-600 hover:bg-indigo-700">
              กลับไปที่แดชบอร์ด
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSentence = sessionSentences[currentSentenceIndex];
  const progress = ((currentSentenceIndex + 1) / sessionSentences.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-indigo-600">บทเรียน</h1>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="border-gray-300"
            >
              ออก
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>ประโยคที่ {currentSentenceIndex + 1} จาก {sessionSentences.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-center text-indigo-600">
              อ่านประโยคภาษาอังกฤษ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* English Sentence */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <p className="text-2xl font-semibold text-center text-gray-800 mb-4">
                {currentSentence.englishText}
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={playAudio}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Volume2 className="w-5 h-5" />
                  ฟังเสียง
                </Button>
              </div>
            </div>

            {/* Thai Meaning */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <p className="text-center text-gray-700">
                <span className="font-semibold text-green-600">ความหมาย:</span>
              </p>
              <p className="text-lg text-center text-gray-800 mt-2">
                {currentSentence.thaiMeaning}
              </p>
            </div>

            {/* Recording Section */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <p className="text-center font-semibold text-gray-700 mb-4">
                บันทึกการอ่านของคุณ
              </p>

              {recordedAudio && (
                <div className="mb-4 p-4 bg-white rounded border border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">✓ บันทึกเสียงแล้ว</p>
                  <audio
                    controls
                    className="w-full"
                    src={audioUrl}
                  />
                </div>
              )}

              <div className="flex gap-3 justify-center">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    เริ่มบันทึก
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <Square className="w-5 h-5" />
                    หยุดบันทึก
                  </Button>
                )}
              </div>
            </div>

            {/* Navigation and Submit */}
            <div className="flex gap-3 justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentSentenceIndex === 0}
                variant="outline"
                className="flex items-center gap-2 border-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                ก่อนหน้า
              </Button>

              {currentSentenceIndex === sessionSentences.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!recordedAudio || isAnalyzing}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 flex items-center gap-2"
                >
                  {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAnalyzing ? "กำลังวิเคราะห์..." : "เสร็จสิ้น"}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!recordedAudio || isAnalyzing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAnalyzing ? "กำลังวิเคราะห์..." : "ถัดไป"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Result Dialog */}
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ผลการประเมิน</DialogTitle>
          </DialogHeader>
          {scoreResult && (
            <div className="space-y-4">
              {/* Score Display */}
              <div className="text-center py-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">คะแนนของคุณ</p>
                <p className={`text-5xl font-bold ${
                  scoreResult.score >= 80
                    ? "text-green-600"
                    : scoreResult.score >= 60
                    ? "text-blue-600"
                    : "text-red-600"
                }`}>
                  {scoreResult.score}
                </p>
                <p className="text-xs text-gray-500 mt-2">จากคะแนนเต็ม 100</p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-semibold text-gray-600 mb-1">การออกเสียง</p>
                  <p className="text-sm text-gray-800">{scoreResult.pronunciation}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-semibold text-gray-600 mb-1">ความไหลลื่น</p>
                  <p className="text-sm text-gray-800">{scoreResult.fluency}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-semibold text-gray-600 mb-1">ความถูกต้อง</p>
                  <p className="text-sm text-gray-800">{scoreResult.accuracy}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-xs font-semibold text-blue-600 mb-1">ความเห็น</p>
                  <p className="text-sm text-gray-800">{scoreResult.feedback}</p>
                </div>
              </div>

              {/* Button */}
              <Button
                onClick={handleContinue}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {currentSentenceIndex === sessionSentences.length - 1 ? "เสร็จสิ้น" : "ประโยคถัดไป"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
