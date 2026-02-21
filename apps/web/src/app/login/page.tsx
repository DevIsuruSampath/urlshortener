import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/LoginForm";
import { SetupForm } from "@/components/forms/SetupForm";
import { adminMe, adminStatus } from "@/lib/api";

export default async function LoginPage() {
  // Check if user is already logged in
  try {
    await adminMe();
    // User is authenticated, redirect to admin dashboard
    redirect('/');
  } catch (error) {
    // Not authenticated, check if admin is initialized
    try {
      const status = await adminStatus();
      
      if (!status.initialized) {
        // Admin not initialized, show setup form
        return (
          <main className="container auth-shell">
            <div style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "var(--space-6)" }}>
              <SetupForm />
            </div>
          </main>
        );
      }
      
      // Admin is initialized, show login form
      return (
        <main className="container auth-shell">
          <div style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "var(--space-6)" }}>
            <LoginForm />
          </div>
        </main>
      );
    } catch (statusError) {
      // Could not check status, show login form as fallback
      console.error("Failed to check admin status:", statusError);
      return (
        <main className="container auth-shell">
          <div style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "var(--space-6)" }}>
            <LoginForm />
          </div>
        </main>
      );
    }
  }
}
