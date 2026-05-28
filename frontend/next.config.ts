import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    // /api/auth/* è gestito internamente da NextAuth — NON proxare
    return [
      { source: "/api/health",               destination: `${BACKEND_URL}/api/health` },
      { source: "/api/ready",                destination: `${BACKEND_URL}/api/ready` },
      { source: "/api/users/:path*",         destination: `${BACKEND_URL}/api/users/:path*` },
      // Esponi anche il login/register del backend direttamente (usato da NextAuth lato server)
      { source: "/api/auth/login",           destination: `${BACKEND_URL}/api/auth/login` },
      { source: "/api/auth/register",        destination: `${BACKEND_URL}/api/auth/register` },
      { source: "/api/docs",                 destination: `${BACKEND_URL}/api/docs` },
      { source: "/api/redoc",                destination: `${BACKEND_URL}/api/redoc` },
      { source: "/api/openapi.json",         destination: `${BACKEND_URL}/api/openapi.json` },
    ];
  },
};

export default nextConfig;
