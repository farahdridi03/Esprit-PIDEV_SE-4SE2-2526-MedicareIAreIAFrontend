import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generateVaccinationPDF(
    baby: {
      name: string,
      ageText: string,
      gender: string,
      weightAtBirth: number,
      heightAtBirth: number
    },
    vaccineTimeline: {
      name: string,
      description: string,
      status: 'done' | 'due' | 'upcoming',
      milestoneDate: string,
      completedDate?: string,
      dose?: string
    }[],
    babyPhotoBase64: string,
    parentName: string,
    parentEmail: string
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- COLORS ---
    const primaryGreen: [number, number, number] = [14, 124, 102]; // #0e7c66
    const darkGreen: [number, number, number] = [10, 92, 74]; // #0a5c4a
    const orangeUpcoming: [number, number, number] = [245, 158, 11]; // #f59e0b
    const blueDue: [number, number, number] = [59, 130, 246]; // #3b82f6
    const textPrimary: [number, number, number] = [17, 24, 39]; // #111827
    const textSecondary: [number, number, number] = [107, 114, 128]; // #6b7280

    // --- HEADER ---
    doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.rect(0, 0, pageWidth, 55, 'F');

    // --- HEADER ---
    doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.rect(0, 0, pageWidth, 55, 'F');

    // Baby Photo (Circular with Proper Center-Crop)
    if (babyPhotoBase64) {
      const imgSize = 35;
      const imgX = 15;
      const imgY = 10;
      const centerX = imgX + imgSize/2;
      const centerY = imgY + imgSize/2;
      const radius = imgSize/2;

      // Draw white border circle
      doc.setFillColor(255, 255, 255);
      doc.circle(centerX, centerY, radius + 1.5, 'F');

      doc.saveGraphicsState();
      doc.circle(centerX, centerY, radius, 'S'); 
      doc.clip();
      
      try {
        const props = doc.getImageProperties(babyPhotoBase64);
        const ratio = props.width / props.height;
        
        let drawW = imgSize;
        let drawH = imgSize;
        let drawX = imgX;
        let drawY = imgY;

        if (ratio > 1) { // Landscape
          drawW = imgSize * ratio;
          drawX = imgX - (drawW - imgSize) / 2;
        } else { // Portrait or Square
          drawH = imgSize / ratio;
          drawY = imgY - (drawH - imgSize) / 2;
        }

        doc.addImage(babyPhotoBase64, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST');
      } catch (e) {
        doc.addImage(babyPhotoBase64, 'JPEG', imgX, imgY, imgSize, imgSize);
      }
      doc.restoreGraphicsState();
    }

    // Baby Name & Age
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(baby.name, 60, 25);
    
    // Age Badge (Translucent Pill)
    // jsPDF Transparency requires GState
    const gs = new (doc as any).GState({ opacity: 0.2 });
    doc.saveGraphicsState();
    doc.setGState(gs);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(60, 32, 40, 8, 4, 4, 'F');
    doc.restoreGraphicsState();
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(baby.ageText, 80, 37.5, { align: 'center' });

    // Brand Side (Right)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('MEDICARE AI', pageWidth - 15, 20, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL VACCINATION BOOKLET', pageWidth - 15, 27, { align: 'right' });

    // Progress Bar
    const doneCount = vaccineTimeline.filter(v => v.status === 'done').length;
    const totalCount = vaccineTimeline.length || 1;
    const progressWidth = 45;
    const progressX = pageWidth - 15 - progressWidth;
    const progressY = 38;
    
    // Background bar
    doc.saveGraphicsState();
    doc.setGState(gs);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(progressX, progressY, progressWidth, 4, 2, 2, 'F');
    doc.restoreGraphicsState();
    
    // Fill bar
    doc.setFillColor(52, 211, 153); // Bright green
    doc.roundedRect(progressX, progressY, (doneCount / totalCount) * progressWidth, 4, 2, 2, 'F');
    
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`${doneCount} done · ${totalCount - doneCount} upcoming`, pageWidth - 15, 47, { align: 'right' });

    // --- SECTIONS ---
    let currentY = 65;

    // Check if we have data
    if (vaccineTimeline.length === 0) {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(12);
        doc.text('No vaccination records found for this profile.', pageWidth/2, 100, { align: 'center' });
    } else {
        // 1. COMPLETED SECTION
        const doneVaccines = vaccineTimeline.filter(v => v.status === 'done');
        if (doneVaccines.length > 0) {
          doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
          doc.roundedRect(15, currentY, pageWidth - 30, 10, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('✓ COMPLETED VACCINATIONS', 22, currentY + 6.5);

          autoTable(doc, {
            startY: currentY + 12,
            head: [['VACCINE', 'DOSE', 'DATE', 'STATUS']],
            body: doneVaccines.map(v => [
              v.name,
              v.dose || '1st',
              v.completedDate || v.milestoneDate,
              'DONE'
            ]),
            theme: 'striped',
            headStyles: { fillColor: [249, 250, 251], textColor: textSecondary, fontSize: 8, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, textColor: textPrimary, cellPadding: 4 },
            alternateRowStyles: { fillColor: [240, 250, 246] },
            didParseCell: (data) => {
              if (data.section === 'body' && data.column.index === 3) {
                data.cell.styles.textColor = primaryGreen;
                data.cell.styles.fontStyle = 'bold';
              }
            }
          });
          currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // 2. UPCOMING / NEXT SECTION
        const nextVaccines = vaccineTimeline.filter(v => v.status !== 'done');
        if (nextVaccines.length > 0) {
          doc.setFillColor(orangeUpcoming[0], orangeUpcoming[1], orangeUpcoming[2]);
          doc.roundedRect(15, currentY, pageWidth - 30, 10, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('⏰ NEXT RECOMMENDED VACCINATIONS', 22, currentY + 6.5);

          autoTable(doc, {
            startY: currentY + 12,
            head: [['VACCINE', 'DUE AGE', 'EXPECTED DATE', 'STATUS']],
            body: nextVaccines.map(v => [
              v.name,
              v.description || 'N/A',
              v.milestoneDate,
              v.status.toUpperCase()
            ]),
            theme: 'striped',
            headStyles: { fillColor: [249, 250, 251], textColor: textSecondary, fontSize: 8, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, textColor: textPrimary, cellPadding: 4 },
            alternateRowStyles: { fillColor: [255, 247, 237] },
            didParseCell: (data) => {
              if (data.section === 'body' && data.column.index === 3) {
                const status = data.cell.raw as string;
                if (status === 'DUE') {
                  data.cell.styles.textColor = blueDue;
                  data.cell.text = ['DUE NOW'];
                } else {
                  data.cell.styles.textColor = orangeUpcoming;
                }
                data.cell.styles.fontStyle = 'bold';
              }
            }
          });
        }
    }

    // --- FOOTER ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(243, 244, 246);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      doc.setFontSize(8);
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
      doc.text('MedicareAI · Official Medical Document', 15, pageHeight - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }

    doc.save(`vaccination_booklet_${baby.name}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
