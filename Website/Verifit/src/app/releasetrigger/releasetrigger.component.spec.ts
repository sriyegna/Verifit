import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleasetriggerComponent } from './releasetrigger.component';

describe('ReleasetriggerComponent', () => {
  let component: ReleasetriggerComponent;
  let fixture: ComponentFixture<ReleasetriggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleasetriggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleasetriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
