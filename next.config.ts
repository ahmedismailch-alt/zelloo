import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.zelloo.ch",
          },
        ],
        destination: "https://zelloo.ch/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
