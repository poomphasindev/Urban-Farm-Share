import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Calendar as CalendarIcon, MapPin, Leaf, ShieldAlert, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FARM_TYPES = [
  "สวนหลังบ้าน", "ดาดฟ้าตึก", "ที่ดินว่างเปล่า", "ระเบียงคอนโด", "สวนในหมู่บ้าน", "อื่นๆ"
];

const AMENITIES = [
  "แหล่งน้ำ", "อุปกรณ์ทำสวน", "แสงแดดเต็มวัน", "ร่มเงา", "รั้วรอบขอบชิด", "ถังหมักปุ๋ย", "ที่จอดรถ", "ห้องน้ำ", "กล้องวงจรปิด"
];

export default function SpaceForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    area_size: "",
    tags: "",
    farm_type: "",
    available_from: "",
    available_to: "",
    rules: "",
    amenities: [] as string[],
  });
  
  // State สำหรับจัดการรูปภาพ
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && user) {
      fetchSpace();
    }
  }, [id, user]);

  const fetchSpace = async () => {
    const { data, error } = await supabase
      .from("urban_farm_spaces")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setForm({
        title: data.title,
        description: data.description || "",
        address: data.address,
        area_size: data.area_size || "",
        tags: data.tags || "",
        farm_type: data.farm_type || "",
        available_from: data.available_from || "",
        available_to: data.available_to || "",
        rules: data.rules || "",
        amenities: data.amenities || [],
      });
      // ดึงรูปมาโชว์ถ้ามี
      if (data.image_url) setImagePreview(data.image_url);
    }
    setFetching(false);
  };

  const handleAmenityChange = (item: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(item)
        ? prev.amenities.filter(i => i !== item)
        : [...prev.amenities, item]
    }));
  };

  // ฟังก์ชันเลือกรูปภาพ
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "ไฟล์ใหญ่เกินไป", description: "กรุณาใช้รูปขนาดไม่เกิน 5MB", variant: "destructive" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.address.trim()) {
      toast({ title: "ข้อมูลไม่ครบถ้วน", description: "กรุณากรอกชื่อและที่อยู่", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Logic อัปโหลดรูป
    let imageUrl = imagePreview; // ใช้รูปเดิมถ้าไม่ได้อัปใหม่ (กรณีแก้ไข)
    
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user!.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('farm-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        toast({ title: "อัปโหลดรูปไม่สำเร็จ", description: uploadError.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('farm-images')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;
    }

    const spaceData = { 
      ...form, 
      owner_id: user!.id,
      image_url: imageUrl // บันทึก URL ลง DB
    };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase.from("urban_farm_spaces").update(spaceData).eq("id", id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("urban_farm_spaces").insert(spaceData);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "สำเร็จ", description: "บันทึกข้อมูลพื้นที่เรียบร้อยแล้ว" });
      navigate("/dashboard/landowner");
    }
  };

  if (fetching) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-white border-b sticky top-0 z-20 px-4 py-3 shadow-sm">
        <div className="container mx-auto max-w-2xl flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{isEditing ? "แก้ไขข้อมูลพื้นที่" : "ลงทะเบียนพื้นที่ใหม่"}</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="h-2 bg-primary w-full"></div>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* ส่วนอัปโหลดรูปภาพ */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <ImagePlus className="h-5 w-5" />
                  <h2>รูปภาพพื้นที่</h2>
                </div>
                
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative min-h-[200px]">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleImageChange}
                  />
                  
                  {imagePreview ? (
                    <div className="relative w-full max-h-[300px] rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
                         <p className="text-white font-medium">คลิกเพื่อเปลี่ยนรูป</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <ImagePlus className="w-8 h-8" />
                      </div>
                      <p className="font-medium text-slate-700">คลิกเพื่ออัปโหลดรูปภาพ</p>
                      <p className="text-sm text-slate-500 mt-1">รองรับไฟล์ JPG, PNG (ไม่เกิน 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ข้อมูลทั่วไป */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <MapPin className="h-5 w-5" />
                  <h2>ข้อมูลทั่วไป</h2>
                </div>
                
                <div className="space-y-2">
                  <Label>ชื่อพื้นที่ *</Label>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="เช่น สวนผักหลังบ้านลาดพร้าว" className="h-11" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ประเภทพื้นที่</Label>
                    <Select value={form.farm_type} onValueChange={v => setForm({...form, farm_type: v})}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                      <SelectContent>
                        {FARM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ขนาดพื้นที่ (ตร.ม.)</Label>
                    <Input value={form.area_size} onChange={e => setForm({...form, area_size: e.target.value})} placeholder="เช่น 4x4, 20" className="h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ที่อยู่ / จุดสังเกต *</Label>
                  <Textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="บ้านเลขที่ ซอย ถนน เขต..." required className="resize-none" rows={3} />
                </div>
              </div>

              {/* รายละเอียดการใช้งาน */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <Leaf className="h-5 w-5" />
                  <h2>การใช้งาน</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ว่างตั้งแต่</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="date" className="pl-9 h-11" value={form.available_from} onChange={e => setForm({...form, available_from: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ถึงวันที่</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="date" className="pl-9 h-11" value={form.available_to} onChange={e => setForm({...form, available_to: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>สิ่งอำนวยความสะดวก</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {AMENITIES.map(item => (
                      <div key={item} className={`flex items-center space-x-2 border rounded-lg p-3 transition-colors ${form.amenities.includes(item) ? "border-primary bg-primary/5" : "border-slate-200"}`}>
                        <Checkbox 
                          id={item} 
                          checked={form.amenities.includes(item)}
                          onCheckedChange={() => handleAmenityChange(item)}
                        />
                        <label htmlFor={item} className="text-sm cursor-pointer w-full">{item}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags (คั่นด้วยจุลภาค)</Label>
                  <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="ผักสลัด, ปลอดสาร, มือใหม่" className="h-11" />
                </div>
              </div>

              {/* กฎระเบียบ */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                  <ShieldAlert className="h-5 w-5" />
                  <h2>ข้อตกลงและกฎระเบียบ</h2>
                </div>
                <div className="space-y-2">
                  <Textarea 
                    value={form.rules} 
                    onChange={e => setForm({...form, rules: e.target.value})} 
                    placeholder="เช่น ห้ามใช้สารเคมี, เข้าออกได้เฉพาะเวลา 08.00-18.00..." 
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => navigate(-1)}>ยกเลิก</Button>
                <Button type="submit" className="flex-1 h-11 rounded-xl shadow-md bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "บันทึกข้อมูลพื้นที่"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}