/*
databases are not made for direct image storage (especially large ones like photos, videos, or PDFs).

Why you shouldn’t store images directly in a DB
1.Performance issues
-Databases are optimized for structured data (rows/columns, queries).
-Storing large binary files (BLOBs) slows down queries.
2.Scalability problems
-DB backups/restores become huge & slow.
-Harder to shard/replicate when images are inside the DB.
3.Cost
-Cloud databases (MongoDB Atlas, RDS, etc.) charge more for storage.
-Object storage (like S3) is much cheaper for images.

-Recommended Approach
-Store images in object storage / file storage service
-AWS S3
-Google Cloud Storage
-Firebase Storage
-Cloudflare R2 (cheap S3 alternative)
-In the database, store only:
-image_url (link to the file in S3 or Firebase)
-Metadata (userId, uploadDate, size, type, etc.)
*/


/*
category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }
//In Mongoose, after defining the type of a field, you can add ref to tell Mongoose that this field is a reference to another collection. (you can also add other thing bec. in the object order is not matter.)

*/


/*
type: mongoose.Schema.Types.ObjectId, => mongoose se bolo Schema dena usme se Types nikal letae hai usme ObjectId deena.
*/

/*
mongoose docs is based on the requirement.
*/