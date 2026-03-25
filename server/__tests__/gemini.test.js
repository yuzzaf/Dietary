const { generateInsight, chatWithGemini, detectWithGemini } = require("../services/ai/gemini.service");
const { GoogleGenerativeAI } = require("@google/generative-ai");

jest.mock("@google/generative-ai", () => {
  const mGoogleGenerativeAI = {
    getGenerativeModel: jest.fn().mockImplementation(() => {
      const chatMock = {
        sendMessageStream: jest.fn().mockResolvedValue({
          stream: [
            { text: () => "chunk1" },
            { text: () => "chunk2" }
          ]
        }),
        sendMessage: jest.fn().mockResolvedValue({
          response: Promise.resolve({ text: () => "plain text reply" })
        })
      };

      return {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => "mocked insight" }
        }),
        startChat: jest.fn().mockReturnValue(chatMock)
      };
    })
  };
  return { GoogleGenerativeAI: jest.fn(() => mGoogleGenerativeAI) };
});

describe("Gemini Service", () => {
  it("should generate insight", async () => {
    const res = await generateInsight({
      foods: [{name: "apple", calories: 50}],
      targetCalories: 2000,
      consumedCalories: 50,
      remaining: 1950,
      status: "deficit"
    });
    expect(res).toBe("mocked insight");
  });

  it("should format chat inputs and use stream", async () => {
    const ioMock = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };

    const res = await chatWithGemini(
      [{role: "user", text: "hi"}, {role: "model", text: "hello"}],
      "how are you?",
      "context",
      "socket123",
      ioMock
    );

    expect(res).toBe("Stream completed");
    expect(ioMock.emit).toHaveBeenCalledWith("chat-stream", { text: "chunk1", isDone: false });
    expect(ioMock.emit).toHaveBeenCalledWith("chat-stream", { text: "", isDone: true });
  });

  it("should format chat inputs and use normal message if no socket", async () => {
    const res = await chatWithGemini([], "test");
    expect(res).toBe("plain text reply");
  });
  
  it("should detect with gemini", async () => {
    const file = { buffer: Buffer.from("image"), mimetype: "image/png" };
    const res = await detectWithGemini(file);
    // Returns "mocked insight" from generateContent
    expect(res).toBe("mocked insight"); // since it does toLowerCase().replace().split()[0].trim() it will be "mocked insight"
  });
});
