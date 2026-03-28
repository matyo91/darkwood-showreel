<?php

namespace App\Tui;

use Symfony\Component\Tui\Event\TickEvent;
use Symfony\Component\Tui\Style\Align;
use Symfony\Component\Tui\Style\Border;
use Symfony\Component\Tui\Style\Direction;
use Symfony\Component\Tui\Style\Padding;
use Symfony\Component\Tui\Style\Style;
use Symfony\Component\Tui\Style\StyleSheet;
use Symfony\Component\Tui\Style\TextAlign;
use Symfony\Component\Tui\Style\VerticalAlign;
use Symfony\Component\Tui\Tui;
use Symfony\Component\Tui\Widget\ContainerWidget;
use Symfony\Component\Tui\Widget\TextWidget;

final class DarkwoodShowreelDirector
{
    public const FULL_DURATION = 497.533979;

    /**
     * @var array<string, array{start: float, end: float, index: string, label: string}>
     */
    private array $phases = [];

    private float $elapsed = 0.0;
    private bool $paused = false;
    private bool $finished = false;

    private TextWidget $brandWidget;
    private TextWidget $metaWidget;
    private TextWidget $sceneIndexWidget;
    private TextWidget $sceneLabelWidget;
    private TextWidget $sceneWindowWidget;
    private TextWidget $eyebrowWidget;
    private TextWidget $titleWidget;
    private TextWidget $bodyWidget;
    private TextWidget $panelTitleWidget;
    private TextWidget $panelBodyWidget;
    private TextWidget $panelFooterWidget;
    private TextWidget $visualizerWidget;
    private TextWidget $progressWidget;
    private TextWidget $controlsWidget;

    public function __construct(
        private readonly float $duration,
        private readonly bool $loop,
    ) {
        $scale = $this->duration / self::FULL_DURATION;

        $this->phases = [
            'opening' => ['start' => 0.0, 'end' => 80.0 * $scale, 'index' => '01', 'label' => "Plan d'ouverture"],
            'statement' => ['start' => 80.0 * $scale, 'end' => 105.0 * $scale, 'index' => '02', 'label' => 'Enterprise / precision'],
            'calibration' => ['start' => 105.0 * $scale, 'end' => 255.0 * $scale, 'index' => '03', 'label' => 'Calibration / instrumentation'],
            'rupture' => ['start' => 255.0 * $scale, 'end' => 265.0 * $scale, 'index' => '03→04', 'label' => 'Rupture / compression'],
            'assembly' => ['start' => 265.0 * $scale, 'end' => 360.0 * $scale, 'index' => '04', 'label' => 'Assemblage / orchestration'],
            'continuity' => ['start' => 360.0 * $scale, 'end' => 390.0 * $scale, 'index' => '05', 'label' => 'Continuite / automatisation'],
            'closing' => ['start' => 390.0 * $scale, 'end' => $this->duration, 'index' => '06', 'label' => 'Signature finale'],
        ];
    }

