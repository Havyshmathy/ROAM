
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";


describe("ROAM API", () => {
  it("returns the welcome message from the root endpoint", async () => {
    const response = await request(app).get("/");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      message: "Welcome to ROAM API",
    });
  });

  it("returns a healthy status from the health endpoint", async () => {
    const response = await request(app).get("/api/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.message, "ROAM backend is running");
  });

  it("rejects unauthenticated requests to the trips endpoint", async () => {
    const response = await request(app).get("/api/trips");

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(
      response.body.message,
      "Please log in to continue."
    );
  });
  
  it("rejects an invalid token on the trips endpoint", async () => {
    const response = await request(app)
      .get("/api/trips")
      .set("Authorization", "Bearer invalid-token");

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(
      response.body.message,
      "Invalid or expired token."
    );
  });
});