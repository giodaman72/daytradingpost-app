import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsletterSection } from "./NewsletterSection";

describe("newsletter section", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is the target of /#newsletter links", () => {
    const { container } = render(
      <NewsletterSection locale="en" source="homepage" />,
    );

    expect(container.querySelector("section#newsletter")).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Get new analysis and key levels in your inbox.",
      }),
    ).toBeInTheDocument();
  });

  it("renders Spanish copy and a Spanish privacy link", () => {
    render(<NewsletterSection locale="es" source="article" />);

    expect(
      screen.getByRole("heading", {
        name: "Recibe nuevos análisis y niveles clave en tu correo.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "política de privacidad" }),
    ).toHaveAttribute("href", "/es/privacy");
  });

  it("sends the signup source with the request", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ ok: true, message: "You’re subscribed." }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<NewsletterSection locale="en" source="article" />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "trader@example.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(String(init.body))).toMatchObject({
      email: "trader@example.com",
      consent: true,
      source: "article",
    });
    expect(await screen.findByText("Signup confirmed")).toBeInTheDocument();
  });
});
