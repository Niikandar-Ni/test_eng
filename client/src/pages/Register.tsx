import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Register() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: profile, isLoading: profileLoading } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
  });

  const createProfileMutation = trpc.student.createProfile.useMutation({
    onSuccess: () => {
      toast.success("สร้างโปรไฟล์สำเร็จ! กรุณารอการอนุมัติจากครู");
      navigate("/waiting-approval");
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

  useEffect(() => {
    if (profile) {
      navigate("/waiting-approval");
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeLevel) {
      toast.error("กรุณาเลือกระดับชั้น");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfileMutation.mutateAsync({
        gradeLevel: gradeLevel as any,
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <CardTitle className="text-2xl font-bold text-indigo-600">สร้างโปรไฟล์นักเรียน</CardTitle>
          <CardDescription>กรอกข้อมูลเพื่อเริ่มต้นการเรียน</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                ชื่อจริง
              </Label>
              <Input
                id="name"
                type="text"
                value={user?.name || ""}
                disabled
                className="bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500">ชื่อจากบัญชี Google ของคุณ</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                อีเมล
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-100 text-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="text-gray-700 font-medium">
                ระดับชั้น <span className="text-red-500">*</span>
              </Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger id="grade" className="w-full">
                  <SelectValue placeholder="เลือกระดับชั้น" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m1">ชั้นมัธยมศึกษาปีที่ 1</SelectItem>
                  <SelectItem value="m2">ชั้นมัธยมศึกษาปีที่ 2</SelectItem>
                  <SelectItem value="m3">ชั้นมัธยมศึกษาปีที่ 3</SelectItem>
                  <SelectItem value="m4">ชั้นมัธยมศึกษาปีที่ 4</SelectItem>
                  <SelectItem value="m5">ชั้นมัธยมศึกษาปีที่ 5</SelectItem>
                  <SelectItem value="m6">ชั้นมัธยมศึกษาปีที่ 6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-amber-600">หมายเหตุ:</span> หลังจากสร้างโปรไฟล์ คุณจะต้องรอการอนุมัติจากครูก่อนที่จะสามารถเริ่มต้นการเรียนได้
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !gradeLevel}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "กำลังสร้าง..." : "สร้างโปรไฟล์"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