    public function createStyleSheet(): StyleSheet
    {
        $styleSheet = new StyleSheet([
            ':root' => new Style(
                padding: Padding::from([1, 2]),
                background: '#050608',
                color: '#f2eee7',
                direction: Direction::Vertical,
                gap: 1,
            ),
            '.app' => new Style(
                direction: Direction::Vertical,
                gap: 1,
            ),
            '.chrome' => new Style(
                direction: Direction::Vertical,
                gap: 1,
            ),
            '.chrome-block' => new Style(flex: 1),
            '.meta' => new Style(
                color: '#9f978b',
                textAlign: TextAlign::Right,
            ),
            '.brand' => new Style(
                color: '#c9a86a',
                bold: true,
            ),
            '.stage' => new Style(
                padding: Padding::from([1, 2]),
                border: Border::all(1, 'rounded', '#c9a86a'),
                background: '#0b0d10',
                direction: Direction::Vertical,
                gap: 1,
            ),
            '.stage-head' => new Style(
                direction: Direction::Vertical,
                gap: 0,
            ),
            '.stage-head-right' => new Style(
                color: '#8f8a82',
                textAlign: TextAlign::Right,
            ),
            '.stage-main' => new Style(
                direction: Direction::Vertical,
                gap: 1,
                verticalAlign: VerticalAlign::Center,
            ),
            '.scene-copy' => new Style(
                direction: Direction::Vertical,
                gap: 0,
                verticalAlign: VerticalAlign::Center,
                flex: 3,
            ),
            '.scene-panel' => new Style(
                direction: Direction::Vertical,
                gap: 1,
                flex: 2,
                padding: Padding::from([1]),
                border: Border::all(1, 'rounded', '#3d3423'),
                background: '#11161b',
                verticalAlign: VerticalAlign::Center,
            ),
            '.eyebrow' => new Style(
                color: '#c9a86a',
                bold: true,
            ),
            '.title' => new Style(
                color: '#f2eee7',
                bold: true,
                maxColumns: 52,
            ),
            '.body' => new Style(
                color: '#d5cec3',
                maxColumns: 62,
            ),
            '.panel-title' => new Style(
                color: '#c9a86a',
                bold: true,
            ),
            '.panel-body' => new Style(
                color: '#d5cec3',
                maxColumns: 44,
            ),
            '.panel-foot' => new Style(
                color: '#8f8a82',
                dim: true,
            ),
            '.visualizer' => new Style(
                padding: Padding::from([0, 1]),
                border: Border::all(1, 'rounded', '#3d3423'),
                color: '#c9a86a',
                background: '#0a0d10',
            ),
            '.footer' => new Style(
                direction: Direction::Vertical,
                gap: 0,
            ),
            '.footer-progress' => new Style(color: '#f2eee7'),
            '.footer-controls' => new Style(
                color: '#8f8a82',
                textAlign: TextAlign::Right,
            ),
            '.rupture-copy' => new Style(
                textAlign: TextAlign::Center,
                align: Align::Center,
            ),
        ]);

        $styleSheet->addBreakpoint(110, '.chrome', new Style(direction: Direction::Horizontal, gap: 2));
        $styleSheet->addBreakpoint(110, '.stage-head', new Style(direction: Direction::Horizontal, gap: 2));
        $styleSheet->addBreakpoint(110, '.stage-main', new Style(direction: Direction::Horizontal, gap: 2));
        $styleSheet->addBreakpoint(110, '.footer', new Style(direction: Direction::Horizontal, gap: 2));

        return $styleSheet;
    }

