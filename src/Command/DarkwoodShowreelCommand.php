<?php

namespace App\Command;

use App\Tui\DarkwoodShowreelDirector;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Tui\Tui;

#[AsCommand(
    name: 'app:darkwood:showreel',
    description: 'Play the Darkwood showreel translated into Symfony Tui.',
)]
final class DarkwoodShowreelCommand extends Command
{
    protected function configure(): void
    {
        $this
            ->addOption('duration', null, InputOption::VALUE_REQUIRED, 'Playback duration in seconds. Defaults to the full soundtrack duration.', null)
            ->addOption('loop', null, InputOption::VALUE_NONE, 'Restart automatically when the reel reaches the end.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $duration = $input->getOption('duration');
        $duration = null !== $duration ? max(15.0, (float) $duration) : DarkwoodShowreelDirector::FULL_DURATION;

        $director = new DarkwoodShowreelDirector($duration, (bool) $input->getOption('loop'));
        $tui = new Tui(styleSheet: $director->createStyleSheet());

        $director->mount($tui);

        $tui
            ->quitOn('q', 'ctrl+c')
            ->onInput(fn (string $inputData): bool => $director->handleInput($inputData, $tui))
            ->onTick(fn ($event): bool => $director->tick($event, $tui))
        ;

        $tui->run();

        return Command::SUCCESS;
    }
}
