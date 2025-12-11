import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreePine, Plus, MapPin, Edit, Trash2, Eye, EyeOff, MessageSquare, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LandownerDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchSpaces();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
    if (data) setUserProfile(data);
  };

  const fetchSpaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("urban_farm_spaces")
      .select("*")
      .eq("owner_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSpaces(data);
      const counts: Record<string, number> = {};
      for (const space of data) {
        const { count } = await supabase
          .from("space_requests")
          .select("*", { count: "exact", head: true })
          .eq("space_id", space.id)
          .eq("status", "pending");
        counts[space.id] = count || 0;
      }
      setRequestCounts(counts);
    }
    setLoading(false);
  };

  const handleToggleActive = async (spaceId: string, currentStatus: boolean) => {
    setSpaces(spaces.map(s => s.id === spaceId ? { ...s, is_active: !currentStatus } : s));
    await supabase.from("urban_farm_spaces").update({ is_active: !currentStatus }).eq("id", spaceId);
  };

  const handleDelete = async (spaceId: string) => {
    if(!confirm("ยืนยันการลบพื้นที่นี้?")) return;
    await supabase.from("urban_farm_spaces").delete().eq("id", spaceId);
    fetchSpaces();
    toast({ title: "ลบพื้นที่สำเร็จ" });
  };

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-border/50 px-4 py-3 shadow-sm">
        <div className="container mx-auto flex items-center justify-between max-w-4xl">
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-9 w-9 border cursor-pointer">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-xl text-muted-foreground hover:text-primary"
            >
              <Link to="/dashboard/landowner/requests">
                <MessageSquare className="mr-2 h-4 w-4" /> คำขอ
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="rounded-full hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">พื้นที่ของคุณ</h1>
            <p className="text-muted-foreground text-sm mt-1">จัดการพื้นที่และดูสถานะ</p>
          </div>
          <Button asChild className="rounded-full shadow-lg bg-primary hover:bg-primary/90 px-6">
            <Link to="/dashboard/landowner/spaces/new">
              <Plus className="mr-2 h-4 w-4" /> เพิ่มพื้นที่
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => <Skeleton key={i} className="h-[200px] w-full rounded-3xl" />)}
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">ยังไม่มีพื้นที่</h3>
            <p className="text-muted-foreground mb-6">เริ่มแบ่งปันพื้นที่ว่างของคุณวันนี้</p>
            <Button variant="outline" className="rounded-full" asChild><Link to="/dashboard/landowner/spaces/new">เพิ่มพื้นที่เลย</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {spaces.map((space) => (
              <Card key={space.id} className="group border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl bg-white overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={space.is_active ? "default" : "secondary"} className={`rounded-lg px-3 py-1 font-medium ${space.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500"}`}>
                      {space.is_active ? "เปิดใช้งาน" : "ปิดชั่วคราว"}
                    </Badge>
                    {requestCounts[space.id] > 0 && (
                      <Badge className="bg-accent text-white animate-pulse rounded-full px-3">
                        {requestCounts[space.id]} คำขอใหม่
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{space.title}</h3>
                  
                  <div className="flex items-center text-muted-foreground text-sm mb-6 bg-secondary/50 p-3 rounded-xl">
                    <MapPin className="h-4 w-4 mr-2 text-primary shrink-0" />
                    <span className="truncate">{space.address}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl border-border/50 bg-secondary/30 hover:bg-secondary" onClick={() => handleToggleActive(space.id, space.is_active)}>
                      {space.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl border-border/50 bg-secondary/30 hover:bg-secondary" asChild>
                      <Link to={`/dashboard/landowner/spaces/${space.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600" onClick={() => handleDelete(space.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}