    public function mount(Tui $tui): void
    {
        $app = new ContainerWidget();
        $app->addStyleClass('app');
        $app->expandVertically(true);

        $chrome = new ContainerWidget();
        $chrome->addStyleClass('chrome');

        $this->brandWidget = new TextWidget('', true);
        $this->brandWidget->addStyleClass('chrome-block');
        $this->brandWidget->addStyleClass('brand');

        $this->metaWidget = new TextWidget('', false);
        $this->metaWidget->addStyleClass('chrome-block');
        $this->metaWidget->addStyleClass('meta');

        $chrome->add($this->brandWidget);
        $chrome->add($this->metaWidget);

        $stage = new ContainerWidget();
        $stage->addStyleClass('stage');
        $stage->expandVertically(true);

        $stageHead = new ContainerWidget();
        $stageHead->addStyleClass('stage-head');

        $headLeft = new ContainerWidget();
        $headLeft->addStyleClass('chrome-block');
        $headLeft->addStyleClass('stage-head-left');

        $this->sceneIndexWidget = new TextWidget('', true);
        $this->sceneIndexWidget->addStyleClass('eyebrow');

        $this->sceneLabelWidget = new TextWidget('', true);
        $this->sceneLabelWidget->addStyleClass('title');

        $headLeft->add($this->sceneIndexWidget);
        $headLeft->add($this->sceneLabelWidget);

        $this->sceneWindowWidget = new TextWidget('', false);
        $this->sceneWindowWidget->addStyleClass('chrome-block');
        $this->sceneWindowWidget->addStyleClass('stage-head-right');

        $stageHead->add($headLeft);
        $stageHead->add($this->sceneWindowWidget);

        $stageMain = new ContainerWidget();
        $stageMain->addStyleClass('stage-main');
        $stageMain->expandVertically(true);

        $sceneCopy = new ContainerWidget();
        $sceneCopy->addStyleClass('scene-copy');
        $sceneCopy->expandVertically(true);

        $this->eyebrowWidget = new TextWidget('', true);
        $this->eyebrowWidget->addStyleClass('eyebrow');

        $this->titleWidget = new TextWidget('');
        $this->titleWidget->addStyleClass('title');

        $this->bodyWidget = new TextWidget('');
        $this->bodyWidget->addStyleClass('body');

        $sceneCopy->add($this->eyebrowWidget);
        $sceneCopy->add($this->titleWidget);
        $sceneCopy->add($this->bodyWidget);

        $scenePanel = new ContainerWidget();
        $scenePanel->addStyleClass('scene-panel');
        $scenePanel->expandVertically(true);

        $this->panelTitleWidget = new TextWidget('', true);
        $this->panelTitleWidget->addStyleClass('panel-title');

        $this->panelBodyWidget = new TextWidget('');
        $this->panelBodyWidget->addStyleClass('panel-body');

        $this->panelFooterWidget = new TextWidget('', false);
        $this->panelFooterWidget->addStyleClass('panel-foot');

        $scenePanel->add($this->panelTitleWidget);
        $scenePanel->add($this->panelBodyWidget);
        $scenePanel->add($this->panelFooterWidget);

        $stageMain->add($sceneCopy);
        $stageMain->add($scenePanel);

        $this->visualizerWidget = new TextWidget('', true);
        $this->visualizerWidget->addStyleClass('visualizer');

        $footer = new ContainerWidget();
        $footer->addStyleClass('footer');

        $this->progressWidget = new TextWidget('', true);
        $this->progressWidget->addStyleClass('chrome-block');
        $this->progressWidget->addStyleClass('footer-progress');

        $this->controlsWidget = new TextWidget('', true);
        $this->controlsWidget->addStyleClass('chrome-block');
        $this->controlsWidget->addStyleClass('footer-controls');

        $footer->add($this->progressWidget);
        $footer->add($this->controlsWidget);

        $stage->add($stageHead);
        $stage->add($stageMain);
        $stage->add($this->visualizerWidget);

        $app->add($chrome);
        $app->add($stage);
        $app->add($footer);

        $tui->clear()->add($app);

        $this->renderFrame(0.0);
    }

    public function handleInput(string $input, Tui $tui): bool
    {
        $normalized = strtolower($input);

        if (' ' === $input) {
            $this->paused = !$this->paused;
            $this->finished = false;
            $tui->requestRender(true);

            return true;
        }

        if ('r' === $normalized) {
            $this->restart();
            $tui->requestRender(true);

            return true;
        }

        return false;
    }

    public function tick(TickEvent $event, Tui $tui): bool
    {
        if ($this->paused) {
            $event->setBusy(false);

            return false;
        }

        $this->elapsed = min($this->duration, $this->elapsed + $event->getDeltaTime());

        if ($this->elapsed >= $this->duration) {
            if ($this->loop) {
                $this->restart();
            } else {
                $this->elapsed = $this->duration;
                $this->finished = true;
                $this->paused = true;
            }
        }

        $this->renderFrame($this->elapsed);
        $tui->requestRender();
        $event->setBusy(!$this->paused);

        return !$this->paused;
    }

    private function restart(): void
    {
        $this->elapsed = 0.0;
        $this->paused = false;
        $this->finished = false;
        $this->renderFrame(0.0);
    }

