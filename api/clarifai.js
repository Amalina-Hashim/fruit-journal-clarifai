export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl } = req.body;
  const apiKey = process.env.CLARIFAI_API_KEY;

  try {
    const response = await fetch(
      "https://api.clarifai.com/v2/users/clarifai/apps/main/models/general-image-recognition/outputs",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [{ data: { image: { url: imageUrl } } }],
        }),
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error communicating with Clarifai API:", error);
    res.status(500).json({ error: "Error communicating with Clarifai API" });
  }
}
