import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Clock, CheckCircle } from "lucide-react";

export default function WaitingApproval() {
  const { isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: profile, isLoading: profileLoading } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (profile && profile.isApproved) {
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clock className="w-16 h-16 text-amber-500 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">รอการอนุมัติ</CardTitle>
          <CardDescription>โปรไฟล์ของคุณกำลังรอการอนุมัติจากครู</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">ชื่อ: {profile?.userId}</p>
                <p className="text-sm text-gray-600">ระดับชั้น: {getGradeLevelName(profile?.gradeLevel)}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-amber-600">กรุณารอสักครู่</span> ครูจะตรวจสอบและอนุมัติโปรไฟล์ของคุนในเร็วๆ นี้ หน้านี้จะอัปเดตโดยอัตโนมัติเมื่อได้รับการอนุมัติ
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              หากคุณต้องการออกจากระบบ คลิกปุ่มด้านล่าง
            </p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ออกจากระบบ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getGradeLevelName(level?: string): string {
  const levels: Record<string, string> = {
    m1: "ชั้นมัธยมศึกษาปีที่ 1",
    m2: "ชั้นมัธยมศึกษาปีที่ 2",
    m3: "ชั้นมัธยมศึกษาปีที่ 3",
    m4: "ชั้นมัธยมศึกษาปีที่ 4",
    m5: "ชั้นมัธยมศึกษาปีที่ 5",
    m6: "ชั้นมัธยมศึกษาปีที่ 6",
  };
  return levels[level || ""] || "ไม่ระบุ";
}
