import { Request, Response } from "express";
import { AwardEligibleModel } from "../models/awardEligibleModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import PDFDocument from "pdfkit";
import logger from "../utils/logger";

const awardEligibleModel = new AwardEligibleModel();



export class AwardEligibleController {
  static async getAllStudents(req: Request, res: Response) {
    const userId = req.user?.user_id;
    const communityId = (req.user as any)?.community_id; 

    if (!userId || !communityId) {
      logger.error(`Unauthorized access: missing user_id or community_id`, {
        user_id: userId,
        community_id: communityId,
      });
      return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    }

    const { standard, stream, medium, marksheet_year } = req.query;

    try {
      logger.info(`📥 [${userId}] Fetching award-eligible students`, {
        user_id: userId,
        method: req.method,
        url: req.originalUrl,
        query: { standard, stream, medium, marksheet_year },
      });

      let responseData: any[] = [];

      if (medium) {
        const results = await awardEligibleModel.getAwardEligibleStudents(
          communityId,
          standard as string,
          stream as string,
          medium as string,
          marksheet_year as string
        );
        responseData = results;
      } else {
        const englishResults =
          await awardEligibleModel.getAwardEligibleStudents(
            communityId,
            standard as string,
            stream as string,
            "english",
            marksheet_year as string
          );

        const gujaratiResults =
          await awardEligibleModel.getAwardEligibleStudents(
            communityId,
            standard as string,
            stream as string,
            "gujarati",
            marksheet_year as string
          );

        responseData = [
          ...englishResults.slice(0, 5),
          ...gujaratiResults.slice(0, 5),
        ];
      }

      if (responseData.length === 0) {
        logger.info(`📥 [${userId}] No award-eligible students found`, {
          user_id: userId,
        });
        return sendResponse(
          res,
          200,
          true,
          getMessage("no_students_found", req.lang),
          []
        );
      }

      const baseUrl = process.env.BASE_URL || "";
      const enrichedData = responseData.map((student) => ({
        ...student,
        marksheet_photo: student.marksheet_photo
          ? `${baseUrl}/Uploads/${student.marksheet_photo}`
          : null,
      }));

      logger.info(
        `✅ [${userId}] Successfully fetched ${enrichedData.length} award-eligible students`,
        { user_id: userId }
      );
      sendResponse(
        res,
        200,
        true,
        getMessage("student_retrieve", req.lang),
        enrichedData
      );
    } catch (error: any) {
      logger.error(`❌ [${userId}] Error fetching award-eligible students: ${error?.message}`, {
        user_id: userId,
        stack: error?.stack,
      });
      return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
    }
  }

  static async generateTop5Pdf(req: Request, res: Response) {
    const userId = req.user?.user_id;
    const communityId = (req.user as any)?.community_id;

    if (!userId || !communityId) {
      logger.error("Unauthorized: missing user_id or community_id", {
        user_id: userId,
        community_id: communityId,
      });
      return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    }

    try {
      logger.info(`📥 [${userId}] Attempting to generate top 5 students PDF`, {
        user_id: userId,
        method: req.method,
        url: req.originalUrl,
      });

      logger.info(
        `📤 [${userId}] Fetching top 5 students for all active standards`,
        { user_id: userId }
      );

      const approvedOnly = String(req.query.approvedOnly || "") === "1";
      const top5Students = approvedOnly
        ? await awardEligibleModel.getAllApprovedForAllGroups(communityId)
        : await awardEligibleModel.getTop5ForAllGroups(communityId);

      logger.info(
        `📜 [${userId}] Generating PDF for ${top5Students.length} groups`,
        { user_id: userId }
      );

      // Initialize PDFDocument
      const doc = new PDFDocument({ bufferPages: true });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        const forceDownload = String(req.query.download || "") === "1";
        const namesOnly = String(req.query.namesOnly || "") === "1";
        const approvedOnly = String(req.query.approvedOnly || "") === "1";
        const fileName = namesOnly
          ? "top5_all_standards_names_only.pdf"
          : approvedOnly
            ? "All-Received-Marksheets.pdf"
          : "top5_all_standards.pdf";

        // Set response headers
        res.setHeader(
          "Content-Type",
          forceDownload ? "application/octet-stream" : "application/pdf"
        );
        res.setHeader(
          "Content-Disposition",
          `${forceDownload ? "attachment" : "inline"}; filename="${fileName}"`
        );
        res.setHeader("Content-Length", pdfData.length.toString());
        res.setHeader("Cache-Control", "no-cache");

        logger.info(
          `✅ [${userId}] Successfully generated PDF: top5_all_standards.pdf`,
          { user_id: userId }
        );

        // Send response
        if (
          req.headers["user-agent"]?.includes("Mobile") ||
          req.headers["accept"]?.includes("application/octet-stream")
        ) {
          res.status(200).send(pdfData);
        } else {
          res.status(200).send(pdfData);
        }
      });

