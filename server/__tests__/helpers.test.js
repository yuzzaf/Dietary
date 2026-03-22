const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { signToken, verifyToken } = require("../helpers/jwt");

describe("Helper Functions", () => {
  describe("Bcrypt Helper", () => {
    it("should hash and compare password correctly", async () => {
      const myPassword = "strongpassword123";
      
      const hashed = await hashPassword(myPassword);
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(myPassword);
      
      const isMatch = await comparePassword(myPassword, hashed);
      expect(isMatch).toBe(true);
      
      const isFalseMatch = await comparePassword("wrongpass", hashed);
      expect(isFalseMatch).toBe(false);
    });
  });

  describe("JWT Helper", () => {
    it("should sign and verify jwt token correctly", () => {
      // Mock the secret key internally if not present
      process.env.JWT_SECRET = "supersecret123";
      
      const payload = { id: 99, role: "admin" };
      
      const token = signToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(99);
      expect(decoded.role).toBe("admin");
    });
  });
});
