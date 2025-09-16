// ASH AI Authentication Package
// Comprehensive authentication and authorization utilities

// Main exports
export * from "./config";
export * from "./types";
export * from "./utils";
export * from "./middleware";
export * from "./hooks";
export * from "./components";

// Re-export NextAuth for convenience
export { getServerSession } from "next-auth";
export { signIn, signOut, useSession } from "next-auth/react";

// Default configuration
export { authOptions } from "./config";