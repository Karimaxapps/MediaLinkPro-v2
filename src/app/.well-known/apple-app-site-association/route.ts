import { NextResponse } from "next/server";

// Apple App Site Association — enables iOS Universal Links for /scan/* deep links.
// Served at /.well-known/apple-app-site-association with NO file extension and
// Content-Type: application/json (Apple requirement).
const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "SFUD4L8HYM.com.medialinkpro.mobile",
        paths: ["/scan/*"],
      },
    ],
  },
};

export async function GET() {
  return NextResponse.json(AASA, {
    headers: { "Content-Type": "application/json" },
  });
}
