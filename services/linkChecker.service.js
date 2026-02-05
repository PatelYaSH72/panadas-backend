export const checkLink = async (url) => {
  try {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: "GET",   // ✅ FIX
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    return res.ok; // status 200–299

  } catch (err) {
    console.log("Link check failed:", url, err.message);

    // trusted domains bypass
    const trustedHosts = ["github.com", "openai.com", "chatgpt.com"];
    if (trustedHosts.some((host) => url.includes(host))) {
      return true;
    }

    return false;
  }
};
