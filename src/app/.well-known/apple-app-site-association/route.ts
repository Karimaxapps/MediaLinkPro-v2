import { NextResponse } from "next/server";

// Apple App Site Association — enables iOS Universal Links.
// Served at /.well-known/apple-app-site-association with NO file extension and
// Content-Type: application/json (Apple requirement).
//
// `paths` lists the web routes the app claims. When the app is installed, iOS
// opens these links in the app; otherwise (or on desktop) they open in the
// browser. The matching native screens must be implemented in the app repo
// (com.medialinkpro.mobile) for each path below.
const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "SFUD4L8HYM.com.medialinkpro.mobile",
        paths: ["/scan/*", "/dashboard", "/dashboard/*"],
      },
    ],
  },
};

export async function GET() {
  return NextResponse.json(AASA, {
    headers: { "Content-Type": "application/json" },
  });
}
