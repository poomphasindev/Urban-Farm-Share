import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "landowner" | "gardener" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: "landowner" | "gardener"
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; role?: UserRole }>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<UserRole>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
        return null;
      }

      if (data) {
        setUserRole(data.role as UserRole);
        return data.role as UserRole;
      }

      setUserRole(null);
      return null;
    } catch (err) {
      console.error("Exception fetching user role:", err);
      setUserRole(null);
      return null;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "landowner" | "gardener"
  ) => {
    try {
      console.log("Starting signup process...");
      const redirectUrl = `${window.location.origin}/`;

      // Step 1: Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
          },
        },
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error("User creation failed - no user returned");
      }

      console.log("User created:", signUpData.user.id);

      // Step 2: Wait a moment for the user to be fully created
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Sign in the user immediately (this ensures they're authenticated)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Auto sign-in error:", signInError);
        // Don't throw here, user can still sign in manually
      } else {
        console.log("User auto-signed in:", signInData.user?.id);
      }

      // Step 4: Insert role (user is now authenticated)
      console.log(`Inserting role "${role}" for user ${signUpData.user.id}`);
      
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ 
          user_id: signUpData.user.id, 
          role: role 
        });

      if (roleError) {
        console.error("Role insertion error:", roleError);
        // Check if it's a duplicate error (user somehow already has a role)
        if (!roleError.message?.includes("duplicate")) {
          throw roleError;
        }
      } else {
        console.log("Role inserted successfully");
      }

      // Step 5: Fetch the role to confirm
      await fetchUserRole(signUpData.user.id);

      return { error: null };
    } catch (error) {
      console.error("SignUp process failed:", error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Starting sign in...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("Sign in failed - no user returned");
      }

      console.log("User signed in:", data.user.id);

      // Fetch role
      const role = await fetchUserRole(data.user.id);
      console.log("User role:", role);

      return { error: null, role };
    } catch (error) {
      console.error("SignIn process failed:", error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  const refreshUserRole = async (): Promise<UserRole> => {
    if (user) {
      return fetchUserRole(user.id);
    }
    setUserRole(null);
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}