import { Controller, Get, Post, Body, UseGuards, Query, Param, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CorrespondenceService } from './correspondence.service';
import { CreateCorrespondenceDto } from './dto/create-correspondence.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PdfService } from '../pdf/pdf.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Correspondence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('correspondence')
export class CorrespondenceController {
  constructor(
    private readonly correspondenceService: CorrespondenceService,
    private readonly pdfService: PdfService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array.from(Array(32)).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: { type: 'string' },
        title: { type: 'string' },
        sender: { type: 'string' },
        recipient: { type: 'string' },
        docDate: { type: 'string' },
        priority: { type: 'string' },
        securityLevel: { type: 'string' },
      },
    },
  })
  create(@CurrentUser() user: any, @Body() dto: CreateCorrespondenceDto, @UploadedFile() file: Express.Multer.File) {
    // Log incoming request for debugging
    console.log('Correspondence create request', {
      user: { id: user?.id, email: user?.email, companyId: user?.companyId },
      dto,
      file: file ? { originalname: file.originalname, filename: (file as any).filename, size: file.size } : null,
    });

    return this.correspondenceService.create(user.id, user.companyId, dto, file);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.correspondenceService.findAll(user.companyId, query);
  }

  @Get(':id/print')
  async print(@CurrentUser() user: any, @Param('id') id: string, @Res() res: Response) {
    const doc = await this.correspondenceService.findOne(id, user.companyId);
    const buffer = await this.pdfService.generateReceipt(doc, doc.company);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=receipt-${doc.barcodeId}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
