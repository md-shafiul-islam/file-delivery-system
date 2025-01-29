import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadGateway } from './file-upload.gateway';

describe('FileUploadGateway', () => {
  let gateway: FileUploadGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadGateway],
    }).compile();

    gateway = module.get<FileUploadGateway>(FileUploadGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
