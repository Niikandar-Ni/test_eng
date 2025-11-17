import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp } from "lucide-react";

export default function ScoreHistory() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: profile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
  });

  const { data: scoreHistory, isLoading: historyLoading } = trpc.student.getScoreHistory.useQuery(undefined, {
    enabled: isAuthenticated && !loading && profile?.isApproved,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (profile && !profile.isApproved) {
      navigate("/waiting-approval");
    }
  }, [profile, navigate]);

  if (loading || historyLoading) {
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

  const highestScore = scoreHistory && scoreHistory.length > 0
    ? Math.max(...scoreHistory.map(s => s.score))
    : 0;

  const lowestScore = scoreHistory && scoreHistory.length > 0
    ? Math.min(...scoreHistory.map(s => s.score))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">ประวัติคะแนน</h1>
            <p className="text-sm text-gray-600">ดูความก้าวหน้าของคุณ</p>
          </div>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไป
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">จำนวนครั้งทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-600">{scoreHistory?.length || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-600">{averageScore}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">คะแนนสูงสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{highestScore}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">คะแนนต่ำสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{lowestScore}</p>
            </CardContent>
          </Card>
        </div>

        {/* Score List */}
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดคะแนน</CardTitle>
          </CardHeader>
          <CardContent>
            {scoreHistory && scoreHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ลำดับที่</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">วันที่</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">คะแนน</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ความเห็น</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreHistory.map((score, index) => (
                      <tr key={score.id} className="border-b border-gray-200 hover:bg-blue-50">
                        <td className="py-3 px-4 text-gray-800 font-semibold">{scoreHistory.length - index}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(score.attemptedAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-bold text-lg ${
                            score.score >= 80
                              ? "text-green-600"
                              : score.score >= 60
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}>
                            {score.score}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm max-w-md">
                          {score.feedback || "ไม่มีความเห็น"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">ยังไม่มีประวัติคะแนน</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
