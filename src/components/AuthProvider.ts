import React, { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, type AppRole, type RiskProfile } from "@/lib/auth-context";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [quizCompleted, setQuizCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserData(currentSession.user.id);
          }, 0);
        } else {
          setRole(null);
          setRiskProfile(null);
          setQuizCompleted(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchUserData(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Check if role exists
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .limit(1);

      if (roles && roles.length > 0) {
        console.log("✅ Rôle chargé:", roles[0].role);
        setRole(roles[0].role as AppRole);
      } else {
        console.log("⚠️ Aucun rôle trouvé dans user_roles, vérification des métadonnées...");
        // Role not found — try to provision from user metadata (post email-confirm)
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const meta = currentUser?.user_metadata;
        if (meta?.role) {
          console.log("✅ Rôle trouvé dans métadonnées:", meta.role);
          // Insert profile
          if (meta.full_name) {
            await supabase.from("profiles").upsert({
              user_id: userId,
              full_name: meta.full_name,
            }, { onConflict: "user_id" });
          }
          // Insert role
          const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: userId,
            role: meta.role,
          });
          if (!roleError) {
            setRole(meta.role as AppRole);
          } else {
            console.error("❌ Erreur lors de l'insertion du rôle:", roleError);
            setRole(null);
          }
        } else {
          console.error("❌ Aucun rôle trouvé dans les métadonnées utilisateur");
          setRole(null);
        }
      }

      // Check investor profile
      const { data: investorProfile } = await supabase
        .from("investor_profiles")
        .select("risk_profile")
        .eq("user_id", userId)
        .limit(1);

      if (investorProfile && investorProfile.length > 0) {
        setRiskProfile(investorProfile[0].risk_profile as RiskProfile);
        setQuizCompleted(true);
      } else {
        setQuizCompleted(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, selectedRole: AppRole) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, role: selectedRole },
      },
    });

    if (error) return { error };

    // Try to insert profile & role immediately (works if auto-confirm is on)
    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: fullName,
      }).then(() => {});

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: selectedRole,
      });

      if (!roleError) {
        setRole(selectedRole);
      }
      // If role insert failed (email not confirmed yet), it will be created on first login via fetchUserData
    }

    return { error: null, user: data.user };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setRiskProfile(null);
    setQuizCompleted(null);
  };

  const saveQuizResult = async (profile: RiskProfile, answers: number[], score: number) => {
    if (!user) return;

    const { error } = await supabase.from("investor_profiles").insert({
      user_id: user.id,
      risk_profile: profile,
      quiz_answers: answers,
      quiz_score: score,
    });

    if (!error) {
      setRiskProfile(profile);
      setQuizCompleted(true);
    }

    return { error };
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        session,
        loading,
        role,
        riskProfile,
        quizCompleted,
        signUp,
        signIn,
        signOut,
        saveQuizResult,
      },
    },
    children
  );
};
