export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl } = req.body;
  const pat = process.env.CLARIFAI_PAT;

  if (!pat) {
    console.error("Error: Personal Access Token (PAT) is not set.");
    return res
      .status(500)
      .json({ error: "Server configuration error: PAT is missing." });
  }

  if (!imageUrl) {
    console.error("Error: Image URL is missing in the request payload.");
    return res
      .status(400)
      .json({ error: "Bad Request: Image URL is required." });
  }

  try {
    // Step 1: Fetch the available model versions
    const versionResponse = await fetch(
      "https://api.clarifai.com/v2/models/general-image-recognition/versions",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );

    const versionData = await versionResponse.json();
    const latestVersionId = versionData?.model_versions?.[0]?.id;

    if (!latestVersionId) {
      return res
        .status(400)
        .json({ error: "Could not retrieve the latest model version ID." });
    }

    console.log("Using model version ID:", latestVersionId);

    // Step 2: Analyze the image using the retrieved model version ID
    const requestData = {
      user_app_id: {
        user_id: "clarifai",
        app_id: "main",
      },
      inputs: [
        {
          data: {
            image: {
              url: imageUrl,
              allow_duplicate_url: true,
            },
          },
        },
      ],
    };

    const analysisResponse = await fetch(
      `https://api.clarifai.com/v2/models/general-image-recognition/versions/${latestVersionId}/outputs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    const analysisData = await analysisResponse.json();

    if (!analysisResponse.ok) {
      console.error("Clarifai API Error Response:", analysisData);
      return res.status(400).json(analysisData);
    }

    console.log("Clarifai API Response:", analysisData);
    res.status(200).json(analysisData);
  } catch (error) {
    console.error("Error communicating with Clarifai API:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error: Failed to analyze image." });
  }
}
