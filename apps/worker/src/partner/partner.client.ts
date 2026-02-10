import axios from "axios";

const PARTNER_API_URL = "https://partners.shopify.com/api/2024-01/graphql.json";

export async function partnerGraphql<T>(
  query: string,
  variables: Record<string, any>,
): Promise<T> {
  const token = process.env.SHOPIFY_PARTNER_API_TOKEN;
  if (!token) throw new Error("Missing SHOPIFY_PARTNER_API_TOKEN");

  const res = await axios.post(
    PARTNER_API_URL,
    { query, variables },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      timeout: 30000,
    },
  );

  if (res.data?.errors?.length) {
    throw new Error(`Partner API error: ${JSON.stringify(res.data.errors)}`);
  }
  return res.data.data as T;
}
