import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreePine, ArrowLeft, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  sender_id: string;
  created_at: string;
  sender_profile?: {
    name: string;
  } | null;
}

interface RequestInfo {
  id: string;
  status: string;
  space_title: string;
  gardener_id: string;
  owner_id: string;
}

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [requestInfo, setRequestInfo] = useState<RequestInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequestInfo();
      fetchMessages();
      subscribeToMessages();
    }
  }, [id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchRequestInfo = async () => {
    const { data, error } = await supabase
      .from("space_requests")
      .select(`
        id,
        status,
        gardener_id,
        urban_farm_spaces (title, owner_id)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Request not found",
        variant: "destructive",
      });
      navigate(userRole === "landowner" ? "/dashboard/landowner" : "/dashboard/gardener");
      return;
    }

    const info: RequestInfo = {
      id: data.id,
      status: data.status,
      space_title: (data.urban_farm_spaces as any)?.title || "",
      gardener_id: data.gardener_id,
      owner_id: (data.urban_farm_spaces as any)?.owner_id || "",
    };

    // Check permission
    if (user!.id !== info.gardener_id && user!.id !== info.owner_id) {
      toast({
        title: "Error",
        description: "You don't have permission to view this chat",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setRequestInfo(info);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("request_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      // Fetch sender profiles
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", msg.sender_id)
            .single();

          return {
            ...msg,
            sender_profile: profile,
          };
        })
      );
      setMessages(messagesWithProfiles);
    }
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `request_id=eq.${id}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Fetch sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", newMsg.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newMsg, sender_profile: profile },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);

    const { error } = await supabase.from("chat_messages").insert({
      request_id: id,
      sender_id: user!.id,
      message: newMessage.trim(),
    });

    setSending(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      setNewMessage("");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Urban Farm Share</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 flex-1 flex flex-col max-w-3xl">
        <Button variant="ghost" asChild className="w-fit mb-4">
          <Link to={userRole === "landowner" ? "/dashboard/landowner/requests" : "/dashboard/gardener"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{requestInfo?.space_title}</CardTitle>
              {requestInfo && getStatusBadge(requestInfo.status)}
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-xs opacity-70 mb-1">
                            {msg.sender_profile?.name || "Unknown"}
                          </p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
