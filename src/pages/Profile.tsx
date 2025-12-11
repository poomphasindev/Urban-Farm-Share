import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, Upload, User as UserIcon, MapPin, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    location: "",
    avatar_url: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) getProfile();
  }, [user]);

  const getProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          name: data.name || "",
          location: data.location || "",
          avatar_url: data.avatar_url || ""
        });
        if (data.avatar_url) setImagePreview(data.avatar_url);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    } finally {
      setFetching(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for avatars
        toast({ title: "ไฟล์ใหญ่เกินไป", description: "รูปโปรไฟล์ไม่ควรเกิน 2MB", variant: "destructive" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = profile.avatar_url;

      // 1. Upload Image if changed
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user!.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrl;
      }

      // 2. Update Profile Data
      const updates = {
        id: user!.id,
        name: profile.name,
        location: profile.location,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      // 3. Update Auth Metadata (Optional but good for consistency)
      await supabase.auth.updateUser({
        data: { name: profile.name }
      });

      toast({ title: "บันทึกสำเร็จ", description: "ข้อมูลโปรไฟล์ของคุณถูกอัปเดตแล้ว" });
      
      // Refresh page or go back
      navigate(-1);

    } catch (error: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg">
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-5 w-5" /> กลับ
        </Button>

        <Card className="shadow-xl border-none rounded-3xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-green-400 to-emerald-600"></div>
          <CardHeader className="text-center -mt-16 pb-2">
            <div className="relative mx-auto w-32 h-32 group">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg cursor-pointer">
                <AvatarImage src={imagePreview || ""} className="object-cover" />
                <AvatarFallback className="text-4xl bg-slate-100 text-slate-400">
                  {profile.name?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">{profile.name || "ผู้ใช้งาน"}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-slate-600">
                  <UserIcon className="h-4 w-4" /> ชื่อที่แสดง
                </Label>
                <Input 
                  id="name" 
                  value={profile.name} 
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  placeholder="ชื่อของคุณ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" /> ที่อยู่ / โซนที่สะดวก
                </Label>
                <Textarea 
                  id="location" 
                  value={profile.location} 
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })} 
                  className="min-h-[100px] rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all resize-none"
                  placeholder="เช่น รังสิต, ปทุมธานี..."
                />
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base shadow-md bg-primary hover:bg-primary/90 mt-4" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <><Save className="mr-2 h-4 w-4" /> บันทึกการเปลี่ยนแปลง</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}