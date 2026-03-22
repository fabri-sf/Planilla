import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CRUDAsistencia } from './crud-asistencia';

describe('CRUDAsistencia', () => {
  let component: CRUDAsistencia;
  let fixture: ComponentFixture<CRUDAsistencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CRUDAsistencia],
    }).compileComponents();

    fixture = TestBed.createComponent(CRUDAsistencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
