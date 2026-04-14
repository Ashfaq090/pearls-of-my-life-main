import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-videos-map',
  templateUrl: './videos-map.component.html',
  styleUrls: ['./videos-map.component.scss'],
})
export class VideosMapComponent {
  public readonly stages = [
    { label: 'Ages 1-5 years', key: '1-5' },
    { label: 'Ages 5-10 years', key: '5-10' },
    { label: 'Ages 10-20 years', key: '10-20' },
    { label: 'Ages 20-30 years', key: '20-30' },
    { label: 'Ages 30-40 years', key: '30-40' },
    { label: 'Ages 40 and Up', key: '40+' },
    { label: 'Final Wishes', key: 'final-wishes' },
  ];
  public readonly layoutOrder = [
    '1-5',
    '5-10',
    '10-20',
    '40+',
    '30-40',
    '20-30',
    'final-wishes',
  ];
  public readonly gradientClasses = [
    'gradient-yellow-green',
    'gradient-purple-orange',
    'gradient-red-green',
    'gradient-orange-green',
    'gradient-red-pink',
    'gradient-blue',
    'gradient-yellow',
  ];
  public readonly areaMap: Record<string, string> = {
    '1-5': 'stage2',
    '5-10': 'stage1',
    '10-20': 'stage3',
    '20-30': 'stage4',
    '30-40': 'stage5',
    '40+': 'stage6',
    'final-wishes': 'stage7',
  };
  public readonly renderedStages = this.layoutOrder
    .map((key) => this.stages.find((stage) => stage.key === key))
    .filter(
      (stage): stage is { label: string; key: string } =>
        stage !== undefined,
    );

  constructor(private readonly router: Router) {}

  goToStage(stage: string): void {
    this.router.navigate(['/videos'], {
      queryParams: { stage, focus: 'record' },
    });
  }
}
