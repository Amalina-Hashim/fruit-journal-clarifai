export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl } = req.body;
  const pat = process.env.CLARIFAI_PAT;

  try {
    const clarifaiResponse = await fetch(
      "https://api.clarifai.com/v2/models/aa7f35c01e0642fda5cf400f543e7c40/outputs",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pat}`,
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

    if (!clarifaiResponse.ok) {
      console.error("Clarifai API Error Response:", data);
      return res.status(400).json(data);
    }

    console.log("Clarifai API Response:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error communicating with Clarifai API:", error);
    res.status(500).json({ error: "Error communicating with Clarifai API" });
  }
}
