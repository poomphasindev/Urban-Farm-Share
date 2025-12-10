import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreePine, Plus, MapPin, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface UrbanFarmSpace {
  id: string;
  title: string;
  description: string;
  address: string;
  area_size: string;
  tags: string | null;
  is_active: boolean;
  created_at: string;
}

export default function LandownerDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<UrbanFarmSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      fetchSpaces();
    }
  }, [user]);

  const fetchSpaces = async () => {
    setLoading(true);

    const { data: spacesData, error: spacesError } = await supabase
      .from("urban_farm_spaces")
      .select("*")
      .eq("owner_id", user!.id)
      .order("created_at", { ascending: false });

    if (spacesError) {
      toast({
        title: "Error",
        description: "Failed to load your spaces",
        variant: "destructive",
      });
    } else if (spacesData) {
      setSpaces(spacesData as UrbanFarmSpace[]);

      const counts: Record<string, number> = {};
      for (const space of spacesData) {
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

  const handleDelete = async (spaceId: string) => {
    if (!confirm("Are you sure you want to delete this space?")) {
      return;
    }

    const { error } = await supabase
      .from("urban_farm_spaces")
      .delete()
      .eq("id", spaceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete space",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Space deleted successfully",
      });
      fetchSpaces();
    }
  };

  const handleToggleActive = async (spaceId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("urban_farm_spaces")
      .update({ is_active: !currentStatus })
      .eq("id", spaceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update space status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Space ${!currentStatus ? "activated" : "deactivated"}`,
      });
      fetchSpaces();
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Urban Farm Share</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard/landowner/requests">Requests</Link>
            </Button>
            <Button variant="ghost" onClick={signOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Landowner Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your spaces and connect with gardeners
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{spaces.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Spaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {spaces.filter((s) => s.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {Object.values(requestCounts).reduce((a, b) => a + b, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Spaces</h2>
          <Button asChild>
            <Link to="/dashboard/landowner/spaces/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Space
            </Link>
          </Button>
        </div>

        {/* Spaces List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your spaces...</p>
          </div>
        ) : spaces.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No spaces yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first space listing to start sharing with gardeners
            </p>
            <Button asChild>
              <Link to="/dashboard/landowner/spaces/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Space
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <Card key={space.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{space.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {space.address}
                      </CardDescription>
                    </div>
                    <Badge variant={space.is_active ? "default" : "secondary"}>
                      {space.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {space.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="font-medium">Size:</span> {space.area_size}
                  </div>

                  {requestCounts[space.id] > 0 && (
                    <Alert className="mb-4">
                      <AlertDescription>
                        {requestCounts[space.id]} pending request(s)
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleToggleActive(space.id, space.is_active)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {space.is_active ? "Hide" : "Show"}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/dashboard/landowner/spaces/${space.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(space.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
