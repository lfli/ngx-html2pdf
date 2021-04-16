import { TestBed } from '@angular/core/testing';

import { NgxHtml2pdfService } from './ngx-html2pdf.service';

describe('NgxHtml2pdfService', () => {
  let service: NgxHtml2pdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxHtml2pdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
