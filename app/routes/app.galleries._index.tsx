import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, Outlet } from "@remix-run/react";
import { Page, Card, ResourceList, Thumbnail, Layout, Link } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useEffect } from "react";
import { UploadInput } from "app/component/UploadInput";
import { createFileRecord, createStagedUploads, queryImages, queyFiles, uploadFileToStagedURL } from "app/utils/uploadUtils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const data = await queryImages({ admin })
  return json({ data })
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const files = JSON.parse(formData.get("files"));
  console.log('files:LINE19', files)

  if (!Array.isArray(files) || files.length === 0) {
    return json({ success: false, error: "No files provided" }, { status: 400 });
  }

  const stagedUploads = await createStagedUploads(admin, files);

  console.log('stagedUploads', stagedUploads)

  const file = files[0];
  const uploadFileToStaged = await uploadFileToStagedURL(stagedUploads[0], file);
  console.log('uploadFileToStaged', uploadFileToStaged)
  const fileId = await createFileRecord(admin, uploadFileToStaged);
  console.log('fileId', fileId)
  const queyFile = await queyFiles(fileId, admin)
  console.log('queyFile: ', queyFile)

  return json({ success: true, fileId });
};



export default function GalleryPage() {
  const data = useLoaderData<typeof loader>();
  console.log("Images:", data);

  const fetcher = useFetcher();

  const handleCreateStagedUploads = async (files: File[]) => {
    const formData = new FormData();
    const fileData = files.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size.toString(),
    }));

    formData.append("files", JSON.stringify(fileData));
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <Page title="Gallery Images">
      <Card>
        <UploadInput onSave={handleCreateStagedUploads} />
        {fetcher.state === "submitting" && <p>Uploading...</p>}
        <ResourceList
          resourceName={{ singular: "image", plural: "images" }}
          items={data?.data || []}
          renderItem={(item) => {
            const { id, url, alt } = item;
            return (
              <Link url={url}>
                <ResourceList.Item id={id} media={<Thumbnail source={url} alt={alt} />}>
                  {alt}
                </ResourceList.Item>
              </Link>
            );
          }}
        />
      </Card>

      <Outlet />
    </Page>
  );
}