    private function renderFrame(float $seconds): void
    {
        $phase = $this->resolvePhase($seconds);
        $phaseDuration = max(0.001, $phase['end'] - $phase['start']);
        $localProgress = max(0.0, min(1.0, ($seconds - $phase['start']) / $phaseDuration));

        $this->brandWidget->setText("DARKWOOD\nTerminal motion study");
        $this->metaWidget->setText(sprintf(
            "Soundtrack  Contraption - Higher, Forever\nDuration    %s%s",
            $this->formatClock($this->duration),
            $this->loop ? "\nMode        loop" : ''
        ));

        $this->sceneIndexWidget->setText($phase['index']);
        $this->sceneLabelWidget->setText($phase['label']);
        $this->sceneWindowWidget->setText(sprintf(
            "%s / %s\n%s → %s",
            $this->formatClock($seconds),
            $this->formatClock($this->duration),
            $this->formatClock($phase['start']),
            $this->formatClock($phase['end'])
        ));

        $scene = $this->buildScene($phase['label'], array_key_first(array_filter($this->phases, static fn (array $candidate): bool => $candidate === $phase)), $localProgress, $seconds);

        $this->eyebrowWidget->setText($scene['eyebrow']);
        $this->titleWidget->setText($scene['title']);
        $this->bodyWidget->setText($scene['body']);
        $this->panelTitleWidget->setText($scene['panelTitle']);
        $this->panelBodyWidget->setText($scene['panelBody']);
        $this->panelFooterWidget->setText($scene['panelFooter']);

        $this->visualizerWidget->setText($this->buildVisualizer($seconds, $localProgress, array_key_first(array_filter($this->phases, static fn (array $candidate): bool => $candidate === $phase))));
        $this->progressWidget->setText($this->buildProgress($seconds));
        $this->controlsWidget->setText($this->buildControls());
    }

    /**
     * @return array{start: float, end: float, index: string, label: string}
     */
    private function resolvePhase(float $seconds): array
    {
        foreach ($this->phases as $phase) {
            if ($seconds < $phase['end']) {
                return $phase;
            }
        }

        return $this->phases['closing'];
    }

