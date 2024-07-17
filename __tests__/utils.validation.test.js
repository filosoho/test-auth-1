const {
  validateUsername,
  validateCommentBody,
} = require("../utils/utils.validation.js");

describe("Validation Functions", () => {
  describe("validateUsername", () => {
    test("should resolve for a valid username", () => {
      return validateUsername("valid_user").then((result) => {
        expect(result).toBe("valid_user");
      });
    });

    test("should reject for a non-string username", () => {
      return validateUsername(12345).catch((error) => {
        expect(error).toEqual({
          status: 400,
          msg: "400 - Bad Request: username must be a string",
        });
      });
    });

    test("should reject for missing username", () => {
      return validateUsername(undefined).catch((error) => {
        expect(error).toEqual({
          status: 400,
          msg: "400 - Bad Request: username must be a string",
        });
      });
    });
  });

  describe("validateCommentBody", () => {
    test("should resolve for a valid body", () => {
      return validateCommentBody("This is a comment").then((result) => {
        expect(result).toBe("This is a comment");
      });
    });

    test("should reject for a non-string body", () => {
      return validateCommentBody(12345).catch((error) => {
        expect(error).toEqual({
          status: 400,
          msg: "400 - Bad Request: body must be a string",
        });
      });
    });

    test("should reject for a missing body", () => {
      return validateCommentBody(undefined).catch((error) => {
        expect(error).toEqual({
          status: 400,
          msg: "400 - Bad Request: body must be a string",
        });
      });
    });

    test("should reject for an empty body", () => {
      return validateCommentBody("   ").catch((error) => {
        expect(error).toEqual({
          status: 400,
          msg: "400 - Bad Request: Comment body cannot be empty",
        });
      });
    });
  });
});