      // Handle PDF generation errors
      doc.on("error", (error) => {
        throw new Error(`PDF generation failed: ${error.message}`);
      });

      // Add PDF title
      doc.fontSize(13).text("Award Eligible Students", { align: "center" });
      let currentY = doc.y + 12;

      const pageMargin = 40;
      const usableWidth = doc.page.width - pageMargin * 2;
      const rowHeight = 21;
      const namesOnly = String(req.query.namesOnly || "") === "1";
      const colWidths = approvedOnly
        ? [
            usableWidth * 0.5, // Student Name
            usableWidth * 0.5, // Father Name
          ]
        : namesOnly
        ? [
            usableWidth * 0.12, // No.
            usableWidth * 0.88, // Student Name
          ]
        : [
            usableWidth * 0.07, // No.
            usableWidth * 0.37, // Student Name
            usableWidth * 0.13, // Percentage
            usableWidth * 0.27, // Father Name
            usableWidth * 0.16, // Father Mobile
          ];

      const ensureSpace = (requiredHeight: number): boolean => {
        if (currentY + requiredHeight > doc.page.height - pageMargin) {
          doc.addPage();
          currentY = pageMargin;
          doc.y = currentY;
          return true;
        }
        return false;
      };

      const drawSectionTitleRow = (y: number, title: string) => {
        doc.rect(pageMargin, y, usableWidth, rowHeight).stroke();
        doc
          .font("Helvetica-Bold")
          .fontSize(13)
          .text(title, pageMargin + 5, y + 5, {
            width: usableWidth - 10,
            align: "center",
            lineBreak: false,
          });
        doc.y = y;
      };

      const fitTextToCell = (
        value: any,
        maxWidth: number,
        fontName: string,
        fontSize: number
      ): string => {
        const text = String(value ?? "N/A");
        doc.font(fontName).fontSize(fontSize);
        if (doc.widthOfString(text) <= maxWidth) return text;

        const suffix = "...";
        let low = 0;
        let high = text.length;
        let best = "";

        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const candidate = `${text.slice(0, mid)}${suffix}`;
          if (doc.widthOfString(candidate) <= maxWidth) {
            best = candidate;
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }

        return best || suffix;
      };

      const drawTableHeader = (y: number) => {
        const headers = approvedOnly
          ? ["Student Name", "Father Name"]
          : namesOnly
          ? ["No.", "Student Name"]
          : [
              "No.",
              "Student Name",
              "Percentage",
              "Father Name",
              "Father Mobile No.",
            ];
        let x = pageMargin;
        headers.forEach((header, index) => {
          const width = colWidths[index];
          doc.rect(x, y, width, rowHeight).stroke();
          doc
            .font("Helvetica-Bold")
            .fontSize(7)
            .text(header, x + 5, y + 7, {
              width: width - 10,
              height: rowHeight - 8,
              align: "left",
              lineBreak: false,
            });
          x += width;
        });
        doc.font("Helvetica");
        doc.y = y;
      };

