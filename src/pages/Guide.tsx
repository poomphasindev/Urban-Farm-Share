import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, BookOpen, MapPin, Sprout, MessageSquare, CheckCircle2, Image as ImageIcon, Calendar, UserPlus } from "lucide-react";

export default function Guide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAF9] font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg text-slate-800">คู่มือการใช้งาน</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-10 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">ยินดีต้อนรับสู่ Urban Farm Share</h2>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
            แพลตฟอร์มแบ่งปันพื้นที่สีเขียวที่เชื่อมโยงเจ้าของที่ดินและนักปลูกเข้าด้วยกัน
            เรียนรู้วิธีการใช้งานระบบได้ง่ายๆ ตามบทบาทของคุณ
          </p>
        </div>

        <Tabs defaultValue="landowner" className="w-full animate-in slide-in-from-bottom-6 duration-700">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-white p-1 rounded-2xl shadow-sm mb-8">
            <TabsTrigger value="landowner" className="rounded-xl h-12 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 font-medium text-base transition-all">
              <MapPin className="w-4 h-4 mr-2" /> สำหรับเจ้าของพื้นที่ (Landowner)
            </TabsTrigger>
            <TabsTrigger value="gardener" className="rounded-xl h-12 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 font-medium text-base transition-all">
              <Sprout className="w-4 h-4 mr-2" /> สำหรับนักปลูก (Gardener)
            </TabsTrigger>
          </TabsList>

          {/* Landowner Guide */}
          <TabsContent value="landowner" className="space-y-6">
            <Card className="border-none shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-green-50 border-b border-green-100 pb-4">
                <CardTitle className="text-green-800 flex items-center gap-3">
                  <span className="bg-green-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                  เริ่มต้นใช้งาน
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-6">
                <ul className="space-y-4 text-slate-600">
                  <li className="flex gap-3 items-start">
                    <UserPlus className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>สมัครสมาชิกโดยเลือกบทบาทเป็น <strong>"ฉันมีพื้นที่ (Landowner)"</strong></span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>เข้าสู่ระบบเพื่อไปยังหน้า <strong>Dashboard</strong> ส่วนตัวของคุณ เพื่อดูภาพรวมและจัดการพื้นที่</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-green-50 border-b border-green-100 pb-4">
                <CardTitle className="text-green-800 flex items-center gap-3">
                  <span className="bg-green-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                  การลงทะเบียนพื้นที่ (Add Space)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-6 space-y-4">
                <p className="text-slate-600">กดปุ่ม <strong>"เพิ่มพื้นที่"</strong> ในหน้า Dashboard และกรอกข้อมูลให้ครบถ้วน:</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-green-200 transition-colors">
                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-slate-700"><ImageIcon className="w-4 h-4 text-green-600" /> รูปภาพ</h4>
                        <p className="text-sm text-slate-500">อัปโหลดรูปพื้นที่จริง เพื่อดึงดูดความสนใจ (รองรับไฟล์ JPG, PNG ไม่เกิน 5MB)</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-green-200 transition-colors">
                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-slate-700"><Calendar className="w-4 h-4 text-green-600" /> ช่วงเวลา</h4>
                        <p className="text-sm text-slate-500">ระบุวันที่ว่าง "เริ่ม - สิ้นสุด" ให้ชัดเจน เพื่อให้นักปลูกวางแผนได้</p>
                    </div>
                </div>
                <div className="text-sm text-slate-600 bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3 items-start">
                    <span className="text-xl">💡</span>
                    <div>
                        <strong>Tip:</strong> ระบุ "สิ่งอำนวยความสะดวก" (เช่น แหล่งน้ำ, รั้วกั้น) และ "กฎระเบียบ" ให้ชัดเจน เพื่อลดปัญหาการสื่อสารภายหลัง
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-green-50 border-b border-green-100 pb-4">
                <CardTitle className="text-green-800 flex items-center gap-3">
                  <span className="bg-green-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">3</span>
                  การจัดการคำขอ (Requests)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-slate-100">
                    <AccordionTrigger className="text-slate-700 font-medium">เมื่อมีคนสนใจพื้นที่</AccordionTrigger>
                    <AccordionContent className="text-slate-600 bg-slate-50 p-4 rounded-lg">
                      คุณจะได้รับการแจ้งเตือนในหน้า "คำขอ" (Requests) คุณสามารถกดดูรายละเอียดของผู้ขอเช่า และข้อความแนะนำตัวได้
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-slate-100">
                    <AccordionTrigger className="text-slate-700 font-medium">การอนุมัติ / ปฏิเสธ</AccordionTrigger>
                    <AccordionContent className="text-slate-600 bg-slate-50 p-4 rounded-lg">
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong className="text-green-600">อนุมัติ (Approve):</strong> เมื่อตกลงให้ใช้พื้นที่ ผู้เช่าจะสามารถเริ่มแชทและนัดหมายได้</li>
                        <li><strong className="text-red-500">ปฏิเสธ (Reject):</strong> หากเงื่อนไขไม่ตรงกัน หรือพื้นที่ไม่ว่างแล้ว</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gardener Guide */}
          <TabsContent value="gardener" className="space-y-6">
             <Card className="border-none shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
                <CardTitle className="text-emerald-800 flex items-center gap-3">
                  <span className="bg-emerald-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                  ค้นหาและจับจอง (Explore)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-6">
                <p className="text-slate-600 mb-4">
                    ในหน้า <strong>"สำรวจ"</strong> คุณสามารถค้นหาพื้นที่ที่ต้องการได้จากชื่อ หรือทำเลที่ตั้ง
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200">ทำเลที่ตั้ง</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200">ขนาดพื้นที่</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200">สิ่งอำนวยความสะดวก</span>
                </div>
                <p className="text-slate-600">
                    เมื่อเจอที่ที่ถูกใจ กด <strong>"ดูรายละเอียด"</strong> เพื่อดูรูปภาพ กฎระเบียบ และกด <strong>"ส่งคำขอเช่าพื้นที่"</strong> พร้อมข้อความแนะนำตัวสั้นๆ
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
                <CardTitle className="text-emerald-800 flex items-center gap-3">
                  <span className="bg-emerald-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                  เริ่มใช้งานพื้นที่ (Start Project)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-6 space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-emerald-50/50 transition-colors">
                    <div className="bg-emerald-100 p-2 rounded-full"><MessageSquare className="w-5 h-5 text-emerald-600" /></div>
                    <div>
                        <h4 className="font-semibold text-slate-800">1. พูดคุยตกลง</h4>
                        <p className="text-sm text-slate-500 mt-1">เมื่อเจ้าของอนุมัติ คุณจะสามารถแชทคุยรายละเอียด นัดวันเข้าพื้นที่ได้</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-emerald-50/50 transition-colors">
                    <div className="bg-emerald-100 p-2 rounded-full"><Sprout className="w-5 h-5 text-emerald-600" /></div>
                    <div>
                        <h4 className="font-semibold text-slate-800">2. กดปุ่ม "เริ่มปลูก"</h4>
                        <p className="text-sm text-slate-500 mt-1">เมื่อเข้าพื้นที่วันแรก ให้กดปุ่ม <strong>"เริ่มปลูก"</strong> ในหน้าแชท เพื่อเปลี่ยนสถานะเป็น <strong>"กำลังใช้งาน" (Active)</strong> ระบบจะเริ่มนับเวลาและแสดงใน Dashboard</p>
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
                <CardTitle className="text-emerald-800 flex items-center gap-3">
                  <span className="bg-emerald-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">3</span>
                  จบโครงการ (Finish)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-6">
                <p className="text-slate-600 leading-relaxed">
                    เมื่อหมดสัญญาเช่า หรือต้องการคืนพื้นที่ ให้กดปุ่ม <strong>"จบโครงการ"</strong> ในหน้าแชทเดิม สถานะจะเปลี่ยนเป็น <strong>"เสร็จสิ้น" (Completed)</strong> และพื้นที่นั้นจะกลับมาว่างสำหรับการจองครั้งถัดไป
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 text-center pb-8">
            <p className="text-slate-500 mb-4">พร้อมที่จะเริ่มสร้างพื้นที่สีเขียวหรือยัง?</p>
            <Button asChild className="rounded-full px-8 h-12 shadow-lg bg-primary hover:bg-primary/90 text-lg transition-transform hover:scale-105">
                <Link to="/">กลับสู่หน้าหลัก</Link>
            </Button>
        </div>
      </main>
    </div>
  );
}