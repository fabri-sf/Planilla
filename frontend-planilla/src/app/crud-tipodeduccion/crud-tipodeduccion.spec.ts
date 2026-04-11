import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudTipodeduccion } from './crud-tipodeduccion';

describe('CrudTipodeduccion', () => {
  let component: CrudTipodeduccion;
  let fixture: ComponentFixture<CrudTipodeduccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudTipodeduccion],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudTipodeduccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
