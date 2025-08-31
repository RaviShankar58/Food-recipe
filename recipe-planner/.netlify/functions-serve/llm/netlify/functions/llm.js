var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/llm.mjs
var llm_exports = {};
__export(llm_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(llm_exports);
async function handler(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Only POST allowed" };
    }
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      console.error("Invalid JSON body:", event.body);
      return { statusCode: 400, body: JSON.stringify({ status: "error", error: "Invalid JSON" }) };
    }
    const { prompt } = body;
    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ status: "error", error: "Missing prompt" }) };
    }
    const apiUrl = "https://apifreellm.com/api/chat";
    const apiKey = process.env.APIFREE_KEY || "";
    console.log("Proxy: calling", apiUrl, "with prompt preview:", String(prompt).slice(0, 200));
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: prompt })
    });
    const text = await apiRes.text();
    console.log("Upstream status:", apiRes.status, "body-preview:", text.slice(0, 1e3));
    let js;
    try {
      js = JSON.parse(text);
    } catch {
      return { statusCode: 502, body: JSON.stringify({ status: "error", error: "Upstream returned non-JSON", raw: text.slice(0, 2e3) }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(js)
    };
  } catch (err) {
    console.error("Proxy error:", err);
    return { statusCode: 500, body: JSON.stringify({ status: "error", error: String(err) }) };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=llm.js.map
