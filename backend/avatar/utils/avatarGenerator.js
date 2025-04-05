import 'dotenv/config';

export default async function avatarGenerator(prompt) {
    const formData = new FormData();
    formData.append("model", "sd3.5-large-turbo");
    formData.append("prompt", prompt);
    formData.append("style_preset", "photographic");
    formData.append("output_format", "png");
  
    try {
      const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/ultra", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SD}`,
          Accept: "image/*",
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
  
      return await response.arrayBuffer();
    } catch (error) {
      console.error("Error generating avatar:", error);
      throw error;
    }
  }
  