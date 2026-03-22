import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudBonificacionpago } from './crud-bonificacionpago';

describe('CrudBonificacionpago', () => {
  let component: CrudBonificacionpago;
  let fixture: ComponentFixture<CrudBonificacionpago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudBonificacionpago],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudBonificacionpago);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
