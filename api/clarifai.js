export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl } = req.body;
  const pat = process.env.CLARIFAI_PAT;
  const userId = "clarifai";
  const appId = "main";
  const modelId = "general-image-recognition";
  const modelVersionId = "aa7f35c01e0642fda5cf400f543e7c40";

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
    // Prepare the request payload
    const requestData = {
      user_app_id: {
        user_id: userId,
        app_id: appId,
      },
      inputs: [
        {
          data: {
            image: {
              url: imageUrl,
            },
          },
        },
      ],
    };

    // Define the request options
    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Key ${pat}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };

    // Use the full endpoint with model version ID
    const endpoint = `https://api.clarifai.com/v2/models/${modelId}/versions/${modelVersionId}/outputs`;

    // Send the request to the Clarifai API
    const clarifaiResponse = await fetch(endpoint, requestOptions);
    const data = await clarifaiResponse.json();

    if (!clarifaiResponse.ok) {
      console.error("Clarifai API Error Response:", data);
      return res.status(400).json(data);
    }

    console.log("Clarifai API Response:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error communicating with Clarifai API:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error: Failed to analyze image." });
  }
}
