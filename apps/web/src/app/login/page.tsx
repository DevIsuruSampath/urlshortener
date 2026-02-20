import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { adminMe } from "@/lib/api";

// Function to derive admin domain from auth domain
function getAdminDomain(): string {
  const authDomain = process.env.AUTH_DOMAIN || 'auth.localhost:3000';
  const adminDomain = process.env.ADMIN_DOMAIN || 'admin.localhost:3000';
  
  // If using example domains in production
  if (authDomain.includes('example.com') && !adminDomain.includes('localhost')) {
    return adminDomain;
  }
  
  // Convert auth.domain to admin.domain
  if (authDomain.startsWith('auth.')) {
    return `admin.${authDomain.substring(5)}`;
  }
  
  return adminDomain;
}

export default async function AdminLoginPage() {
  // Check if user is already logged in
  try {
    await adminMe();
    // User is authenticated, redirect to admin dashboard
    const adminDomain = getAdminDomain();
    const protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'http:';
    redirect(`${protocol}//${adminDomain}`);
  } catch (error) {
    // Not authenticated, show login form
    return (
      <main className="container auth-shell">
        <AuthForm />
      </main>
    );
  }
}