    /**
     * @return array{eyebrow: string, title: string, body: string, panelTitle: string, panelBody: string, panelFooter: string}
     */
    private function buildScene(string $label, string $key, float $localProgress, float $seconds): array
    {
        return match ($key) {
            'opening' => [
                'eyebrow' => $this->revealLine('Artisanat logiciel, regle avec intention.', $localProgress),
                'title' => $this->revealLines(['Mouvement', 'enterprise,', 'sans bruit.'], $localProgress, 0.06, 0.2),
                'body' => $this->revealParagraph(
                    "Des annees d'execution condensees en controle, rythme editorial et systemes qui avancent avec certitude.",
                    $localProgress,
                    0.28
                ),
                'panelTitle' => 'Calibration',
                'panelBody' => implode("\n", [
                    '01 / 06',
                    '',
                    'Sequence integrity  '.($localProgress > 0.45 ? 'stable' : 'warming'),
                    'Signal path         '.str_repeat('█', max(1, (int) floor(6 * max(0.15, $localProgress)))),
                    'Readiness           '.str_repeat('•', max(1, (int) floor(5 * max(0.12, $localProgress)))),
                ]),
                'panelFooter' => 'Ouverture sobre. Ton premium. Systeme sous controle.',
            ],
            'statement' => [
                'eyebrow' => 'Construit sous contrainte.',
                'title' => $this->revealLines(['Aucune', 'approximation.'], $localProgress, 0.08, 0.22),
                'body' => $this->revealParagraph(
                    "Systemes complexes. Cycles longs. Exigence elevee. Le detail, la ou il n'est pas negociable.",
                    $localProgress,
                    0.24
                ),
                'panelTitle' => 'Marqueurs',
                'panelBody' => implode("\n\n", [
                    '[01] Cadence enterprise'."\n".'Delivrer sous contrainte, avec tenue.',
                    '[02] Design → implementation'."\n".'Le concept traduit avec fidelite technique.',
                    '[03] Confiance operationnelle'."\n".'Des systemes qui ne cedent pas sous pression.',
                ]),
                'panelFooter' => $label,
            ],
            'calibration' => [
                'eyebrow' => 'Mesure. Sequence. Repete.',
                'title' => $this->revealLines(['La precision devient visible', 'par la calibration.'], $localProgress, 0.05, 0.18),
                'body' => $this->revealParagraph(
                    "Instrumentation, derive de latence, verrouillage de modules: la qualite s'observe avant de se declarer.",
                    $localProgress,
                    0.22
                ),
                'panelTitle' => 'Lecture technique',
                'panelBody' => implode("\n", [
                    $this->signalLine('wide', 32, 0.78 + 0.18 * sin($seconds * 1.8)),
                    $this->signalLine('mid ', 32, 0.58 + 0.22 * sin($seconds * 2.7 + 1.2)),
                    $this->signalLine('thin', 32, 0.46 + 0.24 * sin($seconds * 3.6 + 2.1)),
                    '',
                    'Derive de latence   00.3 ms',
                    'Verrou module       nominal',
                ]),
                'panelFooter' => 'Le mouvement devient mesure. Puis preuve.',
            ],
            'rupture' => [
                'eyebrow' => 'Compression',
                'title' => $this->revealLines(['Signal sature.', 'Reassemblage imminent.'], $localProgress, 0.02, 0.2),
                'body' => $this->revealParagraph(
                    "La continuite se brise volontairement. Le systeme se compacte, coupe le confort, puis se reconstruit.",
                    $localProgress,
                    0.18
                ),
                'panelTitle' => 'Etat critique',
                'panelBody' => implode("\n", [
                    'Grid load           '.str_repeat('█', 8).' '.str_repeat('░', 2),
                    'Signal integrity    '.str_repeat('█', max(1, 8 - (int) floor($localProgress * 6))).' '.str_repeat('░', min(8, 2 + (int) floor($localProgress * 6))),
                    'Compression         '.str_repeat('█', min(10, 2 + (int) floor($localProgress * 8))),
                    '',
                    $localProgress < 0.45 ? 'Blackout partiel...' : 'Rebuild sequence armed.',
                ]),
                'panelFooter' => 'Le point de bascule du reel.',
            ],
            'assembly' => [
                'eyebrow' => 'Assemblage causal.',
                'title' => $this->revealLines(['Le systeme', 'se construit lui-meme.'], $localProgress, 0.06, 0.22),
                'body' => $this->revealParagraph(
                    "A declenche B. B declenche C. C stabilise D. Chaque module arrive comme une consequence, pas comme un effet.",
                    $localProgress,
                    0.24
                ),
                'panelTitle' => 'Modules',
                'panelBody' => implode("\n\n", [
                    $this->moduleBlock('A1', 'Structure', $localProgress >= 0.18),
                    $this->moduleBlock('B2', 'Orchestration', $localProgress >= 0.42),
                    $this->moduleBlock('C3', 'Repeatabilite', $localProgress >= 0.68),
                    $this->moduleBlock('D4', 'Validation', $localProgress >= 0.84),
                ]),
                'panelFooter' => 'Post-rupture: ordre, liens, dependances, tenue.',
            ],
            'continuity' => [
                'eyebrow' => "L'automatisation par le mouvement.",
                'title' => $this->revealLines(["Rien a expliquer.", 'Tout se ressent dans la continuite.'], $localProgress, 0.05, 0.22),
                'body' => $this->revealParagraph(
                    "Entree. Transformation. Sortie. Les etats se reforment sans friction et l'ensemble garde sa ligne.",
                    $localProgress,
                    0.22
                ),
                'panelTitle' => 'Chaine',
                'panelBody' => implode("\n", [
                    $this->chainNode('Entree', $localProgress >= 0.18),
                    $this->chainConnector($localProgress >= 0.36),
                    $this->chainNode('Transformation', $localProgress >= 0.52),
                    $this->chainConnector($localProgress >= 0.7),
                    $this->chainNode('Sortie', $localProgress >= 0.84),
                ]),
                'panelFooter' => 'Automatiser, ici, veut dire lier les passages.',
            ],
            default => [
                'eyebrow' => 'Plan final',
                'title' => $this->revealLines(['Artisanat logiciel.', 'Le savoir-faire en mouvement.'], $localProgress, 0.05, 0.24),
                'body' => $this->revealParagraph(
                    "Concu pour accueillir les medias finaux, une narration mesuree et une bande-son prete pour la capture finale.",
                    $localProgress,
                    0.22
                ),
                'panelTitle' => 'Signature',
                'panelBody' => implode("\n\n", [
                    'Inserer ici l’identite finale,',
                    'le contact ou le lockup.',
                    '',
                    'HTML / CSS / JavaScript / GSAP',
                ]),
                'panelFooter' => $this->finished ? 'Fin du reel. R pour rejouer.' : 'Le systeme retient son dernier geste.',
            ],
        };
    }

