import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import {
  deleteLearnerNote,
  updateLearnerNote,
} from "@/lib/academy/notes/learnerNoteService";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await readAcademyJson(request, 10_000);
    return Response.json({
      data: await updateLearnerNote(id, String(body.noteText ?? "")),
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
    await deleteLearnerNote(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
