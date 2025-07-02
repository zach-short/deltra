/**
 * ProtectedRoute - controls access to routes based on authentication state and user roles
 *
 * handles various authentication scenarios including:
 * - loading states while authentication is being determined
 * - redirecting unauthenticated users away from protected content
 * - redirecting authenticated users away from auth-only routes (login/register)
 * - restricting seller routes to users with appropriate roles (coop or producer)
 *
 * useAuth hook to retrieve authentication state and user role information
 * then conditionally renders appropriate views based on those checks
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - components to render when access is granted
 * @param {string} [props.fallbackMessage="You must be logged in to view this page"] - message to display when access is denied
 * @param {string} [props.title="Unknown Page"] - title of the page for unauthorized view
 * @param {boolean} [props.authRoute=false] - whether this is an auth-only route (login, register, etc.)
 * @param {boolean} [props.useSafeArea=true] - whether to wrap children in SafeAreaView
 * @param {boolean} [props.sellerRoute=false] - whether this route requires seller privileges
 */

import { ActivityIndicator } from "react-native";
import { UserRole } from "@/models";
import { Link, router } from "expo-router";
import { useAuth } from "@/context";
import { NoSellerListings, NoSellerStore } from "../fallbacks";
import { SafeAreaView, View, Pressable, Text } from "@/components";

export function ProtectedRoute({
  children,
  fallbackMessage = "You must be logged in to view this page",
  title = "Unknown Page",
  authRoute = false,
  useSafeArea = true,
  sellerRoute = false,
  sellerRouteType = "store",
}: {
  children: React.ReactNode;
  fallbackMessage?: string;
  title?: string;
  authRoute?: boolean;
  useSafeArea?: boolean;
  sellerRoute?: boolean;
  sellerRouteType?: "store" | "listing";
}) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="small" color="#cde9bb" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated && !authRoute) {
    return <UnauthorizedView title={title} fallbackMessage={fallbackMessage} />;
  }

  if (isAuthenticated && authRoute) {
    return <AuthRoute />;
  }

  if (sellerRoute && role !== UserRole.COOP && role !== UserRole.PRODUCER) {
    return (
      <SafeAreaView className={`flex-1 bg-white pt-32`}>
        {sellerRouteType === "store" && <NoSellerStore />}
        {sellerRouteType === "listing" && <NoSellerListings />}
      </SafeAreaView>
    );
  }

  return useSafeArea ? (
    <SafeAreaView className="flex-1 bg-white">{children}</SafeAreaView>
  ) : (
    <View className={`flex-1`}>{children}</View>
  );
}

function UnauthorizedView({
  title,
  fallbackMessage,
}: {
  title: string;
  fallbackMessage: string;
}) {
  return (
    <SafeAreaView className={`flex-1 bg-white w-full`}>
      <View className="px-8 pt-16">
        <Text className={`text-4xl`}>{title}</Text>
        <View className="py-20">
          <Text font="outfitRegular" className="text-2xl">
            You are not logged in
          </Text>
          <Text font="outfitLight" className="mb-6">
            {fallbackMessage}
          </Text>
          <Pressable
            onPress={() => router.push("/auth")}
            className="bg-green-800/90 p-5 w-64 rounded"
            textProps={{ className: "text-2xl !text-white text-center" }}
          >
            Log in
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            className="py-5 w-64 "
            textProps={{ className: "underline text-base" }}
          >
            Maybe Later
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AuthRoute() {
  return (
    <SafeAreaView className={`flex-1 bg-white`}>
      <View className="px-8 pt-16">
        <View className="py-20">
          <Text font="outfitRegular" className="text-2xl">
            You are logged in
          </Text>
          <Text font="outfitLight" className="mb-6">
            You must be logged out to view this page
          </Text>
          <Pressable
            onPress={() => {
              router.push("/account");
            }}
            className="border p-3 rounded-lg bg-green-900 w-32 mt-12 py-5"
          >
            <Text className="text-2xl text-white text-center">Back</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
