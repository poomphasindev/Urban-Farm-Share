import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TreePine, ArrowLeft, MapPin, Ruler, User, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Space {
  id: string;
  title: string;
  description: string;
  address: string;
  area_size: string;
  tags: string | null;
  created_at: string;
  owner_id: string;
  owner_profile: {
    name: string;
    location: string | null;
  } | null;
}

export default function SpaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  useEffect(() => {
    fetchSpace();
    if (user && userRole === "gardener") {
      checkExistingRequest();
    }
  }, [id, user]);

  const fetchSpace = async () => {
    const { data, error } = await supabase
      .from("urban_farm_spaces")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Space not found",
        variant: "destructive",
      });
      navigate("/dashboard/gardener");
      return;
    }

    // Fetch owner profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, location")
      .eq("id", data.owner_id)
      .single();

    setSpace({
      ...data,
      owner_profile: profile,
    });
    setLoading(false);
  };

  const checkExistingRequest = async () => {
    const { data } = await supabase
      .from("space_requests")
      .select("*")
      .eq("space_id", id)
      .eq("gardener_id", user!.id)
      .maybeSingle();

    setExistingRequest(data);
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("space_requests")
      .insert({
        space_id: id,
        gardener_id: user.id,
        message: requestMessage.trim() || null,
      });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Request submitted successfully!",
      });
      checkExistingRequest();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!space) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Urban Farm Share</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard/gardener">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{space.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{space.description}</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{space.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-medium">{space.area_size || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="font-medium">{space.owner_profile?.name || "Anonymous"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Listed</p>
                      <p className="font-medium">
                        {new Date(space.created_at).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>
                </div>

                {space.tags && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {space.tags.split(",").map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Request Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Request This Space</CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Sign in to request this space
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </div>
                ) : existingRequest ? (
                  <div className="text-center">
                    <Badge
                      className={
                        existingRequest.status === "approved"
                          ? "bg-success mb-4"
                          : existingRequest.status === "rejected"
                          ? "bg-destructive mb-4"
                          : "mb-4"
                      }
                    >
                      {existingRequest.status === "approved"
                        ? "Approved"
                        : existingRequest.status === "rejected"
                        ? "Rejected"
                        : "Pending"}
                    </Badge>
                    <p className="text-muted-foreground mb-4">
                      {existingRequest.status === "approved"
                        ? "Your request has been approved!"
                        : existingRequest.status === "rejected"
                        ? "Your request was rejected."
                        : "Your request is being reviewed."}
                    </p>
                    {existingRequest.status === "approved" && (
                      <div className="space-y-2">
                        <Button asChild className="w-full">
                          <Link to={`/requests/${existingRequest.id}/chat`}>
                            Open Chat
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <Link to={`/requests/${existingRequest.id}/qr`}>
                            View QR Code
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : userRole === "gardener" ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Introduce yourself and tell the owner why you'd like to use this space..."
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={4}
                    />
                    <Button
                      className="w-full"
                      onClick={handleSubmitRequest}
                      disabled={submitting}
                    >
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Send Request
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    Only gardeners can request spaces
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
