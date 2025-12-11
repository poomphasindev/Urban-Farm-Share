import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Sprout, LogOut, MessageCircle, TreePine, Calendar, CheckCircle2, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GardenerDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [spaces, setSpaces] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Active Farm Logic
  const activeFarm = requests.find(r => r.status === 'active');

  useEffect(() => {
    if (user) {
      fetchData();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
    if (data) setUserProfile(data);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: spacesData } = await supabase
        .from("urban_farm_spaces")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      const ownerIds = [...new Set(spacesData?.map(s => s.owner_id) || [])];
      const { data: profilesData } = await supabase.from("profiles").select("id, name").in("id", ownerIds);

      setSpaces(spacesData?.map(space => ({
        ...space,
        owner_name: profilesData?.find(p => p.id === space.owner_id)?.name || "ไม่ระบุชื่อ"
      })) || []);

      const { data: reqData } = await supabase
        .from("space_requests")
        .select("*, urban_farm_spaces(*)")
        .eq("gardener_id", user!.id)
        .order("created_at", { ascending: false });

      if (reqData) setRequests(reqData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date nicely
  const formatDateRange = (from: string, to: string) => {
    if (!from || !to) return "ไม่ระบุช่วงเวลา";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
    const dateFrom = new Date(from).toLocaleDateString('th-TH', options);
    const dateTo = new Date(to).toLocaleDateString('th-TH', options);
    return `${dateFrom} - ${dateTo}`;
  };

  const getDaysRemaining = (request: any) => {
    if (!request.urban_farm_spaces.available_to) return { days: 0, percent: 0, total: 0 };
    const start = new Date(request.started_at || request.created_at).getTime();
    const end = new Date(request.urban_farm_spaces.available_to).getTime();
    const now = new Date().getTime();
    const total = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const passed = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    const percent = Math.min(100, Math.max(0, (passed / total) * 100));
    return { days: remaining, percent, total };
  };

  const filteredSpaces = spaces.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-24 font-sans">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-border/50 px-4 py-3 shadow-sm">
        <div className="container mx-auto flex items-center justify-between max-w-lg">
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-9 w-9 border cursor-pointer">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {userProfile?.name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">
                {userProfile?.name || "Gardener"}
              </p>
              <p className="text-[10px] text-muted-foreground">นักปลูกผัก</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="rounded-full hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        
        {/* Active Farm Highlight */}
        {!loading && activeFarm && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">กำลังดำเนินการ</h2>
            </div>
            <Card className="border-none shadow-lg bg-gradient-to-br from-green-600 to-emerald-800 text-white rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10"><TreePine className="w-32 h-32" /></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-2 backdrop-blur-sm">
                      Active Farm
                    </Badge>
                    <h3 className="text-2xl font-bold">{activeFarm.urban_farm_spaces.title}</h3>
                    <p className="text-emerald-100 text-sm flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" /> {activeFarm.urban_farm_spaces.address}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>ความคืบหน้า</span>
                    <span>เหลืออีก {getDaysRemaining(activeFarm).days} วัน</span>
                  </div>
                  <Progress value={getDaysRemaining(activeFarm).percent} className="h-2.5 bg-black/20" indicatorClassName="bg-white" />
                  <div className="flex justify-between text-xs text-emerald-100/70 mt-1">
                    <span>เริ่ม: {new Date(activeFarm.started_at!).toLocaleDateString('th-TH')}</span>
                    <span>สิ้นสุด: {new Date(activeFarm.urban_farm_spaces.available_to).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>

                <Button asChild className="w-full mt-6 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold shadow-md">
                  <Link to={`/requests/${activeFarm.id}/chat`}>
                    <MessageCircle className="w-4 h-4 mr-2" /> จัดการ / พูดคุย
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input 
            placeholder="ค้นหาพื้นที่ปลูกผัก..." 
            className="pl-10 h-12 rounded-2xl border-none shadow-sm bg-white text-base focus-visible:ring-primary/50"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setActiveTab("browse"); }}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-2xl shadow-sm h-12">
            <TabsTrigger value="browse" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">
              สำรวจ
            </TabsTrigger>
            <TabsTrigger value="my-farms" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">
              ประวัติ
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab - The Rich Data Cards */}
          <TabsContent value="browse" className="space-y-5">
            {loading ? (
              [1,2].map(i => <Skeleton key={i} className="h-64 w-full rounded-3xl" />)
            ) : filteredSpaces.length === 0 ? (
              <div className="text-center py-12 opacity-60">
                <TreePine className="mx-auto h-12 w-12 mb-2 text-slate-300" />
                <p>ไม่พบพื้นที่</p>
              </div>
            ) : (
              filteredSpaces.map((space) => (
                <Link to={`/spaces/${space.id}`} key={space.id} className="block group">
                  <Card className="overflow-hidden border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-3xl bg-white h-full transform hover:-translate-y-1">
                    
                    {/* Image Area with Badges */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {space.image_url ? (
                        <img 
                          src={space.image_url} 
                          alt={space.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-100 to-emerald-50 flex items-center justify-center">
                          <TreePine className="h-16 w-16 text-primary/20" />
                        </div>
                      )}
                      
                      {/* Top Badges: Type & Size */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {space.farm_type && (
                            <Badge variant="secondary" className="bg-white/90 text-primary backdrop-blur-md shadow-sm border-none font-medium">
                                <Leaf className="w-3 h-3 mr-1" /> {space.farm_type}
                            </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                         <Badge className="bg-black/60 hover:bg-black/70 text-white backdrop-blur-md border-none font-medium">
                            {space.area_size || "N/A"}
                         </Badge>
                      </div>

                      {/* Bottom Gradient Overlay for readability */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>

                    {/* Content Area */}
                    <CardContent className="p-5">
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {space.title}
                      </h3>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mr-1 text-primary shrink-0" />
                        <span className="truncate">{space.address}</span>
                      </div>

                      {/* Info Grid: Date & Amenities */}
                      <div className="grid grid-cols-1 gap-2 mb-4">
                        <div className="flex items-center text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                           <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />
                           <span className="font-medium">ว่าง: {formatDateRange(space.available_from, space.available_to)}</span>
                        </div>
                      </div>

                      {/* Tags/Amenities Preview */}
                      {space.amenities && space.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {space.amenities.slice(0, 3).map((item: string, i: number) => (
                                <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100">
                                    {item}
                                </span>
                            ))}
                            {space.amenities.length > 3 && (
                                <span className="text-[10px] px-2 py-1 rounded-md bg-slate-50 text-slate-500">
                                    +{space.amenities.length - 3}
                                </span>
                            )}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                          โดย {space.owner_name}
                        </span>
                        <Button size="sm" className="rounded-xl px-4 h-8 bg-primary hover:bg-primary/90 text-xs shadow-sm">
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="my-farms" className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-white rounded-3xl border border-dashed p-8">
                <p>ยังไม่มีประวัติการเช่า</p>
              </div>
            ) : (
             requests.map((req) => (
                <Card key={req.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-foreground/90">{req.urban_farm_spaces?.title}</h3>
                      <Badge className={
                        req.status === 'active' ? 'bg-green-500 hover:bg-green-600' :
                        req.status === 'completed' ? 'bg-slate-500 hover:bg-slate-600' :
                        req.status === 'approved' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'
                      }>
                        {req.status === 'active' ? 'กำลังปลูก' : req.status === 'completed' ? 'เสร็จสิ้น' : req.status === 'approved' ? 'อนุมัติ' : 'รอตรวจสอบ'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">
                        เริ่มเมื่อ: {req.started_at ? new Date(req.started_at).toLocaleDateString('th-TH') : '-'}
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full rounded-xl border-primary/20 text-primary bg-primary/5 hover:bg-primary/10">
                      <Link to={`/requests/${req.id}/chat`}><MessageCircle className="h-4 w-4 mr-2" /> ดูรายละเอียด</Link>
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}