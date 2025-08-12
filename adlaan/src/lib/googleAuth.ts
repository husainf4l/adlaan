// Google Sign-In utility for centralized authentication handling
// Best practices implementation to prevent AbortError and conflicts

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            error_callback?: (error: unknown) => void;
          }) => void;
          prompt: (callback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
          }) => void) => void;
          renderButton: (
            element: HTMLElement | null,
            config: {
              theme?: string;
              size?: string;
              width?: number;
            }
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export interface GoogleSignInConfig {
  clientId: string;
  onSuccess: (response: { credential: string }) => void;
  onError: (error: string) => void;
}

// Helper function to validate and provide clear setup instructions
export const validateGoogleSignInSetup = (clientId: string): { isValid: boolean; message: string } => {
  if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
    return {
      isValid: false,
      message: `Google Client ID not configured. Please follow these steps:
      
1. Go to Google Cloud Console (https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google Sign-In API
4. Create OAuth 2.0 credentials for your domain
5. Add your Client ID to environment variables
6. Add your domain to authorized origins

Current domain: ${window.location.origin}`
    };
  }

  // Basic format validation
  if (!clientId.includes('.googleusercontent.com')) {
    return {
      isValid: false,
      message: "Invalid Google Client ID format. It should end with '.googleusercontent.com'"
    };
  }

  return { isValid: true, message: "Google Client ID appears valid" };
};

// Singleton state management
class GoogleSignInManager {
  private isInitialized = false;
  private isPromptActive = false;
  private currentClientId: string | null = null;
  private abortController: AbortController | null = null;
  private initializationPromise: Promise<boolean> | null = null;

  // Initialize Google Sign-In with proper error handling
  async initialize(config: GoogleSignInConfig): Promise<boolean> {
    // Validate client ID with detailed feedback
    const validation = validateGoogleSignInSetup(config.clientId);
    if (!validation.isValid) {
      console.error("Google Sign-In Setup Error:", validation.message);
      config.onError(validation.message);
      return false;
    }

    console.log("✅ Google Client ID validation passed");
    console.log("🌐 Current domain:", window.location.origin);
    console.log("🔑 Using Client ID:", config.clientId);

    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization(config);
    const result = await this.initializationPromise;
    this.initializationPromise = null;
    return result;
  }

