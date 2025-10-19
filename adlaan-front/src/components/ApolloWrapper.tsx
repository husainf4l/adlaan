"use client";

import { ApolloProvider } from "@apollo/client/react";
import { makeClient } from "../lib/apollo-client";
import { useMemo } from "react";

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => makeClient(), []);

  // Only render on client side to avoid SSR issues
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}