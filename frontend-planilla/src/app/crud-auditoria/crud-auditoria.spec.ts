import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudAuditoria } from './crud-auditoria';

describe('CrudAuditoria', () => {
  let component: CrudAuditoria;
  let fixture: ComponentFixture<CrudAuditoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudAuditoria],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudAuditoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
