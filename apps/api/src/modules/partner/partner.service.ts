import axios from "axios";
import { PrismaService } from "../../common/db/prisma.service";

const PARTNER_API_URL = "https://partners.shopify.com/api/2024-01/graphql.json";

export class PartnerService {
  constructor(private prisma: PrismaService) {}

  async fetchDailyMetrics(day: string) {
    const query = `
      query PartnerAppMetrics($orgId: ID!, $since: DateTime!, $until: DateTime!) {
        organization(id: $orgId) {
          apps(first: 50) {
            nodes {
              id
              name
              events(
                since: $since
                until: $until
              ) {
                installs
                uninstalls
                activeInstalls
                grossRevenue {
                  amount
                  currencyCode
                }
                netRevenue {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;

    const res = await axios.post(
      PARTNER_API_URL,
      {
        query,
        variables: {
          orgId: `gid://shopify/Organization/1943073`,
          since: `${day}T00:00:00Z`,
          until: `${day}T23:59:59Z`,
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_PARTNER_API_TOKEN!,
          "Content-Type": "application/json",
        },
      },
    );

    return res.data.data.organization.apps.nodes;
  }
}
