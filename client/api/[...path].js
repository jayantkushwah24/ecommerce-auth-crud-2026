import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import process from "node:process";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

const forwardedRequestHeaders = new Set([
  "accept",
  "authorization",
  "content-type",
  "cookie",
  "user-agent",
]);

export default async function handler(req, res) {
  const backendApiUrl = process.env.BACKEND_API_URL;
  if (!backendApiUrl) {
    return res.status(500).json({
      message: "The BACKEND_API_URL environment variable is not configured",
    });
  }

  let backendOrigin;
  try {
    backendOrigin = new URL(backendApiUrl);
    if (
      !["http:", "https:"].includes(backendOrigin.protocol) ||
      backendOrigin.username ||
      backendOrigin.password ||
      backendOrigin.pathname !== "/" ||
      backendOrigin.search ||
      backendOrigin.hash
    ) {
      throw new Error("BACKEND_API_URL must be an origin without a path");
    }
  } catch (error) {
    console.error("Invalid BACKEND_API_URL:", error);
    return res.status(500).json({ message: "Backend URL is misconfigured" });
  }

  let targetUrl;
  try {
    targetUrl = new URL(req.url, backendOrigin);
  } catch (error) {
    console.error("Invalid API request URL:", error);
    return res.status(400).json({ message: "Invalid request URL" });
  }

  if (
    targetUrl.origin !== backendOrigin.origin ||
    !targetUrl.pathname.startsWith("/api/")
  ) {
    return res.status(404).json({ message: "Not found" });
  }

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (
      !forwardedRequestHeaders.has(name.toLowerCase()) ||
      (typeof value !== "string" && !Array.isArray(value))
    ) {
      continue;
    }
    headers.set(name, Array.isArray(value) ? value.join(", ") : value);
  }

  const hasBody =
    !["GET", "HEAD"].includes(req.method) &&
    (Number(req.headers["content-length"] || 0) > 0 ||
      req.headers["transfer-encoding"] !== undefined);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? req : undefined,
      ...(hasBody ? { duplex: "half" } : {}),
      redirect: "manual",
    });

    res.statusCode = upstreamResponse.status;
    for (const [name, value] of upstreamResponse.headers) {
      if (
        ![
          "connection",
          "content-encoding",
          "content-length",
          "keep-alive",
          "set-cookie",
          "transfer-encoding",
          "upgrade",
        ].includes(name.toLowerCase())
      ) {
        res.setHeader(name, value);
      }
    }

    const cookies = upstreamResponse.headers.getSetCookie();
    if (cookies.length > 0) {
      res.setHeader("Set-Cookie", cookies);
    }

    if (!upstreamResponse.body) {
      return res.end();
    }

    return await pipeline(Readable.fromWeb(upstreamResponse.body), res);
  } catch (error) {
    console.error("Backend proxy request failed:", error);
    if (!res.headersSent) {
      return res.status(502).json({ message: "Unable to reach the API server" });
    }
    return res.end();
  }
}
