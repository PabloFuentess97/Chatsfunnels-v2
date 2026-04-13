import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/funnels/:path*",
    "/analytics/:path*",
    "/groups/:path*",
    "/rounds/:path*",
    "/credits/:path*",
    "/domains/:path*",
    "/settings/:path*",
    "/ranking/:path*",
  ],
};
