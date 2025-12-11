import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  });

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
      .eq("owner_id", user!.id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Space not found or you don't have permission",
        variant: "destructive",
      });
      navigate("/dashboard/landowner");
    } else {
      setForm({
        title: data.title,
        description: data.description || "",
        address: data.address,
        area_size: data.area_size || "",
        tags: data.tags || "",
      });
    }
    setFetching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.address.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and address are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const spaceData = {
      ...form,
      owner_id: user!.id,
    };

    let error;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from("urban_farm_spaces")
        .update(spaceData)
        .eq("id", id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("urban_farm_spaces")
        .insert(spaceData);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} space`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Space ${isEditing ? "updated" : "created"} successfully`,
      });
      navigate("/dashboard/landowner");
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard/landowner">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Space" : "Create New Space"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Sunny Backyard Garden"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your space..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Full address of the space"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_size">Area Size</Label>
                <Input
                  id="area_size"
                  value={form.area_size}
                  onChange={(e) => setForm({ ...form, area_size: e.target.value })}
                  placeholder="e.g., 50 sq.m. or 10x5 meters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g., organic, vegetables, herbs"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditing ? "Update Space" : "Create Space"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard/landowner")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
