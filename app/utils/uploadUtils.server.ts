import { json } from "stream/consumers";

export const GET_FILES_QUERY = `
    query GetGalleryFiles {
      files(first: 10) {
        edges {
          node {
            id
            createdAt
            alt
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }
    }
  `;
export const STAGED_UPLOADS_MUTATION = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const FILE_CREATE_MUTATION = `
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const GET_FILES_BY_QUERY = `query ($id: ID!) {
  node(id: $id) {
    id
    fileStatus
    ... on MediaImage {
    status
      image {
        url
      }
    }
  }
}`

export const queryImages = async ({ admin }: any) => {
  try {
    const response = await admin.graphql(GET_FILES_QUERY);
    const data = await response.json();

    console.log("Loader Response:", data);

    if (data?.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error("Failed to fetch images");
    }

    const images = data?.data?.files?.edges?.map((edge: any) => ({
      id: edge.node.id,
      url: edge.node.image?.url || "",
      alt: edge.node.alt || "No alt text",
    })) || [];

    return images;
  } catch (error) {
    console.error("Error in queryImages:", error);
    throw error;
  }
};

export const createStagedUploads = async (admin, files) => {
  try {
    const variables = {
      input: files.map((file) => ({
        filename: file.name,
        mimeType: file.type,
        fileSize: file.size.toString(),
        httpMethod: "POST",
        resource: "IMAGE",
      })),
    };
    console.log('variables', variables);
    const response = await admin.graphql(STAGED_UPLOADS_MUTATION, { variables });
    const data = await response.json();

    if (data?.errors || data?.data?.stagedUploadsCreate?.userErrors?.length) {
      console.error("GraphQL errors or user errors:", data);
      throw new Error("Failed to create staged uploads");
    }

    return data.data.stagedUploadsCreate.stagedTargets;
  } catch (error) {
    console.error("Error in createStagedUploads:", error);
    throw error;
  }
};

export const uploadFileToStagedURL = async (stagedTarget, file) => {
  try {
    if (!stagedTarget) {
      console.error("Invalid staged target:", stagedTarget);
      throw new Error("Invalid staged target or missing parameters");
    }

    const formData = new FormData();
    stagedTarget.parameters.forEach(({ name: paramName, value }) => formData.append(paramName, value));
    formData.append("file", file);
    console.log('formData', formData);

    const uploadResponse = await fetch(stagedTarget.url, {
      method: "POST",
      body: formData,
    });
    console.log('uploadResponse', uploadResponse);

    if (!uploadResponse.ok) {
      const result = await uploadResponse.text();
      console.error("Failed to upload file:", result);
      throw new Error("Failed to upload file");
    }

    return {
      createInput: [{
        alt: file.name,
        originalSource: stagedTarget.resourceUrl,
        contentType: 'IMAGE'
      }]
    };
  } catch (error) {
    console.error("Error in uploadFileToStagedURL:", error);
    throw error;
  }
};

export const createFileRecord = async (admin, file) => {
  try {
    const variables = {
      files: file.createInput
    };
    console.log('variables:line209', variables);

    const response = await admin.graphql(FILE_CREATE_MUTATION, { variables });
    const data = await response.json();

    if (data?.data?.fileCreate?.userErrors?.length) {
      console.error("GraphQL user errors:", data.data.fileCreate.userErrors);
      throw new Error("Failed to create file record");
    }

    return data.data.fileCreate.files[0].id;
  } catch (error) {
    console.error("Error in createFileRecord:", error);
    throw error;
  }
};

export const queyFiles = async (id: string, admin) => {
  try {
    console.log('queyFiles:', id);
    const response = await admin.graphql(GET_FILES_BY_QUERY, { variables: { id } });
    const { data } = await response.json();
    console.log('data:line219', data.node);

    if (data?.file?.userErrors?.length) {
      console.error("GraphQL user errors:", data.file.userErrors);
      throw new Error("Failed to query file");
    }

    return data.node;
  } catch (error) {
    console.error("Error in queyFiles:", error);
    throw error;
  }
};