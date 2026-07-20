import "server-only";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import type { AcademyCertificate } from "@/types/academy";

const gold = rgb(0.96, 0.7, 0.19);
const ink = rgb(0.035, 0.055, 0.085);
const muted = rgb(0.59, 0.63, 0.7);
const white = rgb(0.96, 0.97, 0.99);

function centerText(
  page: ReturnType<PDFDocument["addPage"]>,
  text: string,
  y: number,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  size: number,
  color = white,
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    color,
    font,
    size,
    x: (page.getWidth() - width) / 2,
    y,
  });
}

export async function createCertificateQrPng(verificationUrl: string) {
  return QRCode.toBuffer(verificationUrl, {
    color: { dark: "#08101D", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
    margin: 2,
    type: "png",
    width: 320,
  });
}

export async function createCertificateQrDataUrl(verificationUrl: string) {
  return QRCode.toDataURL(verificationUrl, {
    color: { dark: "#08101D", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });
}

export async function buildCertificatePdf(input: {
  certificate: AcademyCertificate;
  verificationUrl: string;
}) {
  const document = await PDFDocument.create();
  document.setTitle(
    `${input.certificate.courseTitleSnapshot} completion certificate`,
  );
  document.setAuthor("DayTradingPost Academy");
  document.setSubject("Educational course completion");
  document.setCreator("DayTradingPost");

  const page = document.addPage([842, 595]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  page.drawRectangle({
    color: ink,
    height: page.getHeight(),
    width: page.getWidth(),
    x: 0,
    y: 0,
  });
  page.drawRectangle({
    borderColor: gold,
    borderWidth: 2,
    height: 539,
    width: 786,
    x: 28,
    y: 28,
  });
  page.drawRectangle({
    borderColor: rgb(0.25, 0.28, 0.34),
    borderWidth: 1,
    height: 519,
    width: 766,
    x: 38,
    y: 38,
  });

  page.drawRectangle({
    borderColor: gold,
    borderWidth: 1.5,
    height: 46,
    width: 46,
    x: 398,
    y: 510,
  });
  centerText(page, "DTP", 525, bold, 15, gold);
  centerText(page, "DAYTRADINGPOST ACADEMY", 485, bold, 14, gold);
  centerText(page, "CERTIFICATE OF COURSE COMPLETION", 441, bold, 25);
  if (input.certificate.status !== "issued") {
    const label = input.certificate.status.toUpperCase();
    page.drawRectangle({
      borderColor: rgb(0.9, 0.35, 0.35),
      borderWidth: 2,
      height: 28,
      width: 118,
      x: 648,
      y: 514,
    });
    page.drawText(label, {
      color: rgb(0.95, 0.45, 0.45),
      font: bold,
      size: 11,
      x: 677,
      y: 523,
    });
  }
  centerText(
    page,
    "This educational certificate is presented to",
    405,
    regular,
    11,
    muted,
  );
  centerText(page, input.certificate.learnerDisplayName, 354, bold, 31, white);
  page.drawLine({
    color: gold,
    end: { x: 632, y: 341 },
    start: { x: 210, y: 341 },
    thickness: 1,
  });
  centerText(page, "for verified completion of", 317, regular, 11, muted);
  centerText(
    page,
    input.certificate.courseTitleSnapshot,
    278,
    bold,
    Math.min(
      24,
      610 / Math.max(1, input.certificate.courseTitleSnapshot.length),
    ),
    white,
  );

  const issueDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(input.certificate.issuedAt));
  page.drawText(`Issued ${issueDate}`, {
    color: muted,
    font: regular,
    size: 10,
    x: 76,
    y: 202,
  });
  page.drawText(`Certificate ${input.certificate.certificateNumber}`, {
    color: white,
    font: bold,
    size: 10,
    x: 76,
    y: 184,
  });
  if (input.certificate.instructorNameSnapshot) {
    page.drawText(input.certificate.instructorNameSnapshot, {
      color: white,
      font: bold,
      size: 11,
      x: 76,
      y: 148,
    });
    page.drawText("Course instructor", {
      color: muted,
      font: regular,
      size: 9,
      x: 76,
      y: 134,
    });
  }

  const qrBytes = await createCertificateQrPng(input.verificationUrl);
  const qrImage = await document.embedPng(Uint8Array.from(qrBytes));
  page.drawRectangle({
    color: rgb(1, 1, 1),
    height: 108,
    width: 108,
    x: 660,
    y: 138,
  });
  page.drawImage(qrImage, { height: 100, width: 100, x: 664, y: 142 });
  page.drawText("Scan to verify", {
    color: muted,
    font: regular,
    size: 8,
    x: 682,
    y: 126,
  });
  page.drawText(input.verificationUrl, {
    color: muted,
    font: regular,
    maxWidth: 690,
    size: 7,
    x: 76,
    y: 92,
  });
  centerText(
    page,
    "Confirms completion of DayTradingPost educational content only. It is not an accredited qualification or financial advice.",
    58,
    regular,
    7.5,
    muted,
  );

  return document.save();
}
