import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { cookies } from 'next/headers';

const f = createUploadthing();

const auth = async (req: Request) => {
  const cookieStore = await cookies();
  const publicKey = cookieStore.get('publicKey')?.value;
  return publicKey ? { publicKey } : null;
};

export const ourFileRouter = {
  // Endpoint for general media uploads (product files)
  mediaUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
    audio: { maxFileSize: "32MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    text: { maxFileSize: "8MB", maxFileCount: 1 },
    blob: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { publicKey: user.publicKey };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for publicKey:", metadata.publicKey);
      console.log("file url", file.ufsUrl);
      return { uploadedBy: metadata.publicKey };
    }),

  // Endpoint specifically for image uploads (banner images, etc)
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { publicKey: user.publicKey };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image upload complete for publicKey:", metadata.publicKey);
      console.log("image url", file.ufsUrl);
      return { uploadedBy: metadata.publicKey };
    }),
};

export type OurFileRouter = typeof ourFileRouter; 