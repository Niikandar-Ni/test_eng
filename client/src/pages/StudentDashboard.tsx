import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, BarChart3, LogOut, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: profile, isLoading: profileLoading } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
  });

  const { data: canPlayData, isLoading: canPlayLoading } = trpc.student.canPlayToday.useQuery(undefined, {
    enabled: isAuthenticated && !loading && profile?.isApproved,
  });

  const { data: scoreHistory } = trpc.student.getScoreHistory.useQuery(undefined, {
    enabled: isAuthenticated && !loading && profile?.isApproved,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Redirect admin users to their dashboard
  useEffect(() => {
    if (!loading && user && user.role === "admin") {
      navigate("/teacher");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!profileLoading && profile === undefined) {
      // User doesn't have a student profile yet - redirect to register
      navigate("/register");
    } else if (profile === null) {
      // User is not a student (admin/teacher) - redirect to teacher dashboard
      navigate("/teacher");
    } else if (profile && !profile.isApproved) {
      // User has profile but not approved - redirect to waiting approval
      navigate("/waiting-approval");
    }
  }, [profile, profileLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleStartLesson = () => {
    if (!canPlayData?.canPlay) {
      toast.error("คุณได้ใช้ครบจำนวนครั้งในวันนี้แล้ว");
      return;
    }
    navigate("/lesson");
  };

  if (loading || profileLoading || canPlayLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const averageScore = scoreHistory && scoreHistory.length > 0
    ? Math.round(scoreHistory.reduce((sum, s) => sum + s.score, 0) / scoreHistory.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">English Learning App</h1>
            <p className="text-sm text-gray-600">ยินดีต้อนรับ, {user?.name}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Daily Limit Status */}
        {canPlayData && !canPlayData.canPlay && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900">ถึงจำนวนครั้งสูงสุดในวันนี้</p>
                  <p className="text-sm text-amber-800 mt-1">
                    คุณสามารถเล่นได้ 2 ครั้งต่อวัน กรุณากลับมาในวันพรุ่งนี้เพื่อเล่นต่อ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">ระดับชั้น</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-indigo-600">{getGradeLevelName(profile?.gradeLevel)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">จำนวนครั้งที่เล่น</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-indigo-600">{scoreHistory?.length || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-indigo-600">{averageScore}</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Limit Info */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">สถานะการเล่นในวันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">ครั้งที่เล่นแล้ว</span>
                <span className="font-semibold text-indigo-600">{canPlayData?.sessionsUsed || 0} / 2</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${((canPlayData?.sessionsUsed || 0) / 2) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {canPlayData?.canPlay
                  ? `คุณสามารถเล่นได้อีก ${canPlayData.sessionsRemaining} ครั้งในวันนี้`
                  : "คุณได้ใช้ครบจำนวนครั้งในวันนี้แล้ว"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStartLesson}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <BookOpen className="w-5 h-5" />
                เริ่มบทเรียน
              </CardTitle>
              <CardDescription>อ่านประโยคภาษาอังกฤษและบันทึกเสียง</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleStartLesson}
                disabled={!canPlayData?.canPlay}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canPlayData?.canPlay ? "เริ่มเลย" : "ถึงจำนวนครั้งแล้ว"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/history")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <BarChart3 className="w-5 h-5" />
                ประวัติคะแนน
              </CardTitle>
              <CardDescription>ดูประวัติคะแนนและความก้าวหน้า</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/history")}
                variant="outline"
                className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                ดูประวัติ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getGradeLevelName(level?: string): string {
  const levels: Record<string, string> = {
    m1: "ม.1",
    m2: "ม.2",
    m3: "ม.3",
    m4: "ม.4",
    m5: "ม.5",
    m6: "ม.6",
  };
  return levels[level || ""] || "ไม่ระบุ";
}
