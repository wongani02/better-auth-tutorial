"use client";

import { LoadingButton } from "@/components/loading-button";
import { revokeSessions } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutEverywhereButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogoutEverywhere() {
    setLoading(true);

    const { error } =  await revokeSessions();

    if (error) {
      setLoading(false);
      toast.error(error.message || "Something went wrong");
      return;
    } else{
      router.refresh();
      toast.success("Logged out from all devices successfully");
    }
  }

  return (
    <LoadingButton
      variant="destructive"
      onClick={handleLogoutEverywhere}
      loading={loading}
      className="w-full"
    >
      Log out everywhere
    </LoadingButton>
  );
}
