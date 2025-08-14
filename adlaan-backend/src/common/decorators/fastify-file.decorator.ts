import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const FastifyFile = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    try {
      // Handle multipart file upload with Fastify
      const data = await request.file();
      
      if (!data) {
        throw new BadRequestException('No file uploaded');
      }

      // Convert Fastify file to buffer
      const buffer = await data.toBuffer();
      
      return {
        originalname: data.filename,
        mimetype: data.mimetype,
        buffer: buffer,
        size: buffer.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to process uploaded file');
    }
  },
);

export const FastifyFileOptional = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    try {
      // Handle multipart file upload with Fastify
      const data = await request.file();
      
      if (!data) {
        return null;
      }

      // Convert Fastify file to buffer
      const buffer = await data.toBuffer();
      
      return {
        originalname: data.filename,
        mimetype: data.mimetype,
        buffer: buffer,
        size: buffer.length,
      };
    } catch (error) {
      return null;
    }
  },
);
