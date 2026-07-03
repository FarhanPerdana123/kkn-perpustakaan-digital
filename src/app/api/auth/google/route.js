const googleTokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo";

function jsonResponse(body, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return jsonResponse(
      { message: "Google Sign-In belum dikonfigurasi di server." },
      500,
    );
  }

  let credential = "";

  try {
    const body = await request.json();
    credential = String(body.credential || "");
  } catch {
    return jsonResponse({ message: "Payload login tidak valid." }, 400);
  }

  if (!credential) {
    return jsonResponse({ message: "Token Google wajib dikirim." }, 400);
  }

  const tokenInfoResponse = await fetch(
    `${googleTokenInfoUrl}?id_token=${encodeURIComponent(credential)}`,
    { cache: "no-store" },
  );

  if (!tokenInfoResponse.ok) {
    return jsonResponse(
      { message: "Token Google tidak valid atau sudah kedaluwarsa." },
      401,
    );
  }

  const tokenInfo = await tokenInfoResponse.json();

  if (tokenInfo.aud !== clientId) {
    return jsonResponse({ message: "Client ID Google tidak sesuai." }, 401);
  }

  if (tokenInfo.email_verified !== "true") {
    return jsonResponse(
      { message: "Email Google belum terverifikasi." },
      403,
    );
  }

  if (!tokenInfo.email || !tokenInfo.sub) {
    return jsonResponse(
      { message: "Profil Google tidak lengkap untuk login." },
      403,
    );
  }

  return jsonResponse({
    user: {
      email: tokenInfo.email,
      googleId: tokenInfo.sub,
      image: tokenInfo.picture || "",
      name: tokenInfo.name || tokenInfo.email,
    },
  });
}
