import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TreePine, Search, MapPin, Calendar, MessageSquare, QrCode, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UrbanFarmSpace {
  id: string;
  title: string;
  description: string;
  address: string;
  area_size: string;
  tags: string | null;
  profiles: {
    name: string;
    location: string | null;
  } | null;
}

interface SpaceRequest {
  id: string;
  status: string;
  created_at: string;
  qr_code_token: string | null;
  urban_farm_spaces: {
    title: string;
    address: string;
  } | null;
}

export default function GardenerDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");

  // Browse spaces
  const [spaces, setSpaces] = useState<UrbanFarmSpace[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // My requests
  const [requests, setRequests] = useState<SpaceRequest[]>([]);

  useEffect(() => {
    if (user) {
      fetchSpaces();
      fetchMyRequests();
    }
  }, [user]);

  const fetchSpaces = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("urban_farm_spaces")
      .select("*, owner_id")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchSpaces error:", error);
      toast({
        title: "Error",
        description: `Failed to load spaces: ${error.message}`,
        variant: "destructive",
      });
    } else if (data) {
      const spacesWithProfiles = await Promise.all(
        data.map(async (space: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, location")
            .eq("id", space.owner_id)
            .single();

          return {
            ...space,
            profiles: profile || null,
          };
        })
      );
      setSpaces(spacesWithProfiles);
    }

    setLoading(false);
  };

  const fetchMyRequests = async () => {
    const { data, error } = await supabase
      .from("space_requests")
      .select(`
        *,
        urban_farm_spaces (title, address)
      `)
      .eq("gardener_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchMyRequests error:", error);
      toast({
        title: "Error",
        description: `Failed to load your requests: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setRequests((data || []) as SpaceRequest[]);
    }
  };

  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch = !searchTerm ||
      space.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.tags?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = !locationFilter ||
      space.address.toLowerCase().includes(locationFilter.toLowerCase()) ||
      space.profiles?.location?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Urban Farm Share</span>
          </Link>
          <Button variant="ghost" onClick={signOut}>
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gardener Dashboard</h1>
          <p className="text-muted-foreground">
            Find your perfect urban farming space
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="browse">Browse Spaces</TabsTrigger>
            <TabsTrigger value="requests">
              My Requests
              {requests.filter(r => r.status === "approved").length > 0 && (
                <Badge className="ml-2" variant="default">
                  {requests.filter(r => r.status === "approved").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Browse Spaces Tab */}
          <TabsContent value="browse">
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative sm:w-64">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Spaces Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading available spaces...</p>
              </div>
            ) : filteredSpaces.length === 0 ? (
              <Card className="p-12 text-center">
                <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No spaces found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpaces.map((space) => (
                  <Card key={space.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{space.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {space.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {space.description}
                      </p>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Size:</span>
                          <span className="text-muted-foreground">{space.area_size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Owner:</span>
                          <span className="text-muted-foreground">{space.profiles?.name}</span>
                        </div>
                      </div>

                      {space.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {space.tags.split(",").map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button asChild className="w-full">
                        <Link to={`/spaces/${space.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="requests">
            {requests.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No requests yet</h3>
                <p className="text-muted-foreground mb-6">
                  Browse available spaces and send your first request
                </p>
                <Button onClick={() => setActiveTab("browse")}>
                  Browse Spaces
                </Button>
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
                      <div className="flex gap-2">
                        {request.status === "approved" && (
                          <>
                            <Button asChild variant="default">
                              <Link to={`/requests/${request.id}/chat`}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                              </Link>
                            </Button>
                            <Button asChild variant="outline">
                              <Link to={`/requests/${request.id}/qr`}>
                                <QrCode className="h-4 w-4 mr-2" />
                                QR Code
                              </Link>
                            </Button>
                          </>
                        )}
                        {request.status === "pending" && (
                          <Button asChild variant="outline">
                            <Link to={`/requests/${request.id}/chat`}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              View Request
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
