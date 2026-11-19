// Lab app the QA bot tests. `BUG=checkout` seeds a regression so the bench can prove it catches it.
const dir = `${import.meta.dir}/public`;
const port = Number(process.env.PORT ?? 4790);
const bug = process.env.BUG ?? "";

const html = (body: string, status = 200, headers: Record<string, string> = {}) =>
  new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", ...headers } });

export const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const p = url.pathname;

    if (p === "/api/login" && req.method === "POST") {
      const f = await req.formData();
      const ok = f.get("email") === "qa@example.com" && f.get("password") === "correct-horse";
      return new Response(null, {
        status: 303,
        headers: ok
          ? { location: "/account", "set-cookie": "sid=qa; Path=/; HttpOnly; SameSite=Lax" }
          : { location: "/login.html?error=1" },
      });
    }

    if (p === "/account") {
      const signedIn = (req.headers.get("cookie") ?? "").includes("sid=qa");
      return signedIn
        ? html(`<!doctype html><title>Account</title><link rel="stylesheet" href="/lab.css"><main><h1>Welcome back</h1><p id="status">Signed in as qa@example.com</p></main>`)
        : new Response(null, { status: 303, headers: { location: "/login.html" } });
    }

    if (p === "/api/checkout" && req.method === "POST") {
      const { items } = (await req.json()) as { items: { price: number; qty: number }[] };
      const total = items.reduce((sum, it) => sum + it.price * (bug === "checkout" ? 1 : it.qty), 0);
      return Response.json({ total: Math.round(total * 100) / 100 });
    }

    const file = Bun.file(`${dir}${p === "/" ? "/index.html" : p}`);
    return (await file.exists()) ? new Response(file) : html("<h1>404</h1>", 404);
  },
});

if (import.meta.main) console.log(`lab on http://localhost:${server.port}${bug ? ` (bug: ${bug})` : ""}`);
