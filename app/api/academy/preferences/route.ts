import {
  getAcademyPreferences,
  saveAcademyPreferences,
} from "@/lib/academy/personalization/preferencesService";
import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ data: await getAcademyPreferences() });
  } catch (error) {
    return academyErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    return Response.json({
      data: await saveAcademyPreferences(await readAcademyJson(request, 8_000)),
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
