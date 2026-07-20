import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import {
  deleteBookmark,
  updateBookmark,
} from "@/lib/academy/bookmarks/bookmarkService";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await readAcademyJson(request, 2_000);
    return Response.json({
      data: await updateBookmark(
        id,
        typeof body.label === "string" && body.label.trim() ? body.label : null,
      ),
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await deleteBookmark(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
