// Debug tool to check Google OAuth configuration
export const checkGoogleOAuthConfig = () => {
  const currentDomain = window.location.origin;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "535659420325-0modn8rtl2g7068qnpb8kt5ithk9i148.apps.googleusercontent.com";
  
  console.log("🔍 Google OAuth Configuration Check");
  console.log("=====================================");
  console.log("🌐 Current Domain:", currentDomain);
  console.log("🔑 Client ID:", clientId);
  console.log("📍 Protocol:", window.location.protocol);
  console.log("🏠 Host:", window.location.host);
  console.log("📂 Port:", window.location.port);
  
  console.log("\n✅ Required Google Cloud Console Settings:");
  console.log("==========================================");
  console.log("Add these domains to 'Authorized JavaScript origins':");
  console.log("• " + currentDomain);
  console.log("• http://localhost:3000");
  console.log("• http://localhost:3001");
  console.log("• http://127.0.0.1:3000");
  console.log("• http://127.0.0.1:3001");
  
  console.log("\n🔗 Google Cloud Console URL:");
  console.log("https://console.cloud.google.com/apis/credentials");
  
  return {
    currentDomain,
    clientId,
    protocol: window.location.protocol,
    host: window.location.host,
    port: window.location.port
  };
};