  private async _performInitialization(config: GoogleSignInConfig): Promise<boolean> {
    try {
      // Wait for Google SDK to be available
      if (!window.google?.accounts) {
        await this._waitForGoogleSDK();
      }

      if (!window.google?.accounts) {
        config.onError("Google Sign-In SDK failed to load");
        return false;
      }

      // Clean up any existing state
      this._cleanup();

      // Create new abort controller for this session
      this.abortController = new AbortController();

      // Initialize with proper error boundaries
      window.google.accounts.id.initialize({
        client_id: config.clientId,
        callback: (response) => {
          this._handleSuccess(response, config.onSuccess);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        // Add error handling for network issues
        error_callback: (error: unknown) => {
          console.error("🚨 Google Sign-In error callback:", error);
          console.error("🌐 Current domain:", window.location.origin);
          console.error("🔑 Client ID being used:", config.clientId);
          
          this.isPromptActive = false;
          
          const googleError = error as { type?: string; error?: string };
          
          if (googleError?.type === "network_error" || googleError?.error === "network_error") {
            const errorMessage = `❌ Network Error: Cannot retrieve Google token.

🔧 SOLUTION STEPS:

1. 🌐 DOMAIN AUTHORIZATION:
   Go to Google Cloud Console: https://console.cloud.google.com/
   → APIs & Services → Credentials  
   → Find OAuth 2.0 Client ID: ${config.clientId}
   → Click EDIT → Add to "Authorized JavaScript origins":
   
   ✅ ${window.location.origin}
   ✅ http://localhost:3000
   ✅ http://localhost:3001

2. 🔒 ENABLE FEDCM IN BROWSER:
   → Click the lock/warning icon next to the URL
   → Allow "Third-party sign-in" or "FedCM"
   → Or visit: chrome://settings/content/federatedIdentityApi
   → Add ${window.location.origin} to allowed sites

3. 🧹 CLEAR BROWSER CACHE:
   → Hard refresh (Ctrl+Shift+R)
   → Or clear browser data for this site

⚠️ Changes may take 5-10 minutes to take effect.

Current domain: ${window.location.origin}
Client ID: ${config.clientId}`;

            config.onError(errorMessage);
          } else if (googleError?.error === "invalid_client") {
            config.onError(`❌ Invalid Client ID: Please verify your Google Client ID (${config.clientId}) is correct in Google Cloud Console.`);
          } else if (googleError?.error === "access_denied") {
            config.onError("❌ Access denied: User cancelled the sign-in process.");
          } else {
            config.onError(`❌ Google Sign-In error: ${googleError?.error || googleError?.type || "Unknown error"}. Please try again.`);
          }
        }
      });

      this.isInitialized = true;
      this.currentClientId = config.clientId;
      console.log("Google Sign-In initialized successfully");
      return true;

    } catch (error) {
      console.error("Google Sign-In initialization failed:", error);
      config.onError("Failed to initialize Google Sign-In");
      this._resetState();
      return false;
    }
  }

  // Trigger sign-in with proper state management
  async triggerSignIn(config: GoogleSignInConfig): Promise<void> {
    // Prevent multiple simultaneous prompts
    if (this.isPromptActive) {
      console.log("Google Sign-In prompt already active");
      return;
    }

    // Check if re-initialization is needed
    if (!this.isInitialized || this.currentClientId !== config.clientId) {
      const initialized = await this.initialize(config);
      if (!initialized) return;
    }

    this.isPromptActive = true;

    try {
      // Use requestAnimationFrame to ensure DOM is ready
      await new Promise(resolve => requestAnimationFrame(resolve));

      if (this.abortController?.signal.aborted) {
        throw new Error("Operation was cancelled");
      }

      // Show prompt with proper error handling
      window.google?.accounts.id.prompt((notification) => {
        this.isPromptActive = false;
        
        if (notification?.isNotDisplayed()) {
          console.log("Google Sign-In prompt was not displayed");
          config.onError("Google Sign-In prompt could not be displayed");
        } else if (notification?.isSkippedMoment()) {
          console.log("Google Sign-In prompt was skipped");
          // This is not an error, user just dismissed
        }
      });

    } catch (error) {
      this.isPromptActive = false;
      console.error("Error showing Google Sign-In prompt:", error);
      
      if (error instanceof Error && error.message.includes("aborted")) {
        config.onError("Sign-in was cancelled");
      } else {
        config.onError("Failed to show Google Sign-In prompt");
      }
    }
  }

  // Handle successful authentication
  private _handleSuccess(response: { credential: string }, onSuccess: (response: { credential: string }) => void): void {
    this.isPromptActive = false;
    try {
      onSuccess(response);
    } catch (error) {
      console.error("Error in success callback:", error);
    }
  }

  // Wait for Google SDK to load
  private _waitForGoogleSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      
      const checkGoogleSDK = () => {
        attempts++;
        
        if (window.google?.accounts) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error("Google SDK failed to load within timeout"));
        } else {
          setTimeout(checkGoogleSDK, 100);
        }
      };
      
      checkGoogleSDK();
    });
  }

  // Clean up existing state
  private _cleanup(): void {
    try {
      if (this.isPromptActive && window.google?.accounts) {
        window.google.accounts.id.cancel();
      }
    } catch {
      // Ignore cleanup errors
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.isPromptActive = false;
  }

  // Reset all state
  private _resetState(): void {
    this._cleanup();
    this.isInitialized = false;
    this.currentClientId = null;
    this.initializationPromise = null;
  }

  // Public cleanup method
  cleanup(): void {
    this._resetState();
  }

  // Cancel active sign-in
  cancel(): void {
    this._cleanup();
  }
}

// Singleton instance
const googleSignInManager = new GoogleSignInManager();

// Public API
export const triggerGoogleSignIn = async (config: GoogleSignInConfig): Promise<void> => {
  return googleSignInManager.triggerSignIn(config);
};

export const cancelGoogleSignIn = (): void => {
  googleSignInManager.cancel();
};

export const resetGoogleSignIn = (): void => {
  googleSignInManager.cleanup();
};

// Legacy compatibility
export const initializeGoogleSignIn = async (config: GoogleSignInConfig): Promise<boolean> => {
  return googleSignInManager.initialize(config);
};
