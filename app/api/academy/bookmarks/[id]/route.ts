import { academyErrorResponse } from "@/lib/academy/academyHttp";
import { deleteBookmark } from "@/lib/academy/bookmarks/bookmarkService";

export const dynamic = "force-dynamic";

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
