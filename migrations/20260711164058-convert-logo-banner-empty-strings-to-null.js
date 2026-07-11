/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
  await db.collection("restaurants").updateMany(
    {
      $or: [
        { logo: "" },
        { banner: "" }
      ]
    },
    {
      $set: {
        logo: null,
        banner: null
      }
    }
  );
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
  await db.collection("restaurants").updateMany(
    {
      $or: [
        { logo: null },
        { banner: null }
      ]
    },
    {
      $set: {
        logo: "",
        banner: ""
      }
    }
  );
};
