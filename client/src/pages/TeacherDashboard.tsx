import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LogOut, CheckCircle, XCircle, Users } from "lucide-react";
import { toast } from "sonner";

export default function TeacherDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"pending" | "reports">("pending");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const { data: pendingStudents, isLoading: pendingLoading, refetch: refetchPending } = 
    trpc.teacher.getPendingStudents.useQuery(undefined, {
      enabled: isAuthenticated && !loading,
    });

  const { data: allReports, isLoading: reportsLoading } = 
    trpc.teacher.getAllStudentsReport.useQuery(undefined, {
      enabled: isAuthenticated && !loading && activeTab === "reports",
    });

  const approveMutation = trpc.teacher.approveStudent.useMutation({
    onSuccess: () => {
      toast.success("อนุมัตินักเรียนสำเร็จ");
      setShowApproveDialog(false);
      refetchPending();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const rejectMutation = trpc.teacher.rejectStudent.useMutation({
    onSuccess: () => {
      toast.success("ปฏิเสธนักเรียนสำเร็จ");
      refetchPending();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleApprove = async () => {
    if (!selectedStudent) return;
    await approveMutation.mutateAsync({
      studentId: selectedStudent.id,
    });
  };

  const handleReject = async (studentId: number) => {
    await rejectMutation.mutateAsync({
      studentId,
    });
  };

  if (loading || pendingLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">ระบบจัดการครู</h1>
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
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveTab("pending")}
            variant={activeTab === "pending" ? "default" : "outline"}
            className={activeTab === "pending" ? "bg-indigo-600 text-white" : "border-gray-300"}
          >
            <Users className="w-4 h-4 mr-2" />
            นักเรียนรอการอนุมัติ ({pendingStudents?.length || 0})
          </Button>
          <Button
            onClick={() => setActiveTab("reports")}
            variant={activeTab === "reports" ? "default" : "outline"}
            className={activeTab === "reports" ? "bg-indigo-600 text-white" : "border-gray-300"}
          >
            รายงานนักเรียน
          </Button>
        </div>

        {/* Pending Students Tab */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingStudents && pendingStudents.length > 0 ? (
              pendingStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{student.userName}</h3>
                        <p className="text-sm text-gray-600">{student.userEmail}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          ระดับชั้น: {getGradeLevelName(student.gradeLevel)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowApproveDialog(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          อนุมัติ
                        </Button>
                        <Button
                          onClick={() => handleReject(student.id)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          ปฏิเสธ
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">ไม่มีนักเรียนรอการอนุมัติ</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div>
            {reportsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">กำลังโหลด...</p>
              </div>
            ) : allReports && allReports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ชื่อ</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">อีเมล</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ระดับชั้น</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">จำนวนครั้ง</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">คะแนนเฉลี่ย</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ครั้งล่าสุด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allReports.map((report) => (
                      <tr key={report.userId} className="border-b border-gray-200 hover:bg-blue-50">
                        <td className="py-3 px-4 text-gray-800">{report.userName}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{report.userEmail}</td>
                        <td className="py-3 px-4 text-gray-600">{getGradeLevelName(report.gradeLevel)}</td>
                        <td className="py-3 px-4 text-center font-semibold text-indigo-600">
                          {report.totalAttempts}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-indigo-600">
                          {report.averageScore}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {report.lastAttempt
                            ? new Date(report.lastAttempt).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "ยังไม่เล่น"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">ไม่มีนักเรียนที่ได้รับการอนุมัติ</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการอนุมัติ</DialogTitle>
            <DialogDescription>
              คุณต้องการอนุมัติให้ {selectedStudent?.userName} เข้าใช้งานแอปพลิเคชันหรือไม่?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              className="border-gray-300"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approveMutation.isPending ? "กำลังอนุมัติ..." : "ยืนยันการอนุมัติ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