    private function buildVisualizer(float $seconds, float $localProgress, string $sceneKey): string
    {
        $characters = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
        $width = 52;
        $fade = 'closing' === $sceneKey ? 1.0 - $localProgress : 1.0;
        $intensity = match ($sceneKey) {
            'opening' => 0.42,
            'statement' => 0.55,
            'calibration' => 0.78,
            'rupture' => 0.95,
            'assembly' => 0.88,
            'continuity' => 0.62,
            'closing' => 0.34,
            default => 0.5,
        };

        $bars = '';
        for ($i = 0; $i < $width; ++$i) {
            $wave = sin($seconds * 2.1 + $i * 0.32)
                + 0.6 * sin($seconds * 5.2 - $i * 0.16)
                + 0.35 * sin($seconds * 8.0 + $i * 0.08);
            $normalized = max(0.0, min(1.0, (($wave / 1.95) + 0.5) * $intensity * $fade));
            $bars .= $characters[(int) round($normalized * (\count($characters) - 1))];
        }

        return sprintf('Signal  %s', $bars);
    }

    private function buildProgress(float $seconds): string
    {
        $width = 34;
        $ratio = max(0.0, min(1.0, $seconds / $this->duration));
        $filled = (int) round($ratio * $width);
        $bar = str_repeat('█', $filled).str_repeat('░', max(0, $width - $filled));

        return sprintf(
            'Progress [%s] %s / %s',
            $bar,
            $this->formatClock($seconds),
            $this->formatClock($this->duration)
        );
    }

    private function buildControls(): string
    {
        if ($this->finished) {
            return 'FIN  ·  R replay  ·  Q quit';
        }

        if ($this->paused) {
            return 'PAUSE  ·  SPACE resume  ·  R restart  ·  Q quit';
        }

        return 'SPACE pause  ·  R restart  ·  Q quit';
    }

    private function revealLine(string $text, float $progress): string
    {
        if ($progress <= 0.0) {
            return '';
        }

        $length = mb_strlen($text);
        $visibleLength = max(1, (int) floor($length * min(1.0, $progress)));

        return mb_substr($text, 0, $visibleLength);
    }

    /**
     * @param string[] $lines
     */
    private function revealLines(array $lines, float $progress, float $start, float $stagger): string
    {
        $revealed = [];

        foreach ($lines as $index => $line) {
            $lineProgress = ($progress - ($start + $index * $stagger)) / max(0.01, $stagger);
            if ($lineProgress > 0.0) {
                $revealed[] = $this->revealLine($line, $lineProgress);
            }
        }

        return implode("\n", $revealed);
    }

    private function revealParagraph(string $text, float $progress, float $start): string
    {
        $paragraphProgress = max(0.0, min(1.0, ($progress - $start) / max(0.01, 1.0 - $start)));

        return $this->revealLine($text, $paragraphProgress);
    }

    private function signalLine(string $label, int $width, float $level): string
    {
        $filled = max(1, min($width, (int) round($width * max(0.0, min(1.0, $level)))));

        return sprintf('%s  %s%s', strtoupper($label), str_repeat('█', $filled), str_repeat('░', max(0, $width - $filled)));
    }

    private function moduleBlock(string $index, string $title, bool $active): string
    {
        $marker = $active ? '●' : '○';
        $state = $active ? 'online' : 'waiting';

        return sprintf('[%s] %s  %s'."\n".'state  %s', $index, $marker, $title, $state);
    }

    private function chainNode(string $label, bool $active): string
    {
        return sprintf('%s %s', $active ? '●' : '○', $label);
    }

    private function chainConnector(bool $active): string
    {
        return $active ? '    ─────────▶' : '    ─────────·';
    }

    private function formatClock(float $seconds): string
    {
        $seconds = max(0.0, $seconds);
        $minutes = (int) floor($seconds / 60);
        $remainder = (int) floor($seconds % 60);

        return sprintf('%02d:%02d', $minutes, $remainder);
    }
}
