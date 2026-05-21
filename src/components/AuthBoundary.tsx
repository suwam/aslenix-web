import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";

type AuthBoundaryProps = {
  children: JSX.Element;
};

export const AuthBoundary = ({ children }: AuthBoundaryProps) => (
  <AuthProvider>{children}</AuthProvider>
);

export const ProtectedAuthBoundary = ({ children }: AuthBoundaryProps) => (
  <AuthProvider>
    <ProtectedRoute>{children}</ProtectedRoute>
  </AuthProvider>
);
