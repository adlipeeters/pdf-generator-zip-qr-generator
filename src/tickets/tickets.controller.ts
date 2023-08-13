import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import * as path from 'path';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { Response } from 'express';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  // @Post()
  // create(@Body() createTicketDto: CreateTicketDto) {
  //   return this.ticketsService.create(createTicketDto);
  // }

  // @Get()
  // findAll() {
  //   return this.ticketsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ticketsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
  //   return this.ticketsService.update(+id, updateTicketDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ticketsService.remove(+id);
  // }

  @Post('test-email')
  testEmail() {
    return this.ticketsService.testEmail();
  }

  @Post('generate')
  async generatePdf(): Promise<string> {
    const dataForQr = "https://example.com";
    return await this.ticketsService.generatePdfWithQR(dataForQr);
  }

  @Get('download-all')
  async downloadAllPdfs(@Res() res: Response): Promise<void> {
    const pdfsDir = path.join(__dirname, '..', '..', 'generated-pdfs');

    // Check if directory exists
    if (!fs.existsSync(pdfsDir)) {
      res.status(404).send('No generated PDFs found.');
      return;
    }

    const archive = archiver('zip');
    archive.directory(pdfsDir, false);

    res.setHeader('Content-Disposition', 'attachment; filename=generated-pdfs.zip');
    res.setHeader('Content-Type', 'application/zip');

    archive.pipe(res);
    archive.finalize();
  }
}
