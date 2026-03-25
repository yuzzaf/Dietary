const axios = require("axios");
const { detectFoodHF } = require("../services/ai/detect.service");

jest.mock("axios");

describe("Detect Service", () => {
  it("should detect food successfully", async () => {
    axios.post.mockResolvedValueOnce({
      data: [{ label: "pizza", score: 0.95 }]
    });

    const file = { buffer: Buffer.from("dummy_image") };
    const result = await detectFoodHF(file);
    
    expect(result.label).toBe("pizza");
    expect(result.score).toBe(0.95);
  });

  it("should throw error if detection fails", async () => {
    axios.post.mockResolvedValueOnce({ data: [] });

    const file = { buffer: Buffer.from("dummy_image") };
    await expect(detectFoodHF(file)).rejects.toEqual({ name: "BadRequest", message: "Detection failed" });
  });

  it("should handle error from axios", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network error"));

    const file = { buffer: Buffer.from("dummy_image") };
    await expect(detectFoodHF(file)).rejects.toThrow("Network error");
  });
});