      const drawTableRow = (y: number, student: any, rowNo: number) => {
        const rowValues = approvedOnly
          ? [
              fitTextToCell(
                student?.student_name || "N/A",
                colWidths[0] - 10,
                "Helvetica",
                7
              ),
              fitTextToCell(
                student?.father_full_name || "N/A",
                colWidths[1] - 10,
                "Helvetica",
                7
              ),
            ]
          : namesOnly
          ? [
              rowNo,
              fitTextToCell(
                student?.student_name || "N/A",
                colWidths[1] - 10,
                "Helvetica",
                7
              ),
            ]
          : [
              rowNo,
              fitTextToCell(
                student?.student_name || "N/A",
                colWidths[1] - 10,
                "Helvetica",
                7
              ),
              student?.percentage !== undefined && student?.percentage !== null
                ? `${student.percentage}%`
                : "N/A",
              fitTextToCell(
                student?.father_full_name || "N/A",
                colWidths[3] - 10,
                "Helvetica",
                7
              ),
              student?.father_phone_number ||
                student?.father_mobile_number ||
                student?.phone_number ||
                "N/A",
            ];

        let x = pageMargin;
        rowValues.forEach((value, index) => {
          const width = colWidths[index];
          doc.rect(x, y, width, rowHeight).stroke();
          doc
            .fontSize(7)
            .text(String(value), x + 5, y + 7, {
              width: width - 10,
              height: rowHeight - 8,
              align: "left",
              lineBreak: false,
            });
          x += width;
        });
        doc.y = y;
      };

      const toTitleCase = (value: any): string => {
        const text = String(value ?? "N/A").toLowerCase();
        return text.replace(/\b\w/g, (char) => char.toUpperCase());
      };

      const renderGroup = (group: any) => {
        const isHigherSecondary = ["11", "12"].includes(String(group.standard));
        const mediumText = toTitleCase(group.medium || "N/A");
        const streamText = toTitleCase(group.stream || "N/A");
        const title = isHigherSecondary
          ? `Standard: ${group.standard} - ${mediumText} Medium - ${streamText} Stream`
          : `Standard: ${group.standard} - ${mediumText} Medium`;

        ensureSpace(rowHeight * 3);
        drawSectionTitleRow(currentY, title);
        currentY += rowHeight;

        ensureSpace(rowHeight * 2);
        drawTableHeader(currentY);
        currentY += rowHeight;

        if (!group.students || group.students.length === 0) {
          ensureSpace(rowHeight);
          drawTableRow(currentY, {
            student_name: "No marksheet available",
            percentage: "N/A",
            father_full_name: "N/A",
            father_phone_number: "N/A",
          }, 1);
          currentY += rowHeight;
        } else {
          group.students.forEach((student: any, index: number) => {
            const isNewPage = ensureSpace(rowHeight);
            if (isNewPage) {
              drawSectionTitleRow(currentY, title);
              currentY += rowHeight;
              drawTableHeader(currentY);
              currentY += rowHeight;
            }
            drawTableRow(currentY, student, index + 1);
            currentY += rowHeight;
          });
        }

        currentY += 14;
        doc.y = currentY;
      };

      const gujaratiGroups = top5Students.filter(
        (group) => String(group.medium || "").toLowerCase() === "gujarati"
      );
      const englishGroups = top5Students.filter(
        (group) => String(group.medium || "").toLowerCase() === "english"
      );
      const otherGroups = top5Students.filter((group) => {
        const medium = String(group.medium || "").toLowerCase();
        return medium !== "gujarati" && medium !== "english";
      });

      gujaratiGroups.forEach(renderGroup);

      if (gujaratiGroups.length > 0 && (englishGroups.length > 0 || otherGroups.length > 0)) {
        doc.addPage();
        currentY = pageMargin;
        doc.y = currentY;
      }

      englishGroups.forEach(renderGroup);
      otherGroups.forEach(renderGroup);

      doc.end();
    } catch (error: any) {
      logger.error(`❌ [${userId}] Error generating top 5 students PDF: ${error?.message}`, {
        user_id: userId,
        stack: error?.stack,
      });
      return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
    }
  }
}
