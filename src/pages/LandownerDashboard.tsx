import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MapPin, Users, Clock, LayoutGrid, Edit, LogOut, Trash2, ArrowRight, LandPlot } from "lucide-react"; // ใช้ LandPlot แทน
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GuideSection } from "@/components/GuideSection";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function LandownerDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("my-spaces");
  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
    if (data) setUserProfile(data);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. ดึงพื้นที่ของเรา
      const { data: spacesData } = await supabase
        .from("urban_farm_spaces")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      
      if (spacesData) setSpaces(spacesData);

      // 2. ดึงคำขอเช่าที่เข้ามา (เพื่อเอามานับ Stats)
      const { data: reqData } = await supabase
        .from("space_requests")
        .select("id, status")
        .in("space_id", spacesData?.map(s => s.id) || []); // ดึงเฉพาะ request ของ space เรา

      if (reqData) setRequests(reqData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    try {
      const { error } = await supabase.from("urban_farm_spaces").delete().eq("id", spaceId);
      if (error) throw error;
      setSpaces(spaces.filter((s) => s.id !== spaceId));
      toast({ title: "ลบพื้นที่สำเร็จ", description: "พื้นที่ของคุณถูกลบออกจากระบบแล้ว" });
    } catch (error: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    }
  };

  // Stats Calculation
  const stats = {
    totalSpaces: spaces.length,
    activeTenants: requests.filter(r => r.status === 'approved' || r.status === 'active').length,
    pendingRequests: requests.filter(r => r.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-24 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-border/50 px-4 py-3 shadow-sm">
        <div className="container mx-auto flex items-center justify-between max-w-lg">
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-9 w-9 border cursor-pointer ring-2 ring-emerald-50">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                {userProfile?.name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">
                {userProfile?.name || "Landowner"}
              </p>
              <p className="text-[10px] text-muted-foreground">เจ้าของพื้นที่</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => signOut()} className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        
        {/* 1. Profile Card (Landowner Style) */}
        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-lg text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <LandPlot className="w-32 h-32 -mr-8 -mt-8" />
            </div>
            
            <CardContent className="p-6 flex items-start gap-5 relative z-10">
              <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl rounded-full">
                <AvatarImage src={userProfile?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-white text-blue-700 text-2xl font-bold">
                  {userProfile?.name?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-bold leading-tight">
                  {userProfile?.name || "ยินดีต้อนรับ"}
                </h2>
                <div className="flex flex-wrap gap-2 text-blue-50 text-xs items-center mt-1">
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none px-2 py-0.5 font-normal backdrop-blur-sm">
                    Verified Landowner
                  </Badge>
                </div>
                <p className="text-blue-100/80 text-xs flex items-center gap-1 pt-1">
                  <MapPin className="w-3 h-3" />
                  {userProfile?.location || "กรุงเทพมหานคร"}
                </p>
                <div className="pt-3">
                  <Button variant="secondary" size="sm" asChild className="h-8 bg-white text-blue-700 hover:bg-blue-50 border-none shadow-sm text-xs font-bold px-4">
                    <Link to="/profile">
                      <Edit className="w-3 h-3 mr-1.5" /> แก้ไขโปรไฟล์
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Stats Dashboard (Overview) */}
        <div className="grid grid-cols-3 gap-3">
            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                        <LayoutGrid className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800">{stats.totalSpaces}</span>
                    <span className="text-[10px] text-slate-500">พื้นที่ทั้งหมด</span>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                        <Users className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800">{stats.activeTenants}</span>
                    <span className="text-[10px] text-slate-500">ผู้เช่าActive</span>
                </CardContent>
            </Card>
            <Link to="/dashboard/landowner/requests">
                <Card className="border-none shadow-sm bg-white hover:bg-orange-50 transition-colors cursor-pointer ring-1 ring-orange-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center relative">
                        {stats.pendingRequests > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                            <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800">{stats.pendingRequests}</span>
                        <span className="text-[10px] text-slate-500">รออนุมัติ</span>
                    </CardContent>
                </Card>
            </Link>
        </div>

        {/* 3. Action Button & Tabs */}
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">จัดการพื้นที่</h3>
            <Button size="sm" onClick={() => navigate("/dashboard/landowner/spaces/new")} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm text-xs h-8">
                <Plus className="w-4 h-4 mr-1" /> ลงประกาศใหม่
            </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-xl shadow-sm h-12">
            <TabsTrigger value="my-spaces" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium text-slate-500">
              พื้นที่ของฉัน
            </TabsTrigger>
            <TabsTrigger value="guide" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-medium text-slate-500">
               คู่มือเจ้าของที่
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-spaces" className="space-y-4">
            {loading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
            ) : spaces.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <LandPlot className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-900">ยังไม่มีพื้นที่</h3>
                <p className="text-sm text-slate-500 mb-6">เริ่มลงประกาศพื้นที่ว่างของคุณเพื่อให้คนเมืองได้ปลูกผัก</p>
                <Button onClick={() => navigate("/dashboard/landowner/spaces/new")}>
                  <Plus className="mr-2 h-4 w-4" /> เพิ่มพื้นที่ใหม่
                </Button>
              </div>
            ) : (
              spaces.map((space) => (
                <Card key={space.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white group ring-1 ring-slate-100">
                  <div className="flex h-32">
                    {/* Image Section */}
                    <div className="w-1/3 relative">
                      {space.image_url ? (
                        <img src={space.image_url} alt={space.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <LandPlot className="text-slate-300" />
                        </div>
                      )}
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${space.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                         {space.is_active ? 'เปิดรับ' : 'ปิดชั่วคราว'}
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 line-clamp-1">{space.title}</h3>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                           <MapPin className="w-3 h-3 mr-1" /> {space.address}
                        </p>
                      </div>
                      
                      <div className="flex justify-end items-center gap-2 mt-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" onClick={() => navigate(`/dashboard/landowner/spaces/${space.id}/edit`)}>
                            <Edit className="w-4 h-4" />
                         </Button>

                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>ยืนยันการลบพื้นที่?</AlertDialogTitle>
                                    <AlertDialogDescription>การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลพื้นที่และประวัติการเช่าทั้งหมดจะถูกลบ</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteSpace(space.id)} className="bg-red-600 hover:bg-red-700">ยืนยันลบ</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="guide">
            <GuideSection role="landowner" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}