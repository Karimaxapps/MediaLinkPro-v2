import { NextResponse } from "next/server";

// Android Digital Asset Links — enables Android App Links for /scan/* deep links.
// Served at /.well-known/assetlinks.json with Content-Type: application/json.
const ASSET_LINKS = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.medialinkpro.mobile",
      sha256_cert_fingerprints: [
        "58:73:0f:d8:20:1e:a9:80:9f:3d:23:23:52:d2:17:50:16:e3:34:b7:fd:f8:59:75:4c:6c:b6:63:76:e2:1e:c3",
      ],
    },
  },
];

export async function GET() {
  return NextResponse.json(ASSET_LINKS, {
    headers: { "Content-Type": "application/json" },
  });
}
