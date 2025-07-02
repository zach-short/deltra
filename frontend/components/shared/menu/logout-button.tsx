import { Pressable } from "@/components";
import { useAuth } from "@/context";

export function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Pressable
      onPress={logout}
      textProps={{ className: "text-start mt-10 underline text-xl" }}
    >
      Log out
    </Pressable>
  );
}
