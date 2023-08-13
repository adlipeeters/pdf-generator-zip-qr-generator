import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as QRCode from 'qrcode';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TicketsService {
  constructor(
    private mailerService: MailerService,
  ) { }

  create(createTicketDto: CreateTicketDto) {
    return 'This action adds a new ticket';
  }

  findAll() {
    return `This action returns all tickets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticket`;
  }

  update(id: number, updateTicketDto: UpdateTicketDto) {
    return `This action updates a #${id} ticket`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }

  async testEmail() {
    await this.mailerService.sendMail({
      to: 'adlipeeters@gmail.com',
      subject: 'Test Subject',
      template: './email-template',
      // html: `Just testing email!`,
      context: {
        name: 'test Name',
        url: 'Test url',
      },
    });
  }

  async generateQRCode(data: string): Promise<string> {
    return QRCode.toDataURL(data);
  }

  async createPdfFromHtml(html: string, pdfPath: string): Promise<void> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: pdfPath, format: 'A4' });
    await browser.close();
  }

  async generatePdfWithQR(data: string): Promise<string> {
    // Create the QR code
    const qrDataUrl = await this.generateQRCode(data);

    // Read and compile the .hbs template
    const templatePath = path.join(__dirname, '..', 'tickets', 'templates', 'qrTemplate.hbs');
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(source);
    const html = template({ qrDataUrl });

    // Check and create 'generated-pdfs' directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, '..', '..', 'generated-pdfs'))) {
      fs.mkdirSync(path.join(__dirname, '..', '..', 'generated-pdfs'));
    }

    // Set a unique name for the PDF file
    const uniqueName = `generated_ticket_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, '..', '..', 'generated-pdfs', uniqueName);

    // Generate the PDF from HTML
    await this.createPdfFromHtml(html, pdfPath);

    return pdfPath;
  }
}
