export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization"
        }
      });
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true, app: "Campus Market" });
    }

    if (url.pathname === "/api/listings" && request.method === "GET") {
      const category = url.searchParams.get("category");
      const q = url.searchParams.get("q");

      let query = `
        SELECT id, title, description, price, type, category,
               campus, seller_name, image_url, created_at
        FROM listings
      `;
      const params: string[] = [];

      if (category) {
        query += " WHERE category = ?";
        params.push(category);
      }

      if (q) {
        query += category ? " AND" : " WHERE";
        query += " (title LIKE ? OR description LIKE ?)";
        params.push(`%${q}%`, `%${q}%`);
      }

      query += " ORDER BY created_at DESC LIMIT 100";

      const result = await env.DB.prepare(query)
        .bind(...params)
        .all();

      return json(result.results);
    }

    if (url.pathname === "/api/listings" && request.method === "POST") {
      const body = await request.json<{
        title: string;
        description?: string;
        price: number;
        type: string;
        category: string;
        campus: string;
        seller_name: string;
        image_url?: string;
      }>();

      const id = crypto.randomUUID();

      await env.DB.prepare(`
        INSERT INTO listings
        (id,title,description,price,type,category,campus,seller_name,image_url)
        VALUES (?,?,?,?,?,?,?,?,?)
      `)
        .bind(
          id,
          body.title,
          body.description || "",
          body.price,
          body.type,
          body.category,
          body.campus,
          body.seller_name,
          body.image_url || ""
        )
        .run();

      return json({ id, success: true }, 201);
    }

    return env.ASSETS?.fetch(request) ??
      new Response("Not found", { status: 404 });
  }
};
