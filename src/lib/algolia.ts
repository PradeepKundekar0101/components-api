import algoliasearch from "algoliasearch";
if (
  !process.env.ALGOLIA_APP_ID ||
  !process.env.ALGOLIA_API_KEY ||
  !process.env.ALGOLIA_INDEX_NAME
) {
  throw new Error("Missing required Algolia environment variables");
}

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID as string,
  process.env.ALGOLIA_API_KEY as string
);

const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME!);

export default index;
