import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginRequest, fetchMe } from "@/lib/api";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { access_token } = await loginRequest(
            credentials.email as string,
            credentials.password as string
          );

          const user = await fetchMe(access_token);

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            accessToken: access_token,
          };
        } catch (err) {
          console.error("[auth] authorize() error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
});
