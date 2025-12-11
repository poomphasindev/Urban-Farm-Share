import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreePine, ArrowLeft, Loader2, QrCode, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";

interface RequestData {
  id: string;
  status: string;
  qr_code_token: string;
  space_title: string;
  space_address: string;
  gardener_name: string;
}

export default function QRCodePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<"valid" | "invalid" | null>(null);

  useEffect(() => {
    // Check if we're verifying a QR code (landowner scanning)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setVerifyToken(token);
      verifyQRCode(token);
    } else {
      fetchRequestData();
    }
  }, [id, user]);

  const fetchRequestData = async () => {
    const { data, error } = await supabase
      .from("space_requests")
      .select(`
        id,
        status,
        qr_code_token,
        gardener_id,
        urban_farm_spaces (title, address, owner_id)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Request not found",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Check permission - only gardener of this request can view QR
    if (user && data.gardener_id !== user.id) {
      toast({
        title: "Error",
        description: "You don't have permission to view this QR code",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Get gardener profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", data.gardener_id)
      .single();

    setRequestData({
      id: data.id,
      status: data.status,
      qr_code_token: data.qr_code_token,
      space_title: (data.urban_farm_spaces as any)?.title || "",
      space_address: (data.urban_farm_spaces as any)?.address || "",
      gardener_name: profile?.name || "Unknown",
    });

    setLoading(false);
  };

  const verifyQRCode = async (token: string) => {
    const { data, error } = await supabase
      .from("space_requests")
      .select(`
        id,
        status,
        gardener_id,
        urban_farm_spaces (title, address, owner_id)
      `)
      .eq("qr_code_token", token)
      .single();

    if (error || !data) {
      setVerifyResult("invalid");
      setLoading(false);
      return;
    }

    // Get gardener profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", data.gardener_id)
      .single();

    setRequestData({
      id: data.id,
      status: data.status,
      qr_code_token: token,
      space_title: (data.urban_farm_spaces as any)?.title || "",
      space_address: (data.urban_farm_spaces as any)?.address || "",
      gardener_name: profile?.name || "Unknown",
    });

    setVerifyResult(data.status === "approved" ? "valid" : "invalid");
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Verification result view
  if (verifyToken) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="flex items-center gap-2">
              <TreePine className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Urban Farm Share</span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-lg">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {verifyResult === "valid" ? (
                  <CheckCircle2 className="h-20 w-20 text-success" />
                ) : (
                  <XCircle className="h-20 w-20 text-destructive" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {verifyResult === "valid" ? "Valid Access" : "Invalid QR Code"}
              </CardTitle>
              <CardDescription>
                {verifyResult === "valid"
                  ? "This gardener has approved access to the space"
                  : "This QR code is not valid or the request was not approved"}
              </CardDescription>
            </CardHeader>

            {verifyResult === "valid" && requestData && (
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Gardener:</span>
                    <p className="font-medium">{requestData.gardener_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Space:</span>
                    <p className="font-medium">{requestData.space_title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <p className="font-medium">{requestData.space_address}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // QR Code display view (for gardeners)
  if (!requestData) return null;

  const qrUrl = `${window.location.origin}/requests/${id}/qr?token=${requestData.qr_code_token}`;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Urban Farm Share</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard/gardener">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader className="text-center">
            <QrCode className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Access QR Code</CardTitle>
            <CardDescription>
              Show this QR code to the landowner when you arrive
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {requestData.status !== "approved" ? (
              <div className="text-center py-8">
                <Badge variant="secondary" className="mb-4">
                  {requestData.status === "rejected" ? "Rejected" : "Pending"}
                </Badge>
                <p className="text-muted-foreground">
                  {requestData.status === "rejected"
                    ? "Your request was not approved."
                    : "Your request is still pending approval. QR code will be available once approved."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center bg-white p-4 rounded-lg">
                  <QRCode value={qrUrl} size={200} />
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Space:</span>
                    <p className="font-medium">{requestData.space_title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <p className="font-medium">{requestData.space_address}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className="ml-2 bg-success">Approved</Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
