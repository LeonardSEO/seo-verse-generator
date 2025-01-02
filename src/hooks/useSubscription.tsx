import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { level: "free" };

      const { data, error } = await supabase
        .from("customers")
        .select("subscription_level")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        return { level: "free" };
      }

      return { level: data?.subscription_level || "free" };
    },
  });
};