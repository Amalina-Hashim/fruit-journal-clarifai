export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl } = req.body;
  const apiKey = process.env.CLARIFAI_API_KEY;

  try {
    const clarifaiResponse = await fetch(
      "https://api.clarifai.com/v2/models/aa7f35c01e0642fda5cf400f543e7c40/outputs",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      }
    );

    const data = await clarifaiResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error communicating with Clarifai API:", error);
    res.status(500).json({ error: "Error communicating with Clarifai API" });
  }
}
