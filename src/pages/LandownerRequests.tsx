import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreePine, ArrowLeft, Check, X, MessageSquare, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Request {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  gardener_id: string;
  gardener_profile: {
    name: string;
  } | null;
  urban_farm_spaces: {
    title: string;
    address: string;
  } | null;
}

export default function LandownerRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    const { data: spaces } = await supabase
      .from("urban_farm_spaces")
      .select("id")
      .eq("owner_id", user!.id);

    if (!spaces || spaces.length === 0) {
      setLoading(false);
      return;
    }

    const spaceIds = spaces.map(s => s.id);

    const { data, error } = await supabase
      .from("space_requests")
      .select(`
        *,
        urban_farm_spaces (title, address)
      `)
      .in("space_id", spaceIds)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive",
      });
    } else {
      // Fetch gardener profiles separately
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (req: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", req.gardener_id)
            .single();

          return {
            ...req,
            gardener_profile: profile,
          };
        })
      );
      setRequests(requestsWithProfiles);
    }

    setLoading(false);
  };

  const handleUpdateStatus = async (requestId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("space_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Request ${status}`,
      });
      fetchRequests();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

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

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard/landowner">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-8">Space Requests</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No requests yet</h3>
            <p className="text-muted-foreground">
              When gardeners request to use your spaces, they will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {request.urban_farm_spaces?.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {request.urban_farm_spaces?.address}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Requested by: </span>
                      <span className="text-muted-foreground">
                        {request.gardener_profile?.name || "Unknown"}
                      </span>
                    </div>

                    {request.message && (
                      <div>
                        <span className="font-medium">Message: </span>
                        <span className="text-muted-foreground">{request.message}</span>
                      </div>
                    )}

                    <div>
                      <span className="font-medium">Date: </span>
                      <span className="text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString("th-TH")}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleUpdateStatus(request.id, "approved")}
                            className="bg-success hover:bg-success/90"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleUpdateStatus(request.id, "rejected")}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {request.status !== "rejected" && (
                        <Button variant="outline" asChild>
                          <Link to={`/requests/${request.id}/chat`}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
