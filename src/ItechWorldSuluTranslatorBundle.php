<?php

declare(strict_types=1);

namespace ItechWorld\SuluTranslatorBundle;

use Symfony\Component\Config\Definition\Configurator\DefinitionConfigurator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

/**
 * SuluTranslatorBundle entry point.
 *
 * Provides DeepL-powered automatic translation buttons in the Sulu admin
 * for text_line, text_area and text_editor fields.
 */
class ItechWorldSuluTranslatorBundle extends AbstractBundle
{
    /**
     * Defines the bundle configuration schema.
     *
     * @param DefinitionConfigurator $definition The configuration definition
     */
    public function configure(DefinitionConfigurator $definition): void
    {
        $definition->rootNode()
            ->children()
                ->scalarNode('deepl_api_key')
                    ->isRequired()
                    ->cannotBeEmpty()
                    ->info('DeepL API key for translation service')
                ->end()
                ->arrayNode('locale_mapping')
                    ->info('Mapping from Sulu locale codes to DeepL language codes')
                    ->useAttributeAsKey('sulu_locale')
                    ->scalarPrototype()->end()
                    ->defaultValue([])
                ->end()
            ->end();
    }

    /**
     * Loads the bundle extension configuration into the DI container.
     *
     * @param array<string, mixed> $config    The resolved configuration
     * @param ContainerConfigurator $container The container configurator
     * @param ContainerBuilder     $builder   The container builder
     */
    public function loadExtension(
        array $config,
        ContainerConfigurator $container,
        ContainerBuilder $builder,
    ): void {
        $container->parameters()->set(
            'itech_world_sulu_translator.deepl_api_key',
            $config['deepl_api_key']
        );
        $container->parameters()->set(
            'itech_world_sulu_translator.locale_mapping',
            $config['locale_mapping']
        );

        $container->import('../config/services.yaml');
    }
}
