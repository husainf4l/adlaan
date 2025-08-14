import { langGraphService } from "../services/langGraphService";

// Test function to verify LangGraph integration
export async function testLangGraphIntegration() {
  console.log("🧪 Testing LangGraph Integration...");

  // Test 1: Check server connectivity
  console.log("1. Testing server connectivity...");
  const isConnected = await langGraphService.testConnection();
  console.log(`   Server connected: ${isConnected ? "✅" : "❌"}`);

  if (!isConnected) {
    console.log("❌ Server not available. Please ensure your LangGraph server is running on http://localhost:8000");
    return;
  }

  // Test 2: Test streaming functionality
  console.log("2. Testing streaming functionality...");
  
  const testMessage = "تحليل هذا العقد";
  const testContract = `
عقد تقديم خدمات تطوير مواقع الويب

بين الطرف الأول: شركة أدلان للتقنية
والطرف الثاني: العميل

البند الأول: تلتزم شركة أدلان بتطوير الموقع خلال 30 يوم
البند الثاني: يلتزم العميل بدفع مبلغ 10000 ريال
البند الثالث: يتم الدفع على دفعتين
  `;

  try {
    let messageStarted = false;
    let totalChunks = 0;
    let errors: string[] = [];

    await langGraphService.streamChatResponse(
      testMessage,
      testContract,
      "test-contract-123",
      {
        onMessageStart: (message) => {
          console.log("   📝 Message started:", message.id);
          messageStarted = true;
        },
        onMessageChunk: (message) => {
          totalChunks++;
          console.log(`   📦 Chunk ${totalChunks}:`, message.content.slice(0, 50) + "...");
          console.log(`   🎯 Intent: ${message.intent}, Action: ${message.action}`);
          
          if (message.metadata?.contract_sections?.length) {
            console.log(`   📍 Sections: ${message.metadata.contract_sections.join(", ")}`);
          }
        },
        onMessageComplete: (message) => {
          console.log("   ✅ Message completed");
          console.log(`   📊 Final confidence: ${message.metadata?.confidence_score}`);
          
          if (message.ui_elements?.quick_actions?.length) {
            console.log(`   🎮 Quick actions: ${message.ui_elements.quick_actions.map(a => a.label).join(", ")}`);
          }
        },
        onError: (error) => {
          errors.push(error.message);
          console.log("   ❌ Error:", error.message);
        },
        signal: new AbortController().signal
      }
    );

    // Results summary
    console.log("\n📋 Test Results Summary:");
    console.log(`   Message started: ${messageStarted ? "✅" : "❌"}`);
    console.log(`   Chunks received: ${totalChunks}`);
    console.log(`   Errors: ${errors.length > 0 ? "❌ " + errors.join(", ") : "✅ None"}`);

    if (messageStarted && totalChunks > 0) {
      console.log("🎉 LangGraph integration working successfully!");
    } else {
      console.log("⚠️  Integration has issues. Check your server setup.");
    }

  } catch (error) {
    console.log("❌ Streaming test failed:", error);
  }
}

// Usage in browser console:
// import { testLangGraphIntegration } from './path/to/this/file';
// testLangGraphIntegration();
