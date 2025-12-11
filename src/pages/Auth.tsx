import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TreePine, Loader2, MapPin, Sprout, CheckCircle2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userRole, signUp, signIn, refreshUserRole } = useAuth();
  
  // Default State
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forms
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Role Selection
  const paramRole = searchParams.get("role");
  const [selectedRole, setSelectedRole] = useState<"landowner" | "gardener">(
    (paramRole === "landowner" || paramRole === "gardener") ? paramRole : "gardener"
  );

  // Auto-redirect if already logged in and role is loaded
  useEffect(() => {
    if (user && userRole) {
      navigate(userRole === "landowner" ? "/dashboard/landowner" : "/dashboard/gardener", { replace: true });
    }
  }, [user, userRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error, role } = await signIn(email, password);
      if (error) throw error;

      // Force refresh role just in case, then navigate
      let currentRole = role || await refreshUserRole();
      
      if (currentRole) {
        navigate(currentRole === "landowner" ? "/dashboard/landowner" : "/dashboard/gardener", { replace: true });
      } else {
        // Fallback: If role is missing (rare case), go home
        navigate("/"); 
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, name, selectedRole);
      if (error) throw error;

      // After signup, force fetch role and redirect immediately
      const role = await refreshUserRole();
      if (role) {
        navigate(role === "landowner" ? "/dashboard/landowner" : "/dashboard/gardener", { replace: true });
      } else {
        // If email confirmation is required by Supabase settings
        setError("สร้างบัญชีสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน หรือลองเข้าสู่ระบบ");
        setActiveTab("login");
      }
    } catch (err: any) {
      if (err.message?.includes("already registered")) {
        setError("อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ");
        setActiveTab("login");
      } else {
        setError(err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4 font-sans">
      <Button variant="ghost" className="absolute top-4 left-4" onClick={() => navigate("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> กลับหน้าหลัก
      </Button>

      <Card className="w-full max-w-lg shadow-2xl border-primary/10">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <TreePine className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Urban Farm Share</CardTitle>
          <CardDescription>
            {activeTab === "login" ? "ยินดีต้อนรับกลับมาสู่ชุมชนสีเขียว" : "เริ่มต้นเส้นทางเกษตรในเมืองของคุณ"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label htmlFor="password">รหัสผ่าน</Label></div>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "เข้าสู่ระบบ"}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                
                <div className="space-y-3">
                  <Label>เลือกบทบาทของคุณ</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => setSelectedRole("landowner")}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all hover:bg-muted/50 relative",
                        selectedRole === "landowner" ? "border-primary bg-primary/5" : "border-border bg-card"
                      )}
                    >
                      {selectedRole === "landowner" && <div className="absolute top-2 right-2 text-primary"><CheckCircle2 className="h-4 w-4" /></div>}
                      <MapPin className={cn("h-6 w-6", selectedRole === "landowner" ? "text-primary" : "text-muted-foreground")} />
                      <div className="text-center"><div className="font-semibold text-sm">ฉันมีพื้นที่</div></div>
                    </div>

                    <div 
                      onClick={() => setSelectedRole("gardener")}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all hover:bg-muted/50 relative",
                        selectedRole === "gardener" ? "border-primary bg-primary/5" : "border-border bg-card"
                      )}
                    >
                      {selectedRole === "gardener" && <div className="absolute top-2 right-2 text-primary"><CheckCircle2 className="h-4 w-4" /></div>}
                      <Sprout className={cn("h-6 w-6", selectedRole === "gardener" ? "text-primary" : "text-muted-foreground")} />
                      <div className="text-center"><div className="font-semibold text-sm">ฉันอยากปลูก</div></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">ชื่อ-นามสกุล</Label>
                  <Input id="signup-name" placeholder="สมชาย รักโลก" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">อีเมล</Label>
                  <Input id="signup-email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-pass">รหัสผ่าน</Label>
                    <Input id="signup-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">ยืนยันรหัสผ่าน</Label>
                    <Input id="signup-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "สร้างบัญชีใหม่"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}