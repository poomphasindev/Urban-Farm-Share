import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Ruler, Calendar, CheckCircle2, Info, ShieldCheck, TreePine, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SpaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const [space, setSpace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [isSpaceOccupied, setIsSpaceOccupied] = useState(false);

  useEffect(() => {
    fetchSpaceData();
  }, [id, user]);

  const fetchSpaceData = async () => {
    setLoading(true);
    try {
      const { data: spaceData, error } = await supabase.from("urban_farm_spaces").select("*").eq("id", id).single();
      if (error || !spaceData) {
        navigate("/"); return;
      }
      const { data: owner } = await supabase.from("profiles").select("name").eq("id", spaceData.owner_id).single();
      setSpace({ ...spaceData, owner_name: owner?.name || "เจ้าของพื้นที่" });

      const { data: occupiedCheck } = await supabase
        .from("space_requests")
        .select("id")
        .eq("space_id", id)
        .eq("status", "active")
        .maybeSingle();
      
      setIsSpaceOccupied(!!occupiedCheck);

      if (user && userRole === "gardener") {
        const { data: myRequest } = await supabase
          .from("space_requests")
          .select("*")
          .eq("space_id", id)
          .eq("gardener_id", user.id)
          .in("status", ['pending', 'approved', 'active'])
          .maybeSingle();
        
        setActiveRequest(myRequest);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user) { navigate("/auth"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("space_requests").insert({
      space_id: id, gardener_id: user.id, message: requestMessage.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "ส่งคำขอเรียบร้อยแล้ว" });
      fetchSpaceData();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!space) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold text-lg truncate flex-1">{space.title}</span>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 space-y-6">
        {/* Banner with Image Support */}
        <div className="w-full h-56 md:h-96 bg-slate-100 rounded-3xl shadow-lg relative overflow-hidden group">
          {space.image_url ? (
            <>
              <img src={space.image_url} alt={space.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-emerald-800 flex flex-col items-center justify-center text-white">
              <TreePine className="h-24 w-24 text-white/20 mb-2" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 p-6 w-full text-white">
            <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md mb-2">{space.title}</h1>
            <div className="flex items-center gap-2 text-white/90">
              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-none">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {space.farm_type || "พื้นที่เกษตร"}
              </Badge>
            </div>
          </div>
          {isSpaceOccupied && !activeRequest && (
             <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
               ไม่ว่าง (มีผู้ใช้งานอยู่)
             </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-md rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Info className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">เกี่ยวกับพื้นที่</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {space.description || "เจ้าของพื้นที่ไม่ได้ระบุรายละเอียดเพิ่มเติม"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                      <Ruler className="h-4 w-4" /> ขนาด
                    </div>
                    <p className="font-medium text-lg">{space.area_size || "-"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                      <Calendar className="h-4 w-4" /> ว่างเมื่อ
                    </div>
                    <p className="font-medium text-lg">
                      {space.available_from ? new Date(space.available_from).toLocaleDateString('th-TH') : "ไม่ระบุ"}
                    </p>
                  </div>
                </div>

                {space.amenities && space.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">สิ่งอำนวยความสะดวก</h3>
                    <div className="flex flex-wrap gap-2">
                      {space.amenities.map((item: string, i: number) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1.5 font-normal bg-green-50 text-green-700 hover:bg-green-100 border-green-100">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {space.rules && (
                  <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-2 font-semibold mb-2 text-orange-800">
                      <ShieldCheck className="h-5 w-5" /> กฎระเบียบ
                    </div>
                    <p className="text-sm text-orange-900/80 leading-relaxed">{space.rules}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-primary text-white font-bold">{space.owner_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">เจ้าของพื้นที่</p>
                    <p className="font-semibold text-lg">{space.owner_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden">
                <div className="bg-slate-900 text-white p-4 text-center">
                  <h3 className="font-bold text-lg">สนใจพื้นที่นี้?</h3>
                  <p className="text-slate-300 text-sm">ส่งคำขอเพื่อเริ่มปลูกผัก</p>
                </div>
                <CardContent className="p-6">
                  {!user ? (
                    <Button asChild className="w-full rounded-xl h-12 text-base shadow-md bg-primary hover:bg-primary/90">
                      <Link to="/auth">เข้าสู่ระบบเพื่อจอง</Link>
                    </Button>
                  ) : userRole !== 'gardener' ? (
                    <div className="text-center text-sm text-muted-foreground bg-slate-100 p-4 rounded-xl">
                      เฉพาะบัญชี "นักปลูก" เท่านั้นที่สามารถส่งคำขอได้
                    </div>
                  ) : activeRequest ? (
                    <div className="text-center p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <Badge className={`mb-3 px-3 py-1 text-sm ${
                        activeRequest.status === 'approved' ? 'bg-green-500' :
                        activeRequest.status === 'active' ? 'bg-green-600' : 'bg-yellow-500'
                      }`}>
                        {activeRequest.status === 'approved' ? 'อนุมัติแล้ว' : 
                         activeRequest.status === 'active' ? 'กำลังใช้งาน' : 'รอการตอบรับ'}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {activeRequest.status === 'active' 
                          ? "คุณกำลังใช้งานพื้นที่นี้อยู่" 
                          : "คำขอของคุณกำลังดำเนินการ"}
                      </p>
                      {(activeRequest.status === 'approved' || activeRequest.status === 'active') && (
                        <Button asChild className="w-full mt-4 rounded-xl" variant="outline">
                          <Link to={`/requests/${activeRequest.id}/chat`}>ไปที่แชท / จัดการ</Link>
                        </Button>
                      )}
                    </div>
                  ) : isSpaceOccupied ? (
                    <div className="text-center p-5 bg-red-50 rounded-xl border border-red-100 text-red-800">
                      <p className="font-semibold">พื้นที่นี้ไม่ว่าง</p>
                      <p className="text-sm opacity-80 mt-1">กำลังมีผู้ใช้งานอยู่ในขณะนี้</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="แนะนำตัวสั้นๆ..." 
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        className="min-h-[120px] rounded-xl resize-none bg-slate-50 border-slate-200 focus:bg-white"
                      />
                      <Button 
                        className="w-full rounded-xl h-12 text-base shadow-md bg-primary hover:bg-primary/90" 
                        onClick={handleSubmitRequest}
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="animate-spin" /> : "ส่งคำขอเช่าพื้นที่"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}