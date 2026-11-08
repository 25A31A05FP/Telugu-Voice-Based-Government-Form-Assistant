import { jsPDF } from 'jspdf';
import { FormSession, FormTemplate } from '../types/form.ts';

export function generateApplicationPdf(session: FormSession, template: FormTemplate): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Header border & decoration
  doc.setDrawColor(15, 118, 110); // emerald-700
  doc.setLineWidth(1.2);
  doc.rect(margin, margin - 4, contentWidth, 268);

  // Top Banner
  doc.setFillColor(15, 118, 110);
  doc.rect(margin, margin - 4, contentWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SAHAYAK — TELUGU VOICE FORM ASSISTANT', pageWidth / 2, y + 2, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Educational Demonstration • Bilingual Application Format', pageWidth / 2, y + 8, { align: 'center' });

  y += 20;

  // Title section
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(template.titleEn.toUpperCase(), margin + 5, y + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(75, 85, 99);
  doc.text(`Telugu Form: ${template.titleTe}`, margin + 5, y + 12);

  // App Reference & Date in top-right box
  const refCode = `APP-${session.id.slice(-8).toUpperCase()}`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Application Ref: ${refCode}`, pageWidth - margin - 5, y + 5, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin - 5, y + 10, { align: 'right' });
  doc.text(`Status: ${session.status === 'completed' ? 'COMPLETED (VERIFIED)' : 'DRAFT'}`, pageWidth - margin - 5, y + 15, { align: 'right' });

  y += 20;

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin + 5, y, pageWidth - margin - 5, y);
  y += 6;

  // Table header
  doc.setFillColor(243, 244, 246);
  doc.rect(margin + 4, y, contentWidth - 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text('#', margin + 6, y + 5.5);
  doc.text('FIELD / QUESTION (ENGLISH)', margin + 14, y + 5.5);
  doc.text('TELUGU QUESTION REF', margin + 90, y + 5.5);
  doc.text('RECORDED ANSWER', margin + 135, y + 5.5);

  y += 9;

  // Question rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  template.questions.forEach((q, idx) => {
    const answer = session.answers[q.id];
    const answerVal = answer?.englishTranslation || answer?.rawTelugu || '— Not provided —';
    const isEven = idx % 2 === 0;

    if (isEven) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin + 4, y, contentWidth - 8, 8, 'F');
    }

    doc.setTextColor(107, 114, 128);
    doc.text(String(idx + 1), margin + 6, y + 5.5);

    doc.setTextColor(17, 24, 39);
    const shortLabelEn = q.labelEn.length > 36 ? q.labelEn.slice(0, 34) + '..' : q.labelEn;
    doc.text(shortLabelEn, margin + 14, y + 5.5);

    doc.setTextColor(75, 85, 99);
    const shortLabelTe = q.labelTe.length > 22 ? q.labelTe.slice(0, 20) + '..' : q.labelTe;
    doc.text(shortLabelTe, margin + 90, y + 5.5);

    doc.setFont('helvetica', answer ? 'bold' : 'italic');
    doc.setTextColor(answer ? 15 : 156, answer ? 118 : 163, answer ? 110 : 175);
    const shortAnswer = answerVal.length > 25 ? answerVal.slice(0, 23) + '..' : answerVal;
    doc.text(shortAnswer, margin + 135, y + 5.5);
    doc.setFont('helvetica', 'normal');

    y += 8.2;

    // Line separation
    doc.setDrawColor(243, 244, 246);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, y, pageWidth - margin - 4, y);
  });

  y += 5;

  // Supporting Documents Section
  doc.setFillColor(243, 244, 246);
  doc.rect(margin + 4, y, contentWidth - 8, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text('SUPPORTING DOCUMENTS CHECKLIST (ధృవపత్రాల జాబితా)', margin + 6, y + 5);

  y += 8;

  template.requiredDocuments.forEach((docItem) => {
    const isReady = !!session.checklist[docItem.id];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(isReady ? 15 : 156, isReady ? 118 : 163, isReady ? 110 : 175);
    const statusMark = isReady ? '[ X ] READY' : '[   ] PENDING';
    doc.text(`${statusMark}  ${docItem.titleEn} (${docItem.titleTe})`, margin + 8, y + 4.5);
    y += 6;
  });

  y += 4;

  // Declaration box
  doc.setFillColor(254, 252, 232); // light amber
  doc.rect(margin + 4, y, contentWidth - 8, 20, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.5);
  doc.rect(margin + 4, y, contentWidth - 8, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text('DECLARATION / దరఖాస్తుదారు ధృవీకరణ:', margin + 6, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text(
    'I solemnly affirm that the particulars furnished above are true and correct to the best of my knowledge.',
    margin + 6,
    y + 10
  );
  doc.text(
    'పై పేర్కొన్న వివరాలన్నీ నా పరిజ్ఞానం మేరకు నిజమైనవని మరియు సరైనవని దీని ద్వారా ధృవీకరిస్తున్నాను.',
    margin + 6,
    y + 15
  );

  y += 24;

  // Signatures
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  doc.text('Date: ____________________', margin + 8, y + 6);
  doc.text('Place: ___________________', margin + 8, y + 12);

  doc.text('Signature / Thumb Impression of Applicant', pageWidth - margin - 8, y + 6, { align: 'right' });
  doc.text('(దరఖాస్తుదారు సంతకం / వేలిముద్ర)', pageWidth - margin - 8, y + 12, { align: 'right' });

  // Footer Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(
    'This is a demonstration application generated by సహాయక్ Telugu Voice Form Assistant. Not an official government issue.',
    pageWidth / 2,
    margin + 264,
    { align: 'center' }
  );

  // Trigger download
  const filename = `${template.titleEn.replace(/\s+/g, '_')}_${session.id.slice(0, 6)}.pdf`;
  doc.save(filename);
}